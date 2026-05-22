import Script from "next/script"

/**
 * Plausible analytics. Env-gated: returns null unless NEXT_PUBLIC_PLAUSIBLE_DOMAIN
 * is set, so dev + staging deploys without the env var are tracker-free.
 *
 * Optional: NEXT_PUBLIC_PLAUSIBLE_HOST defaults to "https://plausible.io" but can
 * be overridden for self-hosted deployments.
 *
 * Loaded with strategy="afterInteractive" — does not block first paint.
 *
 * Plausible is privacy-respecting: no cookies, no personal data collection.
 * No banner required under GDPR / CCPA when used in default config.
 */
export function PlausibleAnalytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
  if (!domain) return null
  const host = process.env.NEXT_PUBLIC_PLAUSIBLE_HOST ?? "https://plausible.io"
  return (
    <Script
      strategy="afterInteractive"
      defer
      data-domain={domain}
      src={`${host}/js/script.js`}
    />
  )
}
