import { NextResponse, type NextRequest } from "next/server"

import { supabaseServer } from "@/lib/supabase-server"

// =============================================================================
// /auth/callback — Magic-link code exchange
// =============================================================================
// Supabase redirects here after the user clicks the magic link in their email.
// The URL contains a `code` query param (PKCE flow). We exchange it for a
// session and set the auth cookies, then forward the user into the dashboard.
//
// ?next=<path> is honoured so we can deep-link into the dashboard in the
// future. The value is validated against an allowlist — never open-redirect.
// =============================================================================

const ALLOWED_NEXT_PREFIXES = ["/app", "/login"]

/**
 * Validates the `?next=` redirect target.
 *
 * Open-redirect hardening:
 *   - Reject protocol-relative paths (`//evil.com`) — browsers treat them as
 *     scheme-inheriting, so `//evil.com` becomes `https://evil.com`.
 *   - Reject Windows-style paths (`\\evil.com`, `/\evil.com`) — some
 *     proxies / browsers normalize backslashes to forward slashes before
 *     parsing, turning `\\evil.com` into the protocol-relative case above.
 *   - Require a known route prefix from the allowlist.
 *
 * Anything that doesn't pass falls back to `/app`.
 */
function safeNext(raw: string | null): string {
  if (!raw) return "/app"
  let decoded: string
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    return "/app"
  }

  // Protocol-relative or Windows-path-style starts. Check BEFORE the prefix
  // test — `//app.evil.com` would otherwise sneak past a `startsWith("/app")`
  // matcher.
  if (
    decoded.startsWith("//") ||
    decoded.startsWith("\\\\") ||
    decoded.startsWith("/\\") ||
    decoded.startsWith("\\/")
  ) {
    return "/app"
  }

  if (
    decoded.startsWith("/") &&
    ALLOWED_NEXT_PREFIXES.some((prefix) => decoded.startsWith(prefix))
  ) {
    return decoded
  }
  return "/app"
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const next = safeNext(searchParams.get("next"))

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=callback_failed", request.url))
  }

  const sb = await supabaseServer()
  const { error } = await sb.auth.exchangeCodeForSession(code)

  if (error) {
    console.warn("[auth/callback] exchangeCodeForSession error:", error.message)
    return NextResponse.redirect(new URL("/login?error=callback_failed", request.url))
  }

  // exchangeCodeForSession sets the auth cookies via the ssr adapter's
  // setAll() call inside supabaseServer(). The redirect carries the Set-Cookie
  // headers in the response from the Route Handler context (not a Server
  // Component), so setAll() succeeds here.
  return NextResponse.redirect(new URL(next, request.url))
}
