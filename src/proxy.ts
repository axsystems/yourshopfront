import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

/**
 * Next 16 proxy (formerly middleware.ts). Two responsibilities:
 *
 * 1. SUBDOMAIN ROUTING — Resolves customer subdomains on yourshopfront.com
 *    to the multi-tenant render path. (Existing logic — unchanged.)
 *
 *      yourshopfront.com           → marketing site (no rewrite)
 *      www.yourshopfront.com       → marketing site (no rewrite — Vercel handles
 *                                    the apex redirect at the domain layer)
 *      <slug>.yourshopfront.com/   → rewritten to /_tenant?slug=<slug>
 *      <slug>.yourshopfront.com/x  → marketing site (only `/` is multi-tenant
 *                                    in v1; deeper routes serve apex content)
 *      localhost:3000              → marketing site (dev — no subdomain match)
 *      *.vercel.app                → marketing site (preview deploys)
 *
 * 2. AUTH COOKIE REFRESH — Keeps the Supabase session alive by calling
 *    supabase.auth.getUser() on every matched request. This causes the
 *    @supabase/ssr adapter to write an updated token cookie into the
 *    response when the access token is close to expiry.
 *
 *    IMPORTANT: We never use the user object returned here for authorization
 *    decisions. It's only here to refresh the cookie. Actual auth checks live
 *    in requireAuth() (src/lib/auth.ts) which calls getUser() server-side per
 *    request.
 *
 * The matcher excludes API routes, Next internals, and static files so
 * the proxy doesn't add hops to every asset request.
 */

const APEX_DOMAIN = process.env.APEX_DOMAIN ?? "yourshopfront.com"

export async function proxy(req: NextRequest): Promise<NextResponse> {
  // ── 1. Start with a passthrough response that carries the request headers ──
  let response = NextResponse.next({
    request: { headers: req.headers },
  })

  // ── 2. Auth cookie refresh (additive — must happen before any redirects) ──
  // Build a lightweight Supabase client bound to the request/response cookies.
  // The setAll callback writes refreshed tokens back into `response`.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // First write into the cloned request so downstream server components
          // see the updated cookies within this same request lifecycle.
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          )
          // Rebuild the response with the updated request, then stamp cookies
          // into the response headers so the browser receives them.
          response = NextResponse.next({
            request: { headers: req.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() validates the JWT against the Supabase auth server and
  // triggers token refresh via setAll() above when needed.
  // We intentionally discard the result — never use middleware user data
  // for authorization (it runs before the request handler and can race).
  await supabase.auth.getUser()

  // ── 3. Subdomain routing (original logic — preserved exactly) ──
  const hostHeader = req.headers.get("host") ?? ""
  const host = hostHeader.split(":")[0]!.toLowerCase()

  // Skip non-apex hosts entirely (preview deploys, localhost, etc.).
  // Subdomain rewriting only kicks in for `*.yourshopfront.com`.
  if (host !== APEX_DOMAIN && !host.endsWith(`.${APEX_DOMAIN}`)) {
    return response
  }

  // The bare apex and `www` are the marketing site — no rewrite.
  if (host === APEX_DOMAIN || host === `www.${APEX_DOMAIN}`) {
    return response
  }

  // Anything else with a single label before the apex is a tenant.
  const subdomain = host.slice(0, host.length - APEX_DOMAIN.length - 1)
  if (!subdomain || subdomain === "www") {
    return response
  }

  // v1 only multi-tenants the home path. Deeper paths fall through to
  // marketing content so links like /pricing keep working.
  if (req.nextUrl.pathname !== "/") {
    return response
  }

  const url = req.nextUrl.clone()
  url.pathname = "/tenant"
  url.searchParams.set("slug", subdomain)
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    // Run everywhere except API, Next internals, and static files.
    "/((?!api/|_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml|og-default.png).*)",
  ],
}
