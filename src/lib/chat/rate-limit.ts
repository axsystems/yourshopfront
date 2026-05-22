import "server-only"

/**
 * In-memory sliding-window rate limiter. Good enough for a marketing site
 * at launch — swap for Upstash @upstash/ratelimit once we see real traffic.
 *
 * Keyed by client IP. Caps requests per window. Process-local: each Vercel
 * lambda instance has its own counter, so the practical limit can be
 * higher than configured. That's fine for abuse prevention; we mostly
 * care about runaway costs from a single bad actor.
 */
type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

const WINDOW_MS = 60_000 // 1 minute
const DEFAULT_MAX_REQUESTS = 10

/**
 * Check a sliding-window rate-limit bucket.
 *
 * Pass a tight `max` (e.g. 3) for cost-sensitive endpoints like the
 * contact form which fans out to Resend + Slack on every request.
 * Default 10 matches the historical chat-route behavior.
 *
 * Keys should be namespaced by caller (e.g. `contact:${ip}`,
 * `chat:${ip}`) so different endpoints don't share buckets.
 */
export function checkRateLimit(
  key: string,
  max: number = DEFAULT_MAX_REQUESTS
): {
  ok: boolean
  retryAfterSeconds: number
} {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { ok: true, retryAfterSeconds: 0 }
  }

  if (existing.count >= max) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    }
  }

  existing.count += 1
  return { ok: true, retryAfterSeconds: 0 }
}

/**
 * Periodically prune expired buckets so the Map doesn't grow forever in
 * a long-lived server. Cheap because Map iteration is O(n) and n is small.
 */
export function pruneExpired(): void {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}
