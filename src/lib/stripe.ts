import "server-only"
import Stripe from "stripe"

// Pin the API version. Webhook payload shapes can shift between Stripe
// API versions; pinning keeps production stable until we explicitly
// upgrade. The setup script (scripts/create-stripe-products.ts) is
// allowed to run unpinned because it doesn't depend on payload shape.
//
// stripe-node v22 ships TypeScript types matching '2026-04-22.dahlia'
// (the SDK's LatestApiVersion). We pin to '2024-11-20.acacia' for
// stability — Stripe's documented pattern is @ts-expect-error on the
// apiVersion line when pinning to an older version than LatestApiVersion.
// When upgrading STRIPE_API_VERSION to a newer pin, re-verify webhook
// payload assumptions and remove the @ts-expect-error if it then matches.
const STRIPE_API_VERSION = "2024-11-20.acacia"

let cached: Stripe | null = null

/**
 * Lazily-instantiated server-side Stripe client. Throws at first call
 * (request time) if STRIPE_SECRET_KEY is missing — `next build` doesn't
 * trip on this because nothing at module-init touches process.env.
 */
export function stripe(): Stripe {
  if (cached) return cached
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error("stripe(): STRIPE_SECRET_KEY must be set in env")
  }
  cached = new Stripe(key, {
    // @ts-expect-error — pinning to an older API version than the SDK's
    // LatestApiVersion. Stripe documents this as the official pattern.
    apiVersion: STRIPE_API_VERSION,
  })
  return cached
}
