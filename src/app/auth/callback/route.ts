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

function safeNext(raw: string | null): string {
  if (!raw) return "/app"
  const decoded = decodeURIComponent(raw)
  // Only allow relative paths that start with a known prefix.
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
