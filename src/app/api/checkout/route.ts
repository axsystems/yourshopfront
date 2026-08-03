import { NextResponse } from "next/server"

import { checkRateLimit } from "@/lib/chat/rate-limit"
import { CheckoutRequestSchema, type CheckoutRequest } from "@/lib/checkout-schema"
import { getClientIp } from "@/lib/get-client-ip"
import { PROMO_TRIAL_DAYS } from "@/lib/pricing-constants"
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
  setupPromo: string | null
  monthly: string
  onetime: string
  hosting: string
  copyAddon: string
}

function readPriceIds(): PriceIds | null {
  const setup = process.env.STRIPE_PRICE_SUBSCRIPTION_SETUP
  const monthly = process.env.STRIPE_PRICE_SUBSCRIPTION_MONTHLY
  const onetime = process.env.STRIPE_PRICE_ONETIME
  const hosting = process.env.STRIPE_PRICE_HOSTING_ADDON
  const copyAddon = process.env.STRIPE_PRICE_COPY_ADDON
  if (!setup || !monthly || !onetime || !hosting || !copyAddon) return null
  if (
    [setup, monthly, onetime, hosting, copyAddon].some((p) => p.includes("xxx"))
  )
    return null
  const setupPromoRaw = process.env.STRIPE_PRICE_SUBSCRIPTION_SETUP_PROMO
  const setupPromo =
    setupPromoRaw && !setupPromoRaw.includes("xxx") ? setupPromoRaw : null
  return { setup, setupPromo, monthly, onetime, hosting, copyAddon }
}

// Must be a coupon whose `applies_to.products` is restricted to the monthly
// subscription product. The promo path runs a trial, so the only line on the
// first invoice is the one-time setup fee — an unrestricted coupon discounts
// THAT instead, charging $49 today rather than $99 and burning a discounted
// month. Verified against live Stripe 2026-07-31.
//
// Verification trap: `stripe coupons list` / plain `stripe coupons retrieve
// <id>` silently OMIT `applies_to` even when it IS set — a naive check
// against that output reports a false "unrestricted coupon" misconfiguration.
// The only way to actually see it is
// `stripe coupons retrieve <id> --live -d "expand[]=applies_to"`.
// Live coupon `launch_promo_3mo_monthly` is correctly restricted to product
// `prod_UYpp8k2bCOJSHX` (verified 2026-08-03 with the expand flag above).
function readLaunchPromoCoupon(): string | null {
  const coupon = process.env.STRIPE_COUPON_LAUNCH_PROMO_MONTHLY
  if (!coupon || coupon.includes("xxx")) return null
  return coupon
}

// The promo decision is the SERVER's, not the client's.
//
// /checkout renders promo pricing for every subscription visitor regardless
// of whether the CTA forwarded `promo=launch`, so making the discount
// conditional on the client echoing that param back meant a dropped query
// param quoted $99 and charged $448 — a 4.5x overcharge triggered by nothing
// but a lost URL fragment. The client's `promo` field is now only honoured as
// an explicit opt-out; its absence can never raise the price.
//
// "unavailable" is the fail-closed state: the page is quoting $99 but this
// deployment cannot deliver it, so the checkout is refused rather than billed
// at standard. That means an incomplete promo config blocks EVERY subscription
// checkout, not just ones that asked for the promo — deliberate.
//
// RETIRING THE PROMO IS ORDER-SENSITIVE. Removing the coupon/price env FIRST
// takes subscription revenue to zero: every checkout 503s until a code deploy
// lands. Correct order:
//   1. Ship /checkout sending promo: "none" for subscriptions (page.tsx →
//      checkout-form.tsx → this field). Standard pricing is then quoted AND
//      charged while the env is still in place.
//   2. Only then remove STRIPE_PRICE_SUBSCRIPTION_SETUP_PROMO and
//      STRIPE_COUPON_LAUNCH_PROMO_MONTHLY.
type PromoDecision =
  | { kind: "active"; coupon: string; setupPrice: string }
  | { kind: "off" }
  | { kind: "unavailable" }

function decideLaunchPromo(
  data: CheckoutRequest,
  prices: PriceIds
): PromoDecision {
  if (data.tier !== "subscription") return { kind: "off" }
  if (data.promo === "none") return { kind: "off" }
  const coupon = readLaunchPromoCoupon()
  if (coupon === null || prices.setupPromo === null) {
    return { kind: "unavailable" }
  }
  return { kind: "active", coupon, setupPrice: prices.setupPromo }
}

