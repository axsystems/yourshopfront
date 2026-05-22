import { NextResponse } from "next/server"
import { z } from "zod"

import { checkRateLimit } from "@/lib/chat/rate-limit"
import { getClientIp } from "@/lib/get-client-ip"
import { stripe } from "@/lib/stripe"
import { getSiteByStripeSessionId } from "@/lib/supabase"

// =============================================================================
// POST /api/checkout/copy-upgrade
// =============================================================================
// Creates a one-off Stripe Checkout session for the $199 copy-writing
// add-on. Intended for customers who started DIY and want to outsource
// their copy after the fact. The session_id from their original purchase
// acts as a bearer token that resolves to their site row.
//
// Request:
//   { sessionId: string }   — their original Stripe checkout session id
//
// Response (200):
//   { url: string }         — Stripe-hosted checkout URL; redirect the customer
// =============================================================================

export const runtime = "nodejs"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
const STATEMENT_DESCRIPTOR = "YOURSHOPFRONT"

const RequestSchema = z.object({
  sessionId: z.string().min(20).max(200),
})

export async function POST(req: Request) {
  // Rate-limit to prevent garbage-session-id quota burn on Stripe API
  // (each invalid lookup still hits Stripe before we 404). 5/min/IP is
  // generous for legit usage but kills cost-grief attacks.
  const ip = getClientIp(req)
  const limit = checkRateLimit(`copy-upgrade:${ip}`, 5)
  if (!limit.ok) {
    return NextResponse.json(
      {
        error: "Too many requests. Try again in a moment.",
        retryAfterSeconds: limit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    )
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    )
  }

  const { sessionId } = parsed.data

  const copyAddonPrice = process.env.STRIPE_PRICE_COPY_ADDON
  if (!copyAddonPrice || copyAddonPrice.includes("xxx")) {
    console.error("[copy-upgrade] STRIPE_PRICE_COPY_ADDON not configured")
    return NextResponse.json(
      { error: "Copy upgrade is not currently available. Please contact support." },
      { status: 500 }
    )
  }

  let site
  try {
    site = await getSiteByStripeSessionId(sessionId)
  } catch (err) {
    console.error("[copy-upgrade] supabase lookup failed", err)
    return NextResponse.json({ error: "Lookup failed." }, { status: 500 })
  }

  if (!site) {
    return NextResponse.json(
      { error: "Site not found for that session." },
      { status: 404 }
    )
  }

  if (site.copy_addon) {
    return NextResponse.json(
      { error: "Already on copy service." },
      { status: 409 }
    )
  }

  if (
    ![
      "pending_content",
      "awaiting_copy",
      "awaiting_copy_draft",
      "awaiting_copy_review",
      "awaiting_copy_approval",
    ].includes(site.status)
  ) {
    return NextResponse.json(
      { error: "Site is past the copy stage." },
      { status: 409 }
    )
  }

  // Fetch the original session to retrieve customer email (most reliable
  // source — customer may have used a different email at payment time).
  let customerEmail: string | null = null
  try {
    const originalSession = await stripe().checkout.sessions.retrieve(sessionId, {
      expand: ["customer_details"],
    })
    customerEmail =
      originalSession.customer_details?.email ??
      originalSession.metadata?.email ??
      null
  } catch (err) {
    console.warn("[copy-upgrade] could not retrieve original session for email", err)
  }

  const upgradeMetadata: Record<string, string> = {
    site_id: site.id,
    upgrade: "copy_addon",
    session_id: sessionId,
    business_name: site.business_name,
  }

  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: copyAddonPrice, quantity: 1 }],
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      metadata: upgradeMetadata,
      payment_intent_data: {
        metadata: upgradeMetadata,
        statement_descriptor: STATEMENT_DESCRIPTOR,
      },
      success_url: `${SITE_URL}/onboarding?session_id=${sessionId}&upgraded=copy`,
      cancel_url: `${SITE_URL}/onboarding/worksheet?session_id=${sessionId}&cancelled=copy_upgrade`,
    })

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a redirect URL." },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    // Log the real error server-side so the operator can debug, but
    // return a generic message to the client. Stripe errors can leak
    // price IDs, account-level config hints, and billing detail
    // metadata that the customer doesn't need to see.
    console.error("[copy-upgrade] stripe error", err)
    return NextResponse.json(
      { error: "Checkout creation failed. Please try again." },
      { status: 400 }
    )
  }
}
