import { NextResponse } from "next/server"
import Stripe from "stripe"
import { z } from "zod"

import { requireAuth } from "@/lib/auth"
import { checkRateLimit } from "@/lib/chat/rate-limit"
import { getClientIp } from "@/lib/get-client-ip"
import { stripe } from "@/lib/stripe"

// =============================================================================
// POST /api/billing-portal-deep-link
// =============================================================================
// Creates a Stripe Billing Portal session with an optional flow_data param so
// the portal opens directly on a specific section (payment-method update,
// subscription cancellation, or the default landing). Used by /app/billing,
// the customer dashboard billing page.
//
// Differences from /api/billing-portal:
//   - /api/billing-portal uses a Stripe session_id as a bearer token (for the
//     onboarding chat flow). Do NOT touch that route.
//   - This route authenticates via the /app session (requireAuth) and
//     deep-links into a specific portal flow.
// =============================================================================

export const runtime = "nodejs"

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://yourshopfront.com"

const FlowSchema = z.object({
  flow: z.enum(["payment_method_update", "subscription_cancel", "default"]),
})

export async function POST(req: Request) {
  // --- Rate limit ---
  const ip = getClientIp(req)
  const { ok, retryAfterSeconds } = checkRateLimit(
    `billing-deep-link:${ip}`,
    5
  )
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    )
  }

  // --- Auth (STREAM-A-DEPENDENCY) ---
  // Redirects to /login when unauthenticated; never returns normally in that case.
  const { customer } = await requireAuth()

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

  const parsed = FlowSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      },
      { status: 400 }
    )
  }

  const { flow } = parsed.data

  // --- Build flow_data ---
  // flow === "default" leaves flowData undefined so the portal opens on its
  // default page. Stripe v22 / BillingPortal.SessionCreateParams.FlowData.
  // Extract the flow_data type from the create params shape rather than
  // navigating through the nested namespace (which TypeScript can't resolve
  // as a type when SessionCreateParams is declared both as interface and
  // namespace in stripe-node's CJS types).
  type FlowData = NonNullable<Stripe.BillingPortal.SessionCreateParams["flow_data"]>
  let flowData: FlowData | undefined

  if (flow === "payment_method_update") {
    flowData = { type: "payment_method_update" }
  } else if (flow === "subscription_cancel") {
    // Verify an active subscription exists before deep-linking into the
    // cancellation flow. Without this check the portal would open with an
    // empty cancellation view. We return 409 so the UI shows a clear
    // "no active subscription" message.
    let subId: string | null = null
    try {
      const subs = await stripe().subscriptions.list({
        customer: customer.stripe_customer_id,
        status: "active",
        limit: 1,
      })
      subId = subs.data[0]?.id ?? null
    } catch (stripeErr) {
      const err = stripeErr as { code?: string; message?: string; type?: string }
      console.error(
        "[billing-portal-deep-link] stripe subscriptions.list failed",
        {
          code: err.code,
          message: err.message,
          type: err.type,
          customerId: customer.id,
        }
      )
      return NextResponse.json(
        { ok: false, error: "stripe_unavailable" },
        { status: 502 }
      )
    }

    if (!subId) {
      return NextResponse.json(
        { ok: false, error: "no_active_subscription" },
        { status: 409 }
      )
    }

    flowData = {
      type: "subscription_cancel",
      subscription_cancel: { subscription: subId },
    }
  }

  // --- Create Stripe Billing Portal session ---
  try {
    const portalParams: Stripe.BillingPortal.SessionCreateParams = {
      customer: customer.stripe_customer_id,
      // SITE_URL is a static env var with no user-controlled segments —
      // no additional URL encoding needed.
      return_url: `${SITE_URL}/app/billing`,
      ...(flowData !== undefined ? { flow_data: flowData } : {}),
    }

    const portal = await stripe().billingPortal.sessions.create(portalParams)
    return NextResponse.json({ ok: true, url: portal.url })
  } catch (stripeErr) {
    // Sanitize: log full Stripe error server-side; return a generic client
    // message. Stripe errors can contain customer ids and internal config
    // that must not reach the browser.
    const err = stripeErr as { code?: string; message?: string; type?: string }
    console.error(
      "[billing-portal-deep-link] stripe billingPortal.sessions.create failed",
      {
        code: err.code,
        message: err.message,
        type: err.type,
        flow,
        customerId: customer.id,
      }
    )
    return NextResponse.json(
      { ok: false, error: "stripe_unavailable" },
      { status: 502 }
    )
  }
}
