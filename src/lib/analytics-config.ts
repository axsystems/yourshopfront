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

/** GA4 measurement ID, format: G-XXXXXXXXXX. */
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? ""

/** Google Ads account ID, format: AW-XXXXXXXXXX. */
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? ""

/**
 * Google Ads conversion label for the "Purchase" conversion action.
 * Format: ~10-char hash, looks like `abc123XYZ`. Pair with GOOGLE_ADS_ID
 * to build the send_to value: `${GOOGLE_ADS_ID}/${LABEL}`.
 */
export const GOOGLE_ADS_CONVERSION_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL ?? ""

/** True when at least one of GA4 or Google Ads is configured. */
export const ANALYTICS_ENABLED = Boolean(GA4_ID || GOOGLE_ADS_ID)

/**
 * Compute the conversion VALUE in USD for a completed purchase.
 *
 * Reports the immediate charge amount (what the customer paid today),
 * which is what Google Ads Smart Bidding optimizes against for ROAS.
 *
 * Limitations (intentional v1):
 * - Not promo-aware. A subscription customer with the launch promo
 *   actually paid $198 today, but we report $299. That's a known
 *   over-report — Google's CPA target should be set accordingly.
 *   Refine post-launch by reading the actual Stripe session.amount_total
 *   in the webhook and storing on the sites table.
 * - Doesn't include hosting recurring beyond first month.
 */
export function conversionValueUsd(opts: {
  tier: "subscription" | "onetime"
  copyAddon: boolean
  hostingAddon: boolean
}): number {
  const base = opts.tier === "subscription" ? 299 : 997
  const addons = (opts.copyAddon ? 199 : 0) + (opts.hostingAddon ? 49 : 0)
  return base + addons
}
