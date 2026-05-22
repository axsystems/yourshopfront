import { NextResponse } from "next/server"
import { z } from "zod"

import { checkRateLimit } from "@/lib/chat/rate-limit"
import { getClientIp } from "@/lib/get-client-ip"
import { stripe } from "@/lib/stripe"
import { getSiteByStripeSessionId, supabase } from "@/lib/supabase"
import type { Customer, Site } from "@/lib/supabase"

// =============================================================================
// POST /api/billing-portal
// =============================================================================
// Creates a Stripe Billing Portal session for the customer associated with the
// given checkout session id, then returns the hosted-portal URL. The client
// navigates the browser to that URL. Customer manages payment methods,
// cancels subscriptions, and downloads invoices on Stripe's hosted UI.
//
// Auth: session_id in the request body resolves to a site row, matching the
// same bearer-token pattern used by /api/refund-request, /api/upload/sign,
// and /api/checkout/copy-upgrade.
//
// Prerequisite: Customer Portal must be configured ONCE in the Stripe
// Dashboard (Settings → Billing → Customer portal). See LAUNCH-CHECKLIST.md
// "Stripe Customer Portal config" section. Without that config, Stripe
// returns an error and this route responds with 502.
// =============================================================================

export const runtime = "nodejs"

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://yourshopfront.com"

const Schema = z.object({
  sessionId: z.string().min(20).max(200),
})

export async function POST(req: Request) {
  // Declared here so the outer catch block can include them in error context.
  let site: Site | null = null
  let sessionId = ""

  try {
    // --- Rate limit ---
    const ip = getClientIp(req)
    const { ok, retryAfterSeconds } = checkRateLimit(
      `billing-portal:${ip}`,
      5
    )
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "rate_limited" },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      )
    }

    // --- Parse + validate body ---
    let json: unknown
    try {
      json = await req.json()
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body." },
        { status: 400 }
      )
    }

    const parsed = Schema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message ?? "Invalid input.",
        },
        { status: 400 }
      )
    }

    sessionId = parsed.data.sessionId

    // --- Look up site by session id (bearer token) ---
    try {
      site = await getSiteByStripeSessionId(sessionId)
    } catch (err) {
      console.error("[billing-portal] supabase site lookup failed", err)
      return NextResponse.json(
        { ok: false, error: "internal" },
        { status: 500 }
      )
    }

    if (!site) {
      return NextResponse.json(
        { ok: false, error: "session_not_found" },
        { status: 404 }
      )
    }

    // --- Look up customer (inline pattern, matches /api/refund-request) ---
    const { data: customerRow, error: customerError } = await supabase()
      .from("customers")
      .select("*")
      .eq("id", site.customer_id)
      .maybeSingle()

    if (customerError) {
      console.error(
        "[billing-portal] supabase customer lookup failed",
        customerError
      )
      return NextResponse.json(
        { ok: false, error: "internal" },
        { status: 500 }
      )
    }

    const customer = (customerRow as Customer | null) ?? null
    if (!customer) {
      // Data integrity issue — site row exists but customer is gone.
      console.error(
        "[billing-portal] customer row missing for site",
        site.id
      )
      return NextResponse.json(
        { ok: false, error: "internal" },
        { status: 500 }
      )
    }

    if (!customer.stripe_customer_id) {
      // Should be impossible — webhook always populates this on create.
      console.error(
        "[billing-portal] customer has no stripe_customer_id",
        { customerId: customer.id, siteId: site.id }
      )
      return NextResponse.json(
        { ok: false, error: "internal" },
        { status: 500 }
      )
    }

    // --- Create Stripe Billing Portal session ---
    try {
      const portal = await stripe().billingPortal.sessions.create({
        customer: customer.stripe_customer_id,
        return_url: `${SITE_URL}/onboarding?session_id=${sessionId}`,
      })
      return NextResponse.json({ ok: true, url: portal.url })
    } catch (stripeErr) {
      // Sanitize: log full Stripe error server-side, return generic message
      // to client. Stripe errors can contain sensitive context (customer
      // ids, internal config) we don't want leaking to the browser.
      const errObj = stripeErr as {
        code?: string
        message?: string
        type?: string
      }
      console.error("[billing-portal] stripe failure", {
        code: errObj.code,
        message: errObj.message,
        type: errObj.type,
        siteId: site.id,
        sessionIdSuffix: sessionId.slice(-12),
      })
      return NextResponse.json(
        { ok: false, error: "stripe_unavailable" },
        { status: 502 }
      )
    }
  } catch (error) {
    // Sentry is not yet installed in this repo (tracked in
    // docs/launch-audit). Log structured context so Vercel function logs
    // are searchable; swap for Sentry.captureException once @sentry/nextjs
    // is wired in.
    console.error("[billing-portal] unhandled error", {
      route: "/api/billing-portal",
      action: "create",
      siteId: site?.id,
      sessionIdSuffix: sessionId.slice(-12),
      error,
    })
    return NextResponse.json(
      { ok: false, error: "internal" },
      { status: 500 }
    )
  }
}
