/**
 * Your Shopfront — Stripe products + prices setup
 *
 * Run once:
 *   pnpm stripe:setup
 *
 * Run again is safe — the script is idempotent. It searches Stripe by
 * metadata.shopfront_product_id (NOT name — name collisions are common,
 * and the parent Axon Labs LLC Stripe account hosts other product lines)
 * and only creates products + prices that don't already exist for the
 * currently-authenticated Stripe account.
 *
 * Test mode vs live mode is controlled by STRIPE_SECRET_KEY:
 *   - Test:  STRIPE_SECRET_KEY=sk_test_xxx pnpm stripe:setup
 *   - Live:  STRIPE_SECRET_KEY=sk_live_xxx pnpm stripe:setup
 *
 * The script reads STRIPE_SECRET_KEY from .env.local automatically (via
 * the --env-file flag in the npm script). After it finishes, it prints
 * the four resolved price IDs as a .env-snippet for you to paste into
 * .env.local (and later into your Vercel project env).
 *
 * Each product is created with statement_descriptor: "YOURSHOPFRONT".
 * That isolates the descriptor from other Axon Labs LLC products in the
 * shared Stripe account (apex-studio, axon-growth, ai-researcher).
 *
 * Creates 4 products:
 *   1. Subscription Setup       — $499 one-time
 *   2. Subscription Monthly     — $199/mo recurring
 *   3. One-time Build           — $2,997 one-time
 *   4. Hosting Addon            — $29/mo recurring
 */

import Stripe from "stripe"

const STATEMENT_DESCRIPTOR = "YOURSHOPFRONT"

interface ProductSpec {
  productKey: string
  name: string
  description: string
  envVar: string
  unitAmount: number
  recurring: boolean
}

const PRODUCTS: ProductSpec[] = [
  {
    productKey: "subscription_setup",
    name: "Your Shopfront — Subscription Setup",
    description:
      "One-time setup fee for the Your Shopfront subscription tier. Pairs with the $199/mo recurring plan.",
    envVar: "STRIPE_PRICE_SUBSCRIPTION_SETUP",
    unitAmount: 49900, // $499.00
    recurring: false,
  },
  {
    productKey: "subscription_monthly",
    name: "Your Shopfront — Subscription Monthly",
    description:
      "Monthly hosting + unlimited edits + Google Business profile management for Your Shopfront subscription customers.",
    envVar: "STRIPE_PRICE_SUBSCRIPTION_MONTHLY",
    unitAmount: 19900, // $199.00 / month
    recurring: true,
  },
  {
    productKey: "onetime_build",
    name: "Your Shopfront — One-time Build",
    description:
      "One-time build of a Your Shopfront homepage in any of our 30 theme designs. Full source code delivered on launch.",
    envVar: "STRIPE_PRICE_ONETIME",
    unitAmount: 299700, // $2,997.00
    recurring: false,
  },
  {
    productKey: "hosting_addon",
    name: "Your Shopfront — Hosting Addon",
    description:
      "Optional managed hosting + maintenance for one-time-build customers. Vercel + Cloudflare hosting, SSL, backups, security patches.",
    envVar: "STRIPE_PRICE_HOSTING_ADDON",
    unitAmount: 2900, // $29.00 / month
    recurring: true,
  },
]

async function main(): Promise<void> {
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    console.error("✗ STRIPE_SECRET_KEY is not set. Set it in .env.local and re-run.")
    process.exit(1)
  }
  if (apiKey.includes("xxx") || apiKey === "sk_test_xxx") {
    console.error(
      "✗ STRIPE_SECRET_KEY appears to be a placeholder. Replace with a real test or live key in .env.local."
    )
    process.exit(1)
  }
  const mode = apiKey.startsWith("sk_live_") ? "LIVE" : "TEST"
  console.error(`→ Using Stripe in ${mode} mode (${apiKey.slice(0, 8)}…)`)
  console.error("")

  const stripe = new Stripe(apiKey)
  const resolved: Record<string, string> = {}

  for (const spec of PRODUCTS) {
    const priceId = await ensureProductAndPrice(stripe, spec)
    resolved[spec.envVar] = priceId
  }

  console.error("")
  console.error("✓ Done. Paste the lines below into .env.local:")
  console.error("")

  // Print the env snippet to STDOUT so users can pipe to a file if they want.
  for (const spec of PRODUCTS) {
    console.log(`${spec.envVar}=${resolved[spec.envVar]}`)
  }
}

async function ensureProductAndPrice(
  stripe: Stripe,
  spec: ProductSpec
): Promise<string> {
  const existing = await findProductByKey(stripe, spec.productKey)
  let product: Stripe.Product
  if (existing) {
    console.error(`= ${spec.productKey} — product exists (${existing.id})`)
    product = existing
  } else {
    console.error(`+ ${spec.productKey} — creating product`)
    product = await stripe.products.create({
      name: spec.name,
      description: spec.description,
      statement_descriptor: STATEMENT_DESCRIPTOR,
      metadata: { shopfront_product_id: spec.productKey },
    })
  }

  const matchingPrice = await findMatchingPrice(stripe, product.id, spec)
  if (matchingPrice) {
    console.error(
      `= ${spec.productKey} — price exists (${matchingPrice.id}, $${(spec.unitAmount / 100).toFixed(2)}${spec.recurring ? "/mo" : ""})`
    )
    return matchingPrice.id
  }

  console.error(
    `+ ${spec.productKey} — creating price ($${(spec.unitAmount / 100).toFixed(2)}${spec.recurring ? "/mo" : ""})`
  )
  const newPrice = await stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: spec.unitAmount,
    recurring: spec.recurring ? { interval: "month" } : undefined,
    metadata: { shopfront_product_id: spec.productKey },
  })
  return newPrice.id
}

async function findProductByKey(
  stripe: Stripe,
  productKey: string
): Promise<Stripe.Product | null> {
  const result = await stripe.products.search({
    query: `metadata['shopfront_product_id']:'${productKey}' AND active:'true'`,
    limit: 1,
  })
  return result.data[0] ?? null
}

async function findMatchingPrice(
  stripe: Stripe,
  productId: string,
  spec: ProductSpec
): Promise<Stripe.Price | null> {
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  })
  return (
    prices.data.find((p) => {
      if (p.unit_amount !== spec.unitAmount) return false
      if (p.currency !== "usd") return false
      const isRecurring = p.recurring !== null
      if (isRecurring !== spec.recurring) return false
      if (spec.recurring && p.recurring?.interval !== "month") return false
      return true
    }) ?? null
  )
}

main().catch((err) => {
  console.error("✗ Stripe setup failed:")
  console.error(err)
  process.exit(1)
})
