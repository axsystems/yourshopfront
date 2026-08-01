/**
 * Centralized env-var resolution for Google Analytics 4 + Google Ads.
 *
 * All three are public env vars (NEXT_PUBLIC_*) because the gtag script
 * runs in the browser. They render to inline scripts in the layout.
 *
 * If any env var is missing, the corresponding tag/event is a no-op —
 * never throws. That means the codebase ships safe even before the
 * operator pastes the real IDs into Vercel.
 */

import {
  COPY_ADDON_PRICE,
  HOSTING_ADDON_PRICE,
  ONE_TIME_PRICE,
  PROMO_TODAY_CHARGE,
} from "./pricing-constants"

/**
 * GA4 measurement ID, format: G-XXXXXXXXXX.
 *
 * `.trim()` is load-bearing: these render into an inline <script> body in
 * <GoogleTag> (`gtag('config', '${GA4_ID}')`), and a stray trailing newline
 * pasted into the Vercel dashboard env var breaks out of the single-quoted
 * string literal — an embedded raw newline is invalid inside a JS string,
 * so the whole inline script throws a SyntaxError on every page load.
 */
export const GA4_ID = (process.env.NEXT_PUBLIC_GA4_ID ?? "").trim()

/** Google Ads account ID, format: AW-XXXXXXXXXX. Same trailing-whitespace risk as GA4_ID. */
export const GOOGLE_ADS_ID = (process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "").trim()

/**
 * Google Ads conversion label for the "Purchase" conversion action.
 * Format: ~10-char hash, looks like `abc123XYZ`. Pair with GOOGLE_ADS_ID
 * to build the send_to value: `${GOOGLE_ADS_ID}/${LABEL}`.
 */
export const GOOGLE_ADS_CONVERSION_LABEL = (
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL ?? ""
).trim()

/** True when at least one of GA4 or Google Ads is configured. */
export const ANALYTICS_ENABLED = Boolean(GA4_ID || GOOGLE_ADS_ID)

/**
 * True when <GoogleConversionEvent> will actually emit something.
 *
 * Stricter than ANALYTICS_ENABLED on purpose: the Ads conversion needs
 * BOTH the account id and the conversion label, so an Ads id on its own
 * reports nothing here — even though it is still worth loading the global
 * tag for remarketing, which is what ANALYTICS_ENABLED gates.
 *
 * Anything that does work solely to feed the purchase event (e.g. the
 * Stripe amount lookup in src/app/onboarding/page.tsx) must gate on this,
 * or it pays for a round-trip whose result is thrown away.
 */
export const CONVERSION_EVENT_ENABLED = Boolean(
  GA4_ID || (GOOGLE_ADS_ID && GOOGLE_ADS_CONVERSION_LABEL)
)

/**
 * Last-resort conversion VALUE in USD, used only when the real amount
 * Stripe collected can't be read (see `purchaseValueUsd` in
 * src/app/onboarding/page.tsx, which retrieves session.amount_total and
 * falls back to this).
 *
 * The reported number is TODAY'S CHARGE, not projected first-period or
 * lifetime revenue. Google Ads Smart Bidding treats conversion value as
 * realized revenue at the moment of conversion; a promo subscription can
 * still cancel inside the PROMO_TRIAL_DAYS trial before a single monthly
 * invoice bills, so counting months 2-4 up front would report revenue
 * that may never exist. Modelled LTV belongs in Ads value rules or an
 * offline conversion import, not in the client-side purchase event.
 *
 * This estimate is deliberately a FLOOR — the smallest amount that could
 * have been charged today for the given tier:
 * - subscription: only the promo setup fee bills today (the monthly line
 *   is behind a PROMO_TRIAL_DAYS trial). /checkout currently defaults
 *   every subscription visit to promo pricing, so this is also the live
 *   number. If the promo is ever retired this becomes an UNDER-report,
 *   never an over-report — under-bidding is the safe failure direction.
 * - onetime: the build, plus hosting when the add-on was taken (both land
 *   on the first invoice). Hosting is bundled into the subscription tier
 *   and is never a separate charge there, hence the tier guard.
 * - the copy add-on is a one-time price that bills today in all modes.
 */
export function fallbackConversionValueUsd(opts: {
  tier: "subscription" | "onetime"
  copyAddon: boolean
  hostingAddon: boolean
}): number {
  const base =
    opts.tier === "subscription"
      ? PROMO_TODAY_CHARGE
      : ONE_TIME_PRICE + (opts.hostingAddon ? HOSTING_ADDON_PRICE : 0)
  return base + (opts.copyAddon ? COPY_ADDON_PRICE : 0)
}
