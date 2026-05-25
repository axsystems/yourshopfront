import { NextResponse } from "next/server"
import { z } from "zod"

import { checkRateLimit } from "@/lib/chat/rate-limit"
import { getClientIp } from "@/lib/get-client-ip"
import { getCustomerById, getSiteByStripeSessionId } from "@/lib/supabase"
import { notifySlack } from "@/lib/notify"
import type { Customer, Site } from "@/lib/supabase"

// =============================================================================
// POST /api/refund-request
// =============================================================================
// Customer self-serve refund eligibility check. Validates the request,
// resolves the site via the original Stripe session id (bearer token), checks
// email, computes eligibility against the live refund policy, fires a Slack
// notification to the operator, and returns the eligibility result +
// customer-facing message.
//
// DOES NOT call the Stripe refund API — operator processes refunds manually.
//
// Auth: session_id in the request body resolves to a site row, matching the
// same bearer-token pattern used by /api/upload/sign and
// /api/checkout/copy-upgrade.
// =============================================================================

export const runtime = "nodejs"

const Schema = z.object({
  sessionId: z.string().min(20).max(200),
  reason: z.enum(["changed_mind", "service_issue", "billing_issue", "other"]),
  reasonDetail: z.string().min(10).max(2000),
  confirmEmail: z.string().email().max(254),
})

// ---------------------------------------------------------------------------
// Eligibility types
// ---------------------------------------------------------------------------

interface EligibilityLine {
  eligible: boolean
  reason: string
}

interface Eligibility {
  setupFee?: EligibilityLine      // subscription only
  monthly?: EligibilityLine       // subscription only
  oneTimeBuild?: EligibilityLine  // onetime only
  copyAddon?: EligibilityLine     // if copy_addon === true
  hostingAddon?: EligibilityLine  // if hosting_addon === true
  anyEligible: boolean
}

// ---------------------------------------------------------------------------
// Policy helpers
// ---------------------------------------------------------------------------

const MS_30_DAYS = 30 * 24 * 60 * 60 * 1000

function computeEligibility(site: Site): Eligibility {
  const result: Eligibility = { anyEligible: false }

  if (site.tier === "subscription") {
    // --- Setup fee ($299 / $99 promo) ---
    // Refundable BEFORE content worksheet is submitted.
    const worksheetSubmitted = site.onboarding_state.content_sent?.complete === true
    const setupFeeEligible = !worksheetSubmitted
    result.setupFee = {
      eligible: setupFeeEligible,
      reason: setupFeeEligible
        ? "Content worksheet not yet submitted — setup fee is still refundable."
        : "Content worksheet has been submitted. Our team has started building, so the setup fee is non-refundable.",
    }

    // --- Monthly subscription ($149/mo / $99 promo) ---
    // First month refundable within 30 days of first charge (created_at).
    const purchasedAt = new Date(site.created_at).getTime()
    const withinFirstMonth = Date.now() - purchasedAt <= MS_30_DAYS
    result.monthly = {
      eligible: withinFirstMonth,
      reason: withinFirstMonth
        ? "Within 30 days of first charge — first month is refundable."
        : "Past 30 days from first charge. Monthly payments are non-refundable after the first month, but you can cancel any time.",
    }
  }

  if (site.tier === "onetime") {
    // --- One-time build ($997) ---
    // Refundable within 30 days from purchase UNLESS source code received OR
    // customer pointed their own domain.
    // Signal for "delivered": custom domain pointed OR live_at > 30 days ago.
    const purchasedAt = new Date(site.created_at).getTime()
    const customDomainPointed =
      site.onboarding_state.domain?.type === "custom" &&
      site.onboarding_state.domain?.complete === true

    const liveAt = site.provisioning_state.live_at
      ? new Date(site.provisioning_state.live_at).getTime()
      : null
    const liveMoreThan30DaysAgo =
      liveAt !== null && Date.now() - liveAt > MS_30_DAYS

    const delivered = customDomainPointed || liveMoreThan30DaysAgo
    const withinWindow = Date.now() - purchasedAt <= MS_30_DAYS

    const oneTimeBuildEligible = !delivered && withinWindow

    let oneTimeBuildReason: string
    if (delivered) {
      oneTimeBuildReason = customDomainPointed
        ? "Custom domain has been pointed — source code is considered delivered. Payment is final."
        : "Site has been live for more than 30 days. Payment is final."
    } else if (!withinWindow) {
      oneTimeBuildReason = "More than 30 days since purchase. The refund window has closed."
    } else {
      oneTimeBuildReason = "Within 30 days of purchase and site not yet delivered — eligible for refund."
    }

    result.oneTimeBuild = {
      eligible: oneTimeBuildEligible,
      reason: oneTimeBuildReason,
    }

    // --- Hosting addon ($49/mo) — same rules as subscription monthly ---
    if (site.hosting_addon) {
      const purchasedAtAddon = new Date(site.created_at).getTime()
      const withinFirstMonthAddon = Date.now() - purchasedAtAddon <= MS_30_DAYS
      result.hostingAddon = {
        eligible: withinFirstMonthAddon,
        reason: withinFirstMonthAddon
          ? "Within 30 days of first charge — hosting addon first month is refundable."
          : "Past 30 days from first charge. Hosting addon is non-refundable after the first month, but cancellable any time.",
      }
    }
  }

  // --- Copy addon ($199) ---
  // Refundable until copy drafting starts. Signal: site_content.hero is
  // missing or has no headline (copy hasn't been written in yet).
  if (site.copy_addon) {
    const heroHeadline = site.site_content.hero?.headline?.trim()
    const copyDraftingStarted = Boolean(heroHeadline)
    result.copyAddon = {
      eligible: !copyDraftingStarted,
      reason: !copyDraftingStarted
        ? "Copy drafting has not started yet — copy addon is refundable."
        : "Copy has been drafted for your site. Copy addon is non-refundable once drafting begins.",
    }
  }

  result.anyEligible =
    (result.setupFee?.eligible ?? false) ||
    (result.monthly?.eligible ?? false) ||
    (result.oneTimeBuild?.eligible ?? false) ||
    (result.copyAddon?.eligible ?? false) ||
    (result.hostingAddon?.eligible ?? false)

  return result
}

