import path from "node:path"
import type { NextConfig } from "next"
import withBundleAnalyzer from "@next/bundle-analyzer"

const analyze = withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })

// Google tag (gtag.js) origins, per
// https://developers.google.com/tag-platform/security/guides/csp
// (Google Analytics 4 + Google Ads sections). Split by directive so the
// reason each host is allowed stays obvious.
//
// Deliberately NOT included:
//   - https://*.google.com / https://*.google.<TLD> — the doc lists these
//     for GA4 Advertising Features and per-country Ads pings. Wildcarding
//     *.google.com would whitelist user-content hosts (script.google.com,
//     sites.google.com) and defeat the policy; the TLD list is ~190 hosts.
//     Only the exact https://www.google.com endpoint is allowed, and only
//     as an image/beacon target — never as a script source, because
//     www.google.com serves JSONP endpoints that are a known CSP bypass.
//   - pagead2.googlesyndication.com, ad.doubleclick.net, Floodlight and
//     Preview-Mode hosts — remarketing / GTM-container features this site
//     does not use (it loads gtag.js directly, not a GTM container).
const GOOGLE_TAG_SCRIPT_SRC = [
  // gtag.js loader itself (src/components/google-tag.tsx).
  "https://www.googletagmanager.com",
  // Google Ads conversion tracking pulls conversion_async.js from these
  // two hosts. Inert until NEXT_PUBLIC_GOOGLE_ADS_ID is configured.
  "https://www.googleadservices.com",
  "https://googleads.g.doubleclick.net",
].join(" ")

const GOOGLE_TAG_IMG_SRC = [
  // GA4 pixel fallback when sendBeacon/fetch is unavailable.
  "https://*.google-analytics.com",
  "https://www.googletagmanager.com",
  // Google Ads conversion pixels.
  "https://www.googleadservices.com",
  "https://googleads.g.doubleclick.net",
  "https://www.google.com",
].join(" ")

const GOOGLE_TAG_CONNECT_SRC = [
  // GA4 collection endpoints: www. plus the regional shards
  // (region1..regionN.google-analytics.com) and the Measurement
  // Protocol / server-side host on analytics.google.com.
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  // gtag.js fetches remote tag config from its own origin.
  "https://www.googletagmanager.com",
  // Google Ads conversion beacons.
  "https://www.googleadservices.com",
  "https://googleads.g.doubleclick.net",
  "https://www.google.com",
].join(" ")

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com ${GOOGLE_TAG_SCRIPT_SRC}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://*.supabase.co ${GOOGLE_TAG_IMG_SRC}`,
  "font-src 'self' data:",
  `connect-src 'self' https://api.stripe.com ${GOOGLE_TAG_CONNECT_SRC}`,
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  "form-action 'self' https://checkout.stripe.com",
  // Same-origin iframes are intentional: the homepage's rotating preview
  // component renders /demos/<slug>?embed=1 in iframes. 'self' still
  // blocks cross-origin sites from framing us (clickjacking defense).
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ")

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // SAMEORIGIN (not DENY) so the homepage's iframe-based preview works.
  // Cross-origin framing is still blocked.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
]

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }]
  },
}

export default analyze(nextConfig)
