import "server-only"

import { NextResponse } from "next/server"
import { z } from "zod"

import { checkRateLimit, pruneExpired } from "@/lib/chat/rate-limit"
import { sendAccessLinkEmail } from "@/lib/email"
import { getClientIp } from "@/lib/get-client-ip"
import { getCustomerByEmail, supabase, type Site } from "@/lib/supabase"

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

  // From here on, every branch returns the same 200 body.
  try {
    const customer = await getCustomerByEmail(normalizedEmail)
    if (!customer) {
      return NextResponse.json(GENERIC_OK_BODY)
    }

    const { data: siteRow, error: siteErr } = await supabase()
      .from("sites")
      .select("*")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (siteErr) {
      // Log but don't leak the failure to the caller.
      console.error("[access] site lookup failed", siteErr)
      return NextResponse.json(GENERIC_OK_BODY)
    }

    const site = siteRow as Site | null
    if (!site) {
      return NextResponse.json(GENERIC_OK_BODY)
    }

    const firstName = customer.name?.split(" ")[0] ?? "there"
    const onboardingUrl = `${SITE_URL}/onboarding?session_id=${site.stripe_session_id}`

    try {
      await sendAccessLinkEmail({
        to: customer.email,
        firstName,
        onboardingUrl,
      })
      // Log a trace WITHOUT the email — site id slice is enough to correlate.
      console.log(`[access] sent site=${site.id.slice(-12)}`)
    } catch (err) {
      console.warn("[access] sendAccessLinkEmail threw", err)
      // Fall through — still return GENERIC_OK_BODY.
    }

    return NextResponse.json(GENERIC_OK_BODY)
  } catch (err) {
    // Unhandled failure (e.g. supabase env missing). Don't leak — keep the
    // same response shape so attackers can't probe by triggering errors.
    console.error("[access] unhandled error", err)
    return NextResponse.json(GENERIC_OK_BODY)
  }
}