export async function POST(req: Request) {
  // Unauthenticated endpoint that mints real Stripe Checkout sessions, so an
  // unbounded caller burns Stripe API quota and litters the dashboard. Every
  // sibling route already does this; checkout was the one that got missed.
  // 10/min/IP leaves room for a buyer retrying a declined card.
  const ip = getClientIp(req)
  const limit = checkRateLimit(`checkout:${ip}`, 10)
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
    phone: data.phone ?? "",
    industry: data.industry,
    current_website_url: data.current_website_url || "",
    hosting_addon: data.hosting_addon ? "true" : "false",
    copy_addon: data.copy_addon ? "true" : "false",
    // Referral attribution — empty string when absent, same convention as
    // phone/current_website_url above. `ref` = promoter payout key,
    // `src` = channel (tiktok/ig/fb/...). Flows into Stripe Checkout
    // session metadata for every mode below (subscription, onetime,
    // onetime+hosting) since they all spread this same `metadata` object.
    ref: data.ref ?? "",
    src: data.src ?? "",
  }

  const successUrl = `${SITE_URL}/onboarding?session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${SITE_URL}/checkout?tier=${data.tier}&demo=${encodeURIComponent(data.demo)}&cancelled=1`

  // Never quote one price and charge another: /checkout renders promo pricing
  // for every subscription visit, so if the promo is due but its Stripe config
  // is incomplete, fail loudly instead of silently billing standard.
  const promo = decideLaunchPromo(data, priceIds)
  if (promo.kind === "unavailable") {
    console.error("[checkout] promo is due but promo price/coupon env is missing")
    return NextResponse.json(
      { error: "Launch promo is temporarily unavailable. Please try again shortly." },
      { status: 503 }
    )
  }

  try {
    const session = await createSession(data, metadata, priceIds, promo, successUrl, cancelUrl)
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
  promo: PromoDecision,
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
    const setupPrice =
      promo.kind === "active" ? promo.setupPrice : prices.setup
    const sessionMetadata =
      promo.kind === "active" ? { ...metadata, promo: "launch" } : metadata
    return s.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        { price: prices.monthly, quantity: 1 },
        { price: setupPrice, quantity: 1 },
        ...(data.copy_addon ? [{ price: prices.copyAddon, quantity: 1 }] : []),
      ],
      subscription_data: {
        metadata: sessionMetadata,
        // Promo path only: the setup fee bills today and the first monthly
        // invoice lands after the trial, so today's charge is $99 not $198.
        ...(promo.kind === "active"
          ? { trial_period_days: PROMO_TRIAL_DAYS }
          : {}),
      },
      // Stripe's SubscriptionData type does NOT accept discounts —
      // session-level `discounts` is the only valid place for coupons
      // in Checkout subscription mode. The coupon applies $50/mo off
      // for 3 months per its own configuration.
      // Stripe REJECTS specifying both `discounts` and `allow_promotion_codes`
      // (even `allow_promotion_codes: false`). Mutually exclusive params.
      // When the launch promo is auto-applied, omit `allow_promotion_codes`
      // entirely. When no promo, allow customers to enter manual codes.
      ...(promo.kind === "active"
        ? { discounts: [{ coupon: promo.coupon }] }
        : { allow_promotion_codes: true }),
      customer_email: data.email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: sessionMetadata,
    })
  }

  if (data.hosting_addon) {
    // One-time + hosting: same multi-line-item pattern. The $997
    // one-time and the $49/mo hosting both land on the first invoice;
    // hosting recurs monthly thereafter.
    return s.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        { price: prices.hosting, quantity: 1 },
        { price: prices.onetime, quantity: 1 },
        ...(data.copy_addon ? [{ price: prices.copyAddon, quantity: 1 }] : []),
      ],
      subscription_data: { metadata },
      customer_email: data.email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      allow_promotion_codes: true,
    })
  }

  // One-time, no hosting: pure mode=payment with the $997 line item.
  return s.checkout.sessions.create({
    mode: "payment",
    line_items: [
      { price: prices.onetime, quantity: 1 },
      ...(data.copy_addon ? [{ price: prices.copyAddon, quantity: 1 }] : []),
    ],
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
