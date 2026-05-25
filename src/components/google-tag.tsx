import Script from "next/script"

import {
  ANALYTICS_ENABLED,
  GA4_ID,
  GOOGLE_ADS_ID,
} from "@/lib/analytics-config"

/**
 * Global Google tag (gtag.js) — loads ONE library, configures GA4 and
 * Google Ads from a single tag. Renders nothing on screen.
 *
 * Mounted in src/app/layout.tsx alongside Vercel Analytics + Plausible.
 *
 * No-op when neither NEXT_PUBLIC_GA4_ID nor NEXT_PUBLIC_GOOGLE_ADS_ID is
 * set — safe to merge to master before the operator configures the
 * Vercel env vars.
 *
 * Loading strategy: afterInteractive — gtag is non-critical, must not
 * block LCP. Page-view tracking still fires reliably because gtag
 * captures the initial page load on script init.
 *
 * Ad blockers: ~30% of users block googletagmanager.com. That's expected
 * — Plausible (privacy-friendly, less commonly blocked) is the backup
 * for page views; gtag is the channel for Google Ads attribution which
 * REQUIRES gtag specifically (no workaround).
 *
 * Consent: this codebase ships without a consent banner. Acceptable for
 * the current US-only customer base. If/when expanding to EEA/UK,
 * gate this behind a CMP-driven consent state via gtag('consent', ...).
 */
export function GoogleTag() {
  if (!ANALYTICS_ENABLED) return null

  // Prefer GA4 ID as the loader hint, fall back to Ads. The library is
  // the same regardless — the `?id=` only sets which container the
  // bootstrap auto-installs (other configs are added via the inline
  // init script below).
  const loaderId = GA4_ID || GOOGLE_ADS_ID

  // Build the inline init: declare dataLayer + gtag shim, then one
  // gtag('config', id) call per configured product.
  const configCalls: string[] = []
  if (GA4_ID) configCalls.push(`gtag('config', '${GA4_ID}');`)
  if (GOOGLE_ADS_ID) configCalls.push(`gtag('config', '${GOOGLE_ADS_ID}');`)

  const initScript = [
    "window.dataLayer = window.dataLayer || [];",
    "function gtag(){dataLayer.push(arguments);}",
    "gtag('js', new Date());",
    ...configCalls,
  ].join("\n")

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${loaderId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {initScript}
      </Script>
    </>
  )
}
