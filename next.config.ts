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

// PostHog Cloud is region-locked and the hostnames differ per region.
// These default to US. If the PostHog project turns out to be EU, set
// BOTH of these and redeploy -- rewrites are resolved during `next
// build`, so changing the env var alone does nothing until a rebuild:
//   POSTHOG_INGEST_HOST=https://eu.i.posthog.com
//   POSTHOG_ASSETS_HOST=https://eu-assets.i.posthog.com
const POSTHOG_INGEST_HOST =
  process.env.POSTHOG_INGEST_HOST ?? "https://us.i.posthog.com"
const POSTHOG_ASSETS_HOST =
  process.env.POSTHOG_ASSETS_HOST ?? "https://us-assets.i.posthog.com"

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com ${GOOGLE_TAG_SCRIPT_SRC}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://*.supabase.co ${GOOGLE_TAG_IMG_SRC}`,
  "font-src 'self' data:",
  `connect-src 'self' https://api.stripe.com ${GOOGLE_TAG_CONNECT_SRC}`,
  // PostHog session replay builds its compression worker from a Blob
  // URL. There is no worker-src here otherwise, so it would fall back to
  // script-src, which has no blob: -- the worker gets refused and replay
  // silently records nothing. PostHog documents "'self' blob: data:";
  // data: is omitted because posthog-js builds the worker from a Blob,
  // not a data URI. PostHog itself needs no script-src/connect-src entry
  // because it is reverse-proxied same-origin through /ingest below.
  "worker-src 'self' blob:",
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
  // Reverse-proxy PostHog through this origin so no *.posthog.com host
  // has to be added to script-src/connect-src. Point posthog-js at it
  // with NEXT_PUBLIC_POSTHOG_HOST=/ingest. Shape and ordering are
  // PostHog's own (posthog.com/docs/advanced/proxy/nextjs): both asset
  // rules must precede the catch-all, or /ingest/static/* would be sent
  // to the ingestion host instead of the assets host.
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: `${POSTHOG_ASSETS_HOST}/static/:path*`,
      },
      {
        source: "/ingest/array/:path*",
        destination: `${POSTHOG_ASSETS_HOST}/array/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `${POSTHOG_INGEST_HOST}/:path*`,
      },
    ]
  },
  // PostHog's ingestion endpoints are trailing-slash paths (/decide/,
  // /e/). Without this, Next answers them with a 308 to the slashless
  // form instead of proxying them.
  skipTrailingSlashRedirect: true,
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }]
  },
}

export default analyze(nextConfig)
