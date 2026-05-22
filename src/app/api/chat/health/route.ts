import "server-only"

import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Liveness probe for the chat surface. Intentionally minimal — earlier
 * versions returned the Anthropic key prefix + length + node env, which
 * was useful for ops debugging but doubled as recon material for an
 * attacker mapping our env. If you need to verify whether the chat key
 * is wired in prod, inspect the Vercel project's environment variables
 * directly.
 */
export async function GET(): Promise<Response> {
  return NextResponse.json({ ok: true })
}
