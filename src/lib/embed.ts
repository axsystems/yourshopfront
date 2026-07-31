/**
 * Iframe-embed detection for analytics suppression.
 *
 * The homepage's <RotatingPreview> mounts live `/demos/{slug}?embed=1`
 * iframes (src/components/apex/home/rotating-preview.tsx). Each one is a
 * full page load of the real demo route, so it renders the root layout —
 * including every analytics tracker mounted there.
 *
 * Left unguarded that turns one homepage visit into a stream of phantom
 * pageviews for demo slugs nobody actually opened. Measured 2026-07-31:
 * 175 of 209 PostHog pageviews (84%) came from these iframes, and every
 * single `/demos/*` pageview on record was an embed rather than a human.
 *
 * Detecting the frame relationship rather than reading `?embed=1` keeps
 * this correct for any future embed (the `/tenant` preview iframes that
 * `frame-ancestors 'self'` exists for, for instance) without each caller
 * having to remember to opt out.
 */
export function isEmbeddedFrame(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.self !== window.top
  } catch {
    // Reading window.top across origins throws — which only happens when
    // we are framed by another origin. Treat the throw as "embedded".
    return true
  }
}
