import "server-only"

/**
 * Best-effort client IP extraction for rate-limiting.
 *
 * Order of preference:
 *   1. `x-forwarded-for` (first hop) — what Vercel + most CDNs set
 *   2. `x-real-ip` — Vercel sets this too; harder for the client to forge
 *   3. fallback "unknown" — keys the rate limiter against this sentinel,
 *      which effectively means "everyone without an IP shares one bucket"
 *
 * The client CAN spoof `x-forwarded-for` end-to-end on environments where
 * the request bypasses Vercel's edge — but on Vercel's production network
 * the edge proxy rewrites the header. Don't rely on this for security-
 * critical authorization; it's good enough for cost-protection rate limits.
 */
export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")
  if (fwd) return fwd.split(",")[0]!.trim()
  const real = req.headers.get("x-real-ip")
  if (real) return real
  return "unknown"
}
