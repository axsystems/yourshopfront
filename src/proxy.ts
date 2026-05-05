import { NextResponse, type NextRequest } from "next/server"

/**
 * Next 16 proxy (formerly middleware.ts). Resolves customer subdomains
 * on apexsites.com to the multi-tenant render path.
 *
 *   apexsites.com           → marketing site (no rewrite)
 *   www.apexsites.com       → marketing site (no rewrite — Vercel handles
 *                             the apex redirect at the domain layer)
 *   <slug>.apexsites.com/   → rewritten to /_tenant?slug=<slug>
 *   <slug>.apexsites.com/x  → marketing site (only `/` is multi-tenant
 *                             in v1; deeper routes serve apex content)
 *   localhost:3000          → marketing site (dev — no subdomain match)
 *   *.vercel.app            → marketing site (preview deploys)
 *
 * The matcher excludes API routes, Next internals, and static files so
 * the proxy doesn't add hops to every asset request.
 */

const APEX_DOMAIN = process.env.APEX_DOMAIN ?? "apexsites.com"

export function proxy(req: NextRequest): NextResponse {
  const hostHeader = req.headers.get("host") ?? ""
  const host = hostHeader.split(":")[0]!.toLowerCase()

  // Skip non-apex hosts entirely (preview deploys, localhost, etc.).
  // Subdomain rewriting only kicks in for `*.apexsites.com`.
  if (host !== APEX_DOMAIN && !host.endsWith(`.${APEX_DOMAIN}`)) {
    return NextResponse.next()
  }

  // The bare apex and `www` are the marketing site — no rewrite.
  if (host === APEX_DOMAIN || host === `www.${APEX_DOMAIN}`) {
    return NextResponse.next()
  }

  // Anything else with a single label before the apex is a tenant.
  const subdomain = host.slice(0, host.length - APEX_DOMAIN.length - 1)
  if (!subdomain || subdomain === "www") {
    return NextResponse.next()
  }

  // v1 only multi-tenants the home path. Deeper paths fall through to
  // marketing content so links like /pricing keep working.
  if (req.nextUrl.pathname !== "/") {
    return NextResponse.next()
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
