import "server-only"

import { NextResponse } from "next/server"
import { z } from "zod"

import { checkRateLimit, pruneExpired } from "@/lib/chat/rate-limit"
import { sendAccessLinkEmail } from "@/lib/email"
import { getClientIp } from "@/lib/get-client-ip"
import { supabase, type Customer } from "@/lib/supabase"

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

// Never matches a real row (customer_id is a uuid FK) — used to give the
// no-customer branch a second query of the same shape/cost as the found
// branch. See the round-trip comment below.
const NO_MATCH_CUSTOMER_ID = "00000000-0000-0000-0000-000000000000"

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

  // Two DB round-trips on EVERY request, hit or miss — that's what keeps this
  // side-channel-free now that lookup is case-insensitive:
  //   1. get_customer_by_email — the same SECURITY DEFINER RPC auth.ts uses
  //      for portal sign-in, matching on lower(email) so a mixed-case stored
  //      row (e.g. "Jane@AcmePainting.com") still matches a lowercase input.
  //      A raw `.eq()` on the join used here previously was case-sensitive
  //      and silently failed to match those rows.
  //   2. A sites lookup by customer_id — always executed, even when step 1
  //      found nothing, by falling back to NO_MATCH_CUSTOMER_ID (a uuid that
  //      matches no row). That keeps the query count and rough index-lookup
  //      cost identical on hit vs miss, closing the timing side-channel a
  //      "skip step 2 on miss" shortcut would open.
  try {
    const { data: customerRow, error: customerErr } = await supabase().rpc(
      "get_customer_by_email",
      { p_email: normalizedEmail }
    )

    if (customerErr) {
      console.error("[access] customer lookup failed", customerErr)
      return NextResponse.json(GENERIC_OK_BODY)
    }

    const customer = customerRow as Customer | null

    const { data: site, error: siteErr } = await supabase()
      .from("sites")
      .select("id, stripe_session_id, created_at")
      .eq("customer_id", customer?.id ?? NO_MATCH_CUSTOMER_ID)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (siteErr) {
      console.error("[access] site lookup failed", siteErr)
      return NextResponse.json(GENERIC_OK_BODY)
    }

    if (!customer || !site) {
      return NextResponse.json(GENERIC_OK_BODY)
    }

    const firstName = customer.name?.split(" ")[0] ?? "there"
    const onboardingUrl = `${SITE_URL}/onboarding?session_id=${site.stripe_session_id}`

    // Fire-and-forget the email so registered vs unregistered code paths have
    // the same response latency. Awaiting Resend introduces a 200-800ms
    // timing oracle: an attacker can enumerate emails by measuring response
    // time even though we always return GENERIC_OK_BODY. The .catch keeps the
    // promise from becoming an unhandled rejection if Resend is down.
    const siteIdTrace = site.id.slice(-12)
    void sendAccessLinkEmail({
      to: customer.email,
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
