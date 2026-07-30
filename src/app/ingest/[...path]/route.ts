import { NextResponse, type NextRequest } from "next/server"

/**
 * Same-origin proxy for PostHog (product analytics + session replay).
 *
 * WHY A ROUTE HANDLER AND NOT A next.config REWRITE:
 * rewrites forward the inbound request headers verbatim, including Cookie.
 * @supabase/ssr sets its auth cookies at path "/", so a same-origin request
 * to /ingest/* carries this site's Supabase access and refresh tokens -- a
 * rewrite would hand portal session credentials to a third-party vendor on
 * every captured event. This handler rebuilds the outbound request from an
 * explicit allowlist, so no credential crosses the boundary by default.
 * Adding a header to that list is a deliberate act.
 *
 * WHY SAME-ORIGIN AT ALL: ad blockers block *.posthog.com by hostname.
 * Routing through this origin is what makes replay work for the share of
 * visitors running one.
 *
 * Point posthog-js at it with NEXT_PUBLIC_POSTHOG_HOST=/ingest. When
 * api_host is a custom value posthog-js resolves every target -- api,
 * assets and flags -- against it, so /static/* and /array/* arrive here too
 * and are sent to the assets origin below.
 */

// PostHog Cloud is region-locked. Defaults are US, matching the project.
// For an EU project set both to the eu.* / eu-assets.* hosts and redeploy.
// These are read per request, so the value is not baked into the bundle.
const INGEST_HOST =
  process.env.POSTHOG_INGEST_HOST ?? "https://us.i.posthog.com"
const ASSETS_HOST =
  process.env.POSTHOG_ASSETS_HOST ?? "https://us-assets.i.posthog.com"

const PREFIX = "/ingest"

/**
 * The ONLY request headers that reach PostHog.
 * - content-type / content-encoding: posthog-js compresses event payloads
 *   and the upstream needs both to decode them.
 * - user-agent: PostHog derives $browser / $os / $device_type from it.
 * Every other inbound header is dropped.
 */
const FORWARDED_REQUEST_HEADERS = [
  "content-type",
  "content-encoding",
  "user-agent",
]

/** Immutable public JS. Cached at the edge so repeat loads skip compute. */
function isAssetPath(path: string): boolean {
  return path.startsWith("/static/") || path.startsWith("/array/")
}

/**
 * Client IP for PostHog geolocation, and nothing else. Vercel overwrites
 * x-forwarded-for with the true client IP, so the first entry is the one to
 * trust; the inbound header is never passed through untouched.
 */
function clientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for")
  const first = forwarded?.split(",")[0]?.trim()
  if (first) return first
  return request.headers.get("x-real-ip")
}

async function forward(request: NextRequest): Promise<Response> {
  const path = request.nextUrl.pathname.slice(PREFIX.length) || "/"
  const isAsset = isAssetPath(path)
  const origin = isAsset ? ASSETS_HOST : INGEST_HOST
  const target = `${origin}${path}${request.nextUrl.search}`

  const headers = new Headers()
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }
  const ip = clientIp(request)
  if (ip) headers.set("x-forwarded-for", ip)

  // Stream the body rather than buffering it: replay batches are large and
  // may be compressed, and reading them as text would corrupt them.
  // `duplex` is required by undici whenever body is a stream.
  const hasBody = request.method !== "GET" && request.method !== "HEAD"
  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    redirect: "manual",
  }
  if (hasBody) {
    init.body = request.body
    init.duplex = "half"
  }

  let upstream: Response
  try {
    upstream = await fetch(target, init)
  } catch {
    // Surface a retryable status; posthog-js backs off and re-sends.
    return new NextResponse(null, { status: 502 })
  }

  // Response headers are rebuilt, not copied. Load-bearing: a Set-Cookie
  // from PostHog would otherwise land as a FIRST-PARTY cookie on this
  // domain, because the browser sees a same-origin response.
  // content-encoding and content-length are omitted on purpose -- fetch has
  // already decoded the body, so echoing them would corrupt it.
  const responseHeaders = new Headers()
  const contentType = upstream.headers.get("content-type")
  if (contentType) responseHeaders.set("content-type", contentType)
  responseHeaders.set(
    "cache-control",
    isAsset
      ? "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"
      : "no-store"
  )

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  })
}

export async function GET(request: NextRequest): Promise<Response> {
  return forward(request)
}

export async function POST(request: NextRequest): Promise<Response> {
  return forward(request)
}