// ---------------------------------------------------------------------------
// Slack message builder
// ---------------------------------------------------------------------------

function buildSlackMessage(
  site: Site,
  customer: Customer,
  reason: string,
  reasonDetail: string,
  sessionId: string,
  eligibility: Eligibility
): string {
  const lines: string[] = [
    "🛟 *Refund request submitted*",
    `${site.business_name} · ${customer.email}`,
    `Reason: ${reason} — ${reasonDetail.slice(0, 300)}`,
    "Eligibility:",
  ]

  if (eligibility.setupFee !== undefined) {
    lines.push(
      `  Setup fee:     ${eligibility.setupFee.eligible ? "✓" : "✗"} — ${eligibility.setupFee.reason}`
    )
  }
  if (eligibility.monthly !== undefined) {
    lines.push(
      `  Monthly:       ${eligibility.monthly.eligible ? "✓" : "✗"} — ${eligibility.monthly.reason}`
    )
  }
  if (eligibility.oneTimeBuild !== undefined) {
    lines.push(
      `  One-time:      ${eligibility.oneTimeBuild.eligible ? "✓" : "✗"} — ${eligibility.oneTimeBuild.reason}`
    )
  }
  if (eligibility.copyAddon !== undefined) {
    lines.push(
      `  Copy addon:    ${eligibility.copyAddon.eligible ? "✓" : "✗"} — ${eligibility.copyAddon.reason}`
    )
  }
  if (eligibility.hostingAddon !== undefined) {
    lines.push(
      `  Hosting addon: ${eligibility.hostingAddon.eligible ? "✓" : "✗"} — ${eligibility.hostingAddon.reason}`
    )
  }

  lines.push(
    `Session: ...${sessionId.slice(-12)}`,
    `Site ID: ${site.id}`,
    "Action: review in Stripe Dashboard → click Refund if eligible."
  )

  return lines.join("\n")
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  // Declared here so the outer catch block can include them in error context.
  let site: Site | null = null
  let sessionId = ""

  try {
    // --- Rate limit ---
    const ip = getClientIp(req)
    const { ok, retryAfterSeconds } = checkRateLimit(`refund-request:${ip}`, 3)
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

    const { sessionId: sid, reason, reasonDetail, confirmEmail } = parsed.data
    sessionId = sid

    // --- Look up site by session id (bearer token) ---
    try {
      site = await getSiteByStripeSessionId(sessionId)
    } catch (err) {
      console.error("[refund-request] supabase site lookup failed", err)
      return NextResponse.json(
        { ok: false, error: "Lookup failed." },
        { status: 500 }
      )
    }

    if (!site) {
      return NextResponse.json(
        { ok: false, error: "session_not_found" },
        { status: 404 }
      )
    }

    // --- Look up customer ---
    let customer: Customer | null = null
    try {
      customer = await getCustomerById(site.customer_id)
    } catch (err) {
      console.error("[refund-request] supabase customer lookup failed", err)
      return NextResponse.json(
        { ok: false, error: "internal" },
        { status: 500 }
      )
    }
    if (!customer) {
      // Data integrity issue — site row exists but customer is gone.
      console.error("[refund-request] customer row missing for site", site.id)
      return NextResponse.json(
        { ok: false, error: "internal" },
        { status: 500 }
      )
    }

    // --- Email confirmation check ---
    const normalizedConfirm = confirmEmail.toLowerCase().trim()
    const normalizedStored = customer.email.toLowerCase().trim()

    if (normalizedConfirm !== normalizedStored) {
      return NextResponse.json(
        {
          ok: false,
          error: "email_mismatch",
          message: "The confirmation email doesn't match the email on the purchase.",
        },
        { status: 403 }
      )
    }

    // --- Compute eligibility ---
    const eligibility = computeEligibility(site)

    // --- Slack notification (best-effort, never blocks response) ---
    try {
      const message = buildSlackMessage(
        site,
        customer,
        reason,
        reasonDetail,
        sessionId,
        eligibility
      )
      await notifySlack(message)
    } catch (slackErr) {
      console.warn("[refund-request] slack notify failed", slackErr)
    }

    // --- Customer-facing message ---
    const message = eligibility.anyEligible
      ? "Got it. Our team is reviewing your refund request and will process it within 1 business day. If approved, you'll see the refund on your card within 5-10 business days. If we need any clarification, we'll reach out to you directly."
      : "Per our refund policy, this purchase is past the refundable window. We've still flagged your request for our team — if there's an exceptional circumstance, reply to your welcome email with details and we'll review case-by-case."

    return NextResponse.json({ ok: true, eligibility, message })
  } catch (error) {
    // Sentry is not yet installed in this repo (tracked in docs/launch-audit).
    // Log structured context so Vercel function logs are searchable; swap for
    // Sentry.captureException once @sentry/nextjs is wired in.
    console.error("[refund-request] unhandled error", {
      route: "/api/refund-request",
      action: "submit",
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
