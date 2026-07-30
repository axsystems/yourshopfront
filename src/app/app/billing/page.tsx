import type { Metadata } from "next"

import { requireAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import type { Site } from "@/lib/supabase"
import { HOSTING_ADDON, ONE_TIME } from "@/lib/pricing-constants"

import { BillingActions } from "./billing-actions"

// =============================================================================
// /app/billing — Customer billing dashboard
// =============================================================================
// Server component. Calls requireAuth() to get the authed customer, fetches
// their most-recent site from Supabase, and renders plan details + action
// buttons. Stream B owns the /app layout shell; this page renders inside it.
// =============================================================================

export const metadata: Metadata = {
  title: "Billing",
  description: "Manage your subscription and payment method.",
  robots: { index: false, follow: false },
}

// Don't cache — billing status can change on every Stripe webhook.
export const dynamic = "force-dynamic"

export default async function BillingPage() {
  const { customer } = await requireAuth()

  // Fetch the customer's most-recent site (by created_at descending).
  // Most customers have exactly one site at launch. If a customer has
  // multiple, the newest one governs the billing display.
  let site: Site | null = null
  try {
    const { data, error } = await supabase()
      .from("sites")
      .select("*")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    site = (data as Site | null) ?? null
  } catch (err) {
    console.error("[billing] supabase site lookup failed", err)
    return <BillingError />
  }

  // A customer with no site row is a data-integrity edge case (Stripe webhook
  // may not have fired yet). Show a soft error — don't expose internals.
  if (!site) {
    return <BillingNoSite />
  }

  // Plan label and monthly description.
  //
  // NOTE: the `sites` row doesn't record which price the customer actually
  // agreed to (standard vs. launch-promo, or which month of a promo they're
  // in) — that only lives in Stripe. So the subscription label intentionally
  // omits a dollar figure rather than guess; "View invoices" below opens the
  // Stripe portal, which has the real number. The one-time price and the
  // hosting add-on price are NOT promo-affected, so those stay literal.
  const planLine =
    site.tier === "subscription"
      ? "Subscription plan"
      : `One-time build — ${ONE_TIME}`

  const hostingLine =
    site.hosting_addon ? ` + ${HOSTING_ADDON} hosting` : null

  // Show "Cancel subscription" when the customer has a recurring charge:
  //   - subscription tier always has a recurring sub (rate depends on promo status)
  //   - one-time tier with hosting_addon has the recurring hosting sub
  // For the default flow the server-side cancel endpoint also does a live
  // Stripe API check and returns 409 if no active sub exists — so this flag
  // is for render-gating only, not security.
  const showCancelButton =
    site.tier === "subscription" ||
    (site.tier === "onetime" && site.hosting_addon)

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-apx-ink">
        Billing
      </h1>

      {/* Card 1 — Current plan */}
      <section
        aria-labelledby="plan-heading"
        className="mt-6 rounded-2xl border border-apx-line bg-apx-paper p-6"
      >
        <h2
          id="plan-heading"
          className="text-xs font-bold uppercase tracking-widest text-apx-mute"
        >
          Current plan
        </h2>
        <p className="mt-2 text-lg font-semibold text-apx-ink">
          {planLine}
          {hostingLine && (
            <span className="ml-1 font-normal text-apx-mute">
              {hostingLine}
            </span>
          )}
        </p>
        <p className="mt-1 text-sm text-apx-mute">
          {site.business_name}
        </p>
      </section>

      {/* Card 2 — Actions */}
      <section
        aria-labelledby="actions-heading"
        className="mt-4 rounded-2xl border border-apx-line bg-apx-paper p-6"
      >
        <h2
          id="actions-heading"
          className="text-xs font-bold uppercase tracking-widest text-apx-mute"
        >
          Manage billing
        </h2>
        <div className="mt-4">
          {/* BillingActions is a client component — handles fetch + loading */}
          <BillingActions showCancelButton={showCancelButton} />
        </div>
      </section>

      {/* Card 3 — Refund */}
      <section
        aria-labelledby="refund-heading"
        className="mt-4 rounded-2xl border border-apx-line bg-apx-paper p-6"
      >
        <h2
          id="refund-heading"
          className="text-xs font-bold uppercase tracking-widest text-apx-mute"
        >
          Refunds
        </h2>
        <p className="mt-2 text-sm text-apx-mute">
          Need a refund?{" "}
          <a
            href="mailto:hello@yourshopfront.com?subject=Refund%20request"
            className="font-medium text-apx-ink underline underline-offset-2 hover:text-apx-primary"
          >
            Email hello@yourshopfront.com
          </a>{" "}
          and we&apos;ll get back to you within one business day.
        </p>
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Error fallback components (inline — simple enough not to need their own files)
// ---------------------------------------------------------------------------

function BillingError() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-apx-ink">
        Billing
      </h1>
      <div className="mt-6 rounded-2xl border border-apx-line bg-apx-paper p-6">
        <p className="text-sm text-apx-mute">
          We couldn&apos;t load your billing information right now. Please
          refresh the page, or email{" "}
          <a
            href="mailto:hello@yourshopfront.com"
            className="font-medium text-apx-ink underline underline-offset-2 hover:text-apx-primary"
          >
            hello@yourshopfront.com
          </a>{" "}
          if the problem persists.
        </p>
      </div>
    </div>
  )
}

function BillingNoSite() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-apx-ink">
        Billing
      </h1>
      <div className="mt-6 rounded-2xl border border-apx-line bg-apx-paper p-6">
        <p className="text-sm text-apx-mute">
          No purchase found yet. If you just completed checkout, wait a moment
          and refresh — it can take a few seconds to appear. Email{" "}
          <a
            href="mailto:hello@yourshopfront.com"
            className="font-medium text-apx-ink underline underline-offset-2 hover:text-apx-primary"
          >
            hello@yourshopfront.com
          </a>{" "}
          if you need help.
        </p>
      </div>
    </div>
  )
}
