import "server-only"

import { timingSafeEqual } from "node:crypto"

import { NextResponse } from "next/server"

import { provisionSite } from "@/lib/provisioning/orchestrator"
import { getSitesByStatus } from "@/lib/supabase"

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return timingSafeEqual(aBuf, bBuf)
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Vercel cron tick. Configured in vercel.json to run every minute. Picks
 * up sites that are 'ready_to_build' (need to start) or 'provisioning'
 * (interrupted mid-flow), and walks each one through the orchestrator.
 *
 * Auth: Vercel cron sends `Authorization: Bearer ${CRON_SECRET}`. We
 * 401 anything that doesn't match. (Without this, anyone hitting the
 * URL could trigger provisioning.)
 *
 * Batch size is capped at 5 per tick to keep the function under the
 * 60s Vercel default timeout. At 5 sites/min that's 7,200 sites/day —
 * plenty of headroom for a marketing site.
 */
export async function GET(req: Request): Promise<Response> {
  const expected = process.env.CRON_SECRET
  if (!expected) {
    console.error("[cron/provision] CRON_SECRET not set — refusing to run")
    return NextResponse.json({ error: "Cron not configured" }, { status: 500 })
  }
  const auth = req.headers.get("authorization") ?? ""
  if (!safeEqual(auth, `Bearer ${expected}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let sites
  try {
    sites = await getSitesByStatus(["ready_to_build", "provisioning"], 5)
  } catch (err) {
    console.error("[cron/provision] failed to query sites", err)
    return NextResponse.json({ error: "Query failed" }, { status: 500 })
  }

  if (sites.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 })
  }

  // Run sequentially. Parallel would speed things up but each step talks
  // to Cloudflare + Vercel + Supabase, and we'd rather not multiply API
  // call rates by N here. With 5/tick this finishes well inside 60s.
  const results: Array<{ id: string; ok: boolean }> = []
  for (const site of sites) {
    try {
      await provisionSite(site)
      results.push({ id: site.id, ok: true })
    } catch (err) {
      console.error(`[cron/provision] orchestrator threw for ${site.id}`, err)
      results.push({ id: site.id, ok: false })
    }
  }

  return NextResponse.json({ ok: true, processed: results.length, results })
}
