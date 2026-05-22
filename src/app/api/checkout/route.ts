import { NextResponse } from "next/server"

import { CheckoutRequestSchema, type CheckoutRequest } from "@/lib/checkout-schema"
import { stripe } from "@/lib/stripe"

export const runtime = "nodejs"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

// Statement descriptor shown on customer credit-card statements.
// Max 22 chars. Per-charge override so Axon Labs LLC's other product
// lines (apex-studio, axon-growth, ai-researcher) keep their own
// descriptors when sharing this Stripe account.
const STATEMENT_DESCRIPTOR = "YOURSHOPFRONT"

interface PriceIds {
  setup: string
  monthly: string
  onetime: string
  hosting: string
}

function readPriceIds(): PriceIds | null {
  const setup = process.env.STRIPE_PRICE_SUBSCRIPTION_SETUP
  const monthly = process.env.STRIPE_PRICE_SUBSCRIPTION_MONTHLY
  const onetime = process.env.STRIPE_PRICE_ONETIME
  const hosting = process.env.STRIPE_PRICE_HOSTING_ADDON
  if (!setup || !monthly || !onetime || !hosting) return null
  if (
    [setup, monthly, onetime, hosting].some((p) => p.includes("xxx"))
  )
    return null
  return { setup, monthly, onetime, hosting }
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = CheckoutRequestSchema.safeParse(body)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return NextResponse.json(
      { error: `Validation failed: ${first.path.join(".")} — ${first.message}` },
      { status: 400 }
    )
  }
  const data = parsed.data

  const priceIds = readPriceIds()
  if (!priceIds) {
    console.error("[checkout] price IDs not configured — run pnpm stripe:setup")
    return NextResponse.json(
      {
        error:
          "Checkout is not yet configured. Please contact support — our pricing service is unavailable.",
      },
      { status: 500 }
    )
  }

  // Pre-generate site_id so the webhook can correlate the eventual session
  // back to a row even before Supabase auto-assigns one.
  const siteId = crypto.randomUUID()

  const metadata: Record<string, string> = {
    site_id: siteId,
    tier: data.tier,
    demo_slug: data.demo,
    business_name: data.business_name,
    contact_name: data.contact_name,
    email: data.email,
    phone: data.phone,
    industry: data.industry,
    headline_pref: data.headline_pref || "",
    current_website_url: data.current_website_url || "",
    hosting_addon: data.hosting_addon ? "true" : "false",
  }

  const successUrl = `${SITE_URL}/onboarding?session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${SITE_URL}/checkout?tier=${data.tier}&demo=${encodeURIComponent(data.demo)}&cancelled=1`

  try {
    const session = await createSession(data, metadata, priceIds, successUrl, cancelUrl)
    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a redirect URL." },
        { status: 500 }
      )
    }
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("[checkout] stripe error", err)
    const message =
      err instanceof Error ? err.message : "Stripe checkout creation failed."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

async function createSession(
  data: CheckoutRequest,
  metadata: Record<string, string>,
  prices: PriceIds,
  successUrl: string,
  cancelUrl: string
) {
  const s = stripe()

  if (data.tier === "subscription") {
    // Subscription: both prices in line_items. Stripe Checkout in
    // mode=subscription accepts a one-time price alongside a recurring
    // price — it auto-creates an invoice item for the one-time on the
    // first invoice. Cleaner than subscription_data.add_invoice_items
    // (which Checkout doesn't expose).
    return s.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        { price: prices.monthly, quantity: 1 },
        { price: prices.setup, quantity: 1 },
      ],
      subscription_data: { metadata },
      customer_email: data.email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      allow_promotion_codes: true,
    })
  }

  if (data.hosting_addon) {
    // One-time + hosting: same multi-line-item pattern. The $2,997
    // one-time and the $29/mo hosting both land on the first invoice;
    // hosting recurs monthly thereafter.
    return s.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        { price: prices.hosting, quantity: 1 },
        { price: prices.onetime, quantity: 1 },
      ],
      subscription_data: { metadata },
      customer_email: data.email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      allow_promotion_codes: true,
    })
  }

  // One-time, no hosting: pure mode=payment with the $2,997 line item.
  return s.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: prices.onetime, quantity: 1 }],
    customer_email: data.email,
    customer_creation: "always",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    payment_intent_data: {
      metadata,
      statement_descriptor: STATEMENT_DESCRIPTOR,
    },
    allow_promotion_codes: true,
  })
}
