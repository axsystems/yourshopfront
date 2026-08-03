import "server-only"

/**
 * Best-effort client IP extraction for rate-limiting.
 *
 * Order of preference — platform-authored headers first, because a header
 * the client can set is a rate-limit key the client can rotate:
 *   1. `x-vercel-forwarded-for` — written by Vercel's edge from the real
 *      TCP peer. An inbound value of this name is overwritten, not appended,
 *      so it is the one header here a caller cannot author.
 *   2. `x-real-ip` — also set by Vercel's edge (and by nginx-style proxies).
 *   3. `x-forwarded-for` (first hop) — the standard CDN header, kept as the
 *      fallback that makes local dev and non-Vercel hosts work. This one IS
 *      client-influencable when a request reaches the app without passing
 *      through a proxy that rewrites it.
 *   4. fallback "unknown" — keys the rate limiter against this sentinel,
 *      which effectively means "everyone without an IP shares one bucket"
 *
 * Don't rely on this for security-critical authorization; it's good enough
 * for cost-protection rate limits.
 */
export function getClientIp(req: Request): string {
  const vercel = req.headers.get("x-vercel-forwarded-for")
  if (vercel) return vercel.split(",")[0]!.trim()
  const real = req.headers.get("x-real-ip")
  if (real) return real
  const fwd = req.headers.get("x-forwarded-for")
  if (fwd) return fwd.split(",")[0]!.trim()
  return "unknown"
}
