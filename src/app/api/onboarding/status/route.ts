import "server-only"

import { NextResponse } from "next/server"

import { getSiteById } from "@/lib/supabase"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Lightweight poll endpoint used by the onboarding page's
 * <ProvisioningStatus> client component to track site status without
 * a full page reload.
 *
 * Auth posture: this endpoint returns only the three fields the UI
 * already shows on the SSR'd page (status, live_url, failure_reason),
 * keyed by site_id. Site IDs are UUIDs, not enumerable, and the data
 * leaked is non-sensitive — same as a refresh of the onboarding page.
 * No bearer auth to keep the polling cheap.
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const siteId = url.searchParams.get("site_id")
  if (!siteId) {
    return NextResponse.json({ error: "Missing site_id" }, { status: 400 })
  }

  let site
  try {
    site = await getSiteById(siteId)
  } catch (err) {
    console.error("[onboarding/status] lookup failed", err)
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 })
  }
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 })
  }

  return NextResponse.json({
    status: site.status,
    live_url: site.live_url,
    failure_reason: site.failure_reason,
  })
}
