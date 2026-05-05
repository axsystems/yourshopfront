import "server-only"

import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Diagnostic-only. Reports whether the chat env vars are loaded on the
 * running server, without leaking any secret values. Safe to leave in
 * production — every field is non-sensitive.
 */
export async function GET(): Promise<Response> {
  const key = process.env.ANTHROPIC_API_KEY
  return NextResponse.json({
    hasKey: typeof key === "string" && key.length > 0,
    keyPrefix: key ? `${key.slice(0, 10)}…` : null,
    keyLength: key?.length ?? 0,
    nodeEnv: process.env.NODE_ENV,
    runtime: "nodejs",
    // The model the chat route uses — useful to confirm it's not stale
    // after a code edit.
    model: "claude-haiku-4-5-20251001",
  })
}
