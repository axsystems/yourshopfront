import "server-only"

import { NextResponse } from "next/server"
import { z } from "zod"

import { checkRateLimit, pruneExpired } from "@/lib/chat/rate-limit"
import { sendLeadNotificationEmail } from "@/lib/email"
import { getClientIp } from "@/lib/get-client-ip"
import { createLead, getLeadNotificationRecipient } from "@/lib/leads"
import {
  computeCalculatorEstimate,
  MAX_CALCULATOR_UNITS,
} from "@/lib/site-content/types"
import { getSiteByProvisionSlug, type Site, type SiteStatus } from "@/lib/supabase"

// =============================================================================
// POST /api/leads — visitor lead capture on delivered tenant sites
// =============================================================================
// Public and unauthenticated by design: the whole point is that a stranger
// on a customer's subdomain can leave their details.
//
// Two things the client is NOT trusted with:
//
//   1. Which site the lead belongs to. The payload carries a *slug*, which
//      is public (it is the subdomain). The row id used for the insert is
//      the one `getSiteByProvisionSlug` returns. A client that could name a
//      site_id could write leads into any other business's inbox.
//   2. The estimate. The number in the payload would be whatever the
//      visitor's devtools said. The stored figure is recomputed here from
//      the site's own site_content.calculator config.
// =============================================================================

/** Requests per minute per IP. Tight: every accepted lead fans out to
 * Resend, and a tenant form is an open, unauthenticated endpoint. */
const MAX_REQUESTS_PER_MINUTE = 5

/** Statuses whose tenant page actually renders — see src/app/tenant/page.tsx.
 * A cancelled or still-building site has no live form, so a submission
 * claiming to come from one did not come from our UI. */
const LEAD_ACCEPTING_STATUSES: readonly SiteStatus[] = [
  "awaiting_approval",
  "live",
]

const LeadSchema = z
  .object({
    /** Public subdomain slug. Resolved server-side to the real site row. */
    siteSlug: z.string().trim().min(1).max(120),
    // No CR/LF: this lands in the notification email's subject line and in a
    // line-delimited body, where an interior newline lets a stranger author
    // lines the owner reads as system-generated. .trim() only strips ends.
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(120)
      .regex(/^[^\r\n]*$/, "Name cannot contain line breaks"),
    email: z
      .string()
      .trim()
      .email("Enter a valid email")
      .max(254)
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .trim()
      .min(7, "Phone is too short")
      .max(40)
      .regex(/^[\d+()\-.\s]+$/, "Use digits, spaces, and -/+/() only")
      .optional()
      .or(z.literal("")),
    message: z.string().trim().max(2000).optional().or(z.literal("")),
    /** Where the form was submitted from. Free text for the owner to read.
     * Newline-free for the same reason as `name` — and this one renders
     * near the server-computed estimate, so a forged line is worse. */
    sourcePage: z
      .string()
      .trim()
      .max(200)
      .regex(/^[^\r\n]*$/, "Invalid source")
      .optional()
      .or(z.literal("")),
    /** Present only when the site has a calculator and the visitor used it. */
    calculator: z
      .object({
        // Integer: the estimator's stepper and slider only ever emit whole
        // units, and a fractional count produces an estimate with more
        // precision than numeric(12,2) can store.
        units: z
          .number()
          .int("Enter a whole number of units")
          .min(0, "Enter a number of units")
          .max(MAX_CALCULATOR_UNITS, "That number is too large"),
      })
      .optional(),
  })
  // Mirrors the leads_contact_method_present CHECK in 0014_leads.sql. Without
  // this the DB would reject the row with a 500; here the visitor gets a 400
  // they can act on.
  .refine((d) => Boolean(d.email) || Boolean(d.phone), {
    message: "Add an email address or a phone number so we can reply.",
    path: ["email"],
  })

type LeadInput = z.infer<typeof LeadSchema>

export async function POST(req: Request): Promise<NextResponse> {
  // Probabilistic prune so the in-memory bucket map doesn't grow unbounded.
  // Same 5% as /api/contact and /api/chat.
  if (Math.random() < 0.05) pruneExpired()

  // Process-local, in-memory limiter: each serverless instance keeps its own
  // counters, so the effective ceiling is higher than the number below. This
  // is abuse/cost prevention, not a security control.
  const ip = getClientIp(req)
  const limit = checkRateLimit(`leads:${ip}`, MAX_REQUESTS_PER_MINUTE)
  if (!limit.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many requests. Try again in a moment.",
        retryAfterSeconds: limit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = LeadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Validation failed",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 }
    )
  }
  const data = parsed.data

  // ---------------------------------------------------------------------
  // Site resolution. Anything the client said about identity stops here.
  // ---------------------------------------------------------------------
  let site: Site | null
  try {
    site = await getSiteByProvisionSlug(data.siteSlug)
  } catch (err) {
    console.error("[leads] site lookup failed", {
      slug: data.siteSlug,
      err: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 503 }
    )
  }
  // The lead form ships inside <CustomerEstimator>, which customer-home.tsx
  // renders only when `content.calculator && siteSlug`. Mirroring that
  // condition here is what keeps the endpoint from accepting submissions for
  // owners who never turned the feature on — they would otherwise receive
  // "New lead" mail from a form that is not on their site. Folded into the
  // same branch as the status check so the body is byte-identical to the
  // unknown-slug rejection: a distinct response would turn this into an
  // oracle for which sites have an estimator configured.
  const calculator = site?.site_content?.calculator
  if (
    !site ||
    !LEAD_ACCEPTING_STATUSES.includes(site.status) ||
    !calculator
  ) {
    return NextResponse.json(
      { ok: false, error: "This form is not accepting submissions." },
      { status: 404 }
    )
  }

  // ---------------------------------------------------------------------
  // Estimate. Recomputed from the site's stored config; the client never
  // sends a dollar figure, only a unit count.
  // ---------------------------------------------------------------------
  const estimate = data.calculator
    ? computeCalculatorEstimate(calculator, data.calculator.units)
    : null
  const calculatorInput = data.calculator
    ? { units: data.calculator.units, unitLabel: calculator.unitLabel }
    : {}

  const result = await createLead({
    site_id: site.id,
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    message: data.message || null,
    source_page: data.sourcePage || null,
    calculator_input: calculatorInput,
    calculator_estimate: estimate,
  })

  if (result.outcome === "failed") {
    // The detail is already logged inside createLead. Never echo a DB
    // message to the visitor.
    return NextResponse.json(
      {
        ok: false,
        error: "We couldn't save that. Please try again, or call us directly.",
      },
      { status: 503 }
    )
  }

  // Best-effort notification. A mail failure must never turn a saved lead
  // into an error the visitor sees — including the logged_only case, where
  // the row isn't in the DB but the email still reaches the owner.
  await notifyOwner(site, data, estimate, calculatorInput).catch((err) => {
    console.warn("[leads] owner notification failed", err)
  })

  return NextResponse.json({ ok: true, estimate })
}

async function notifyOwner(
  site: Site,
  data: LeadInput,
  estimate: number | null,
  calculatorInput: Record<string, unknown>
): Promise<void> {
  const to = await getLeadNotificationRecipient(site)
  await sendLeadNotificationEmail({
    to,
    businessName: site.business_name,
    leadName: data.name,
    leadEmail: data.email || null,
    leadPhone: data.phone || null,
    message: data.message || null,
    sourcePage: data.sourcePage || null,
    calculatorInput,
    calculatorEstimate: estimate,
  })
}
