import Script from "next/script"

import {
  GA4_ID,
  GOOGLE_ADS_CONVERSION_LABEL,
  GOOGLE_ADS_ID,
} from "@/lib/analytics-config"

interface GoogleConversionEventProps {
  /** Stripe session ID used as a stable transaction_id for dedup. */
  transactionId: string
  /** Dollar value of the transaction (immediate charge). */
  valueUsd: number
  /** "subscription" or "onetime" — feeds GA4 item.item_category. */
  tier: "subscription" | "onetime"
}

/**
 * One-shot conversion event for a completed Stripe purchase. Renders
 * a single inline <Script> that fires BOTH:
 *
 *   - GA4 `purchase` event (standard ecommerce) — for funnel analytics
 *     in Google Analytics, attribution reports, etc.
 *   - Google Ads `conversion` event — drives Smart Bidding optimization
 *     for the campaign objective "Sales".
 *
 * Why one component for both: they share gtag and share the value /
 * transaction_id payload. Splitting would duplicate the data layer push.
 *
 * Idempotency: if the customer refreshes /onboarding the event fires
 * again, but Google dedups by transaction_id within the click window
 * (and GA4 dedups by transaction_id within a 24h reservation). Safe.
 *
 * No-ops if neither GA4_ID nor (GOOGLE_ADS_ID + LABEL) is configured.
 *
 * Render LOCATION: inside /onboarding/page.tsx only after site is
 * successfully loaded (so we know the purchase succeeded).
 */
export function GoogleConversionEvent({
  transactionId,
  valueUsd,
  tier,
}: GoogleConversionEventProps) {
  const fireGa4 = Boolean(GA4_ID)
  const fireAds = Boolean(GOOGLE_ADS_ID && GOOGLE_ADS_CONVERSION_LABEL)

  if (!fireGa4 && !fireAds) return null

  const calls: string[] = []

  if (fireGa4) {
    // Standard GA4 ecommerce purchase event.
    calls.push(`
gtag('event', 'purchase', {
  transaction_id: ${JSON.stringify(transactionId)},
  value: ${JSON.stringify(valueUsd)},
  currency: 'USD',
  items: [{
    item_id: ${JSON.stringify(tier)},
    item_name: ${JSON.stringify("Your Shopfront " + tier)},
    item_category: ${JSON.stringify(tier)},
    price: ${JSON.stringify(valueUsd)},
    quantity: 1,
  }],
});`)
  }

  if (fireAds) {
    // Google Ads conversion — feeds Smart Bidding.
    calls.push(`
gtag('event', 'conversion', {
  send_to: ${JSON.stringify(`${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`)},
  value: ${JSON.stringify(valueUsd)},
  currency: 'USD',
  transaction_id: ${JSON.stringify(transactionId)},
});`)
  }

  // Wrap in a setTimeout(0) so gtag has settled before we push events
  // (gtag is loaded with strategy="afterInteractive" in the global tag,
  // and there's a chance this inline script paints before the loader
  // executes. The dataLayer shim itself is queue-safe — events queued
  // before gtag.js loads still flush — but the explicit defer makes
  // intent obvious and avoids edge cases on slow networks).
  const inline = `
(function() {
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  ${calls.join("\n")}
})();`

  // The id includes the transaction id so React doesn't dedupe across
  // sessions (each purchase gets its own <Script> identity).
  return (
    <Script
      id={`gtag-purchase-${transactionId}`}
      strategy="afterInteractive"
    >
      {inline}
    </Script>
  )
}
