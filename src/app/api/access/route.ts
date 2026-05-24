import "server-only"

import { NextResponse } from "next/server"
import { z } from "zod"

import { checkRateLimit, pruneExpired } from "@/lib/chat/rate-limit"
import { sendAccessLinkEmail } from "@/lib/email"
import { getClientIp } from "@/lib/get-client-ip"
import { supabase } from "@/lib/supabase"

// =============================================================================
// POST /api/access
// =============================================================================
// Self-serve recovery: customer lost their welcome email and needs a fresh
// onboarding link. Always returns the same response shape regardless of
// whether the email is registered — email-enumeration defense is the whole
// point of this endpoint. Never log the submitted email in plaintext.
// =============================================================================

export const runtime = "nodejs"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yourshopfront.com"

const Schema = z.object({
  email: z.string().email().max(254),
})

const GENERIC_OK_BODY = {
  ok: true,
  message: "If that email is registered, we just sent a recovery link.",
}

export async function POST(req: Request) {
  // 5% probabilistic prune so the in-memory bucket map doesn't grow
  // unbounded under sustained traffic. Matches /api/contact.
  if (Math.random() < 0.05) pruneExpired()

  // --- Rate limit (3/min/IP, namespaced) ---
  const ip = getClientIp(req)
  const limit = checkRateLimit(`access:${ip}`, 3)
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", retryAfterSeconds: limit.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    )
  }

  // --- Parse + validate body ---
  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 })
  }

  const parsed = Schema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid email." },
      { status: 400 }
    )
  }

  // IP is in Vercel access logs already; this is just a behavior trace.
  // Email is intentionally NOT logged here — enumeration defense extends
  // to ops logs.
  console.log(`[access] recovery requested ip=${ip}`)

  const normalizedEmail = parsed.data.email.toLowerCase().trim()

  // Single JOIN — one DB round-trip whether or not the email is registered,
  // closing the timing side-channel that two sequential lookups would open.
  // Found path still has the extra Resend latency, but that's a much weaker
  // signal than a deterministic 2x DB query count.
  try {
    const { data: row, error: lookupErr } = await supabase()
      .from("sites")
      .select(
        "id, stripe_session_id, created_at, customers!inner(id, email, name)"
      )
      .eq("customers.email", normalizedEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lookupErr) {
      console.error("[access] lookup failed", lookupErr)
      return NextResponse.json(GENERIC_OK_BODY)
    }

    if (!row) {
      return NextResponse.json(GENERIC_OK_BODY)
    }

    // supabase-js types !inner joins loosely; narrow here. The selected
    // customers projection is the joined row, not the full Customer.
    const joined = row as unknown as {
      id: string
      stripe_session_id: string
      customers: { id: string; email: string; name: string | null }
    }

    const firstName = joined.customers.name?.split(" ")[0] ?? "there"
    const onboardingUrl = `${SITE_URL}/onboarding?session_id=${joined.stripe_session_id}`

    // Fire-and-forget the email so registered vs unregistered code paths have
    // the same response latency. Awaiting Resend introduces a 200-800ms
    // timing oracle: an attacker can enumerate emails by measuring response
    // time even though we always return GENERIC_OK_BODY. The .catch keeps the
    // promise from becoming an unhandled rejection if Resend is down.
    const siteIdTrace = joined.id.slice(-12)
    void sendAccessLinkEmail({
      to: joined.customers.email,
      firstName,
      onboardingUrl,
    })
      .then(() => {
        // Trace WITHOUT the email — site id slice is enough to correlate.
        console.log(`[access] sent site=${siteIdTrace}`)
      })
      .catch((err) => {
        console.error("[access] email send failed", { siteIdTrace, err })
      })

    return NextResponse.json(GENERIC_OK_BODY)
  } catch (err) {
    // Unhandled failure (e.g. supabase env missing). Don't leak — keep the
    // same response shape so attackers can't probe by triggering errors.
    console.error("[access] unhandled error", err)
    return NextResponse.json(GENERIC_OK_BODY)
  }
}
