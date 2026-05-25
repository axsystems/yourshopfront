import { NextResponse, type NextRequest } from "next/server"

import { supabaseServer } from "@/lib/supabase-server"

// =============================================================================
// POST /auth/signout
// =============================================================================
// CSRF posture: the form lives on the dashboard sidebar and submits with
// method=POST. We require the request's Origin header to match our own
// SITE_URL so a cross-site attacker can't forge a logout by getting an
// authenticated user to load a page that posts here. Same-origin requests
// always send Origin on POST in modern browsers.
//
// We allow a missing Origin only on localhost / preview deploys (dev tooling
// + curl). In production, missing Origin is rejected.
// =============================================================================

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://yourshopfront.com"

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin")

  // No Origin: only allowed in dev / preview where SITE_URL is localhost or a
  // vercel preview deploy. In prod, missing Origin on a POST is suspicious.
  if (!origin) {
    if (process.env.NODE_ENV !== "production") return true
    // Allow vercel preview deploys that may strip Origin on internal calls.
    return SITE_URL.includes(".vercel.app")
  }

  try {
    const originHost = new URL(origin).origin
    const allowedHost = new URL(SITE_URL).origin
    return originHost === allowedHost
  } catch {
    return false
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json(
      { ok: false, error: "forbidden_origin" },
      { status: 403 }
    )
  }

  const sb = await supabaseServer()
  await sb.auth.signOut()
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 })
}
