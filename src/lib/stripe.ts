import "server-only"
import Stripe from "stripe"

// Pin the API version this SDK client sends on outbound requests (session
// creation, retrieves, etc.) and the version its TypeScript types are
// checked against. This pin does NOT control the shape of inbound webhook
// payloads — that is governed by the version registered on the webhook
// ENDPOINT itself in the Stripe dashboard (live endpoint we_1TZhpEPtsGoTnNPRInbrWG8S
// is registered at '2025-12-15.clover', independent of this pin). Worth
// noting: the SDK's generated types are built against an even newer version
// than either of those (see LatestApiVersion below), so compile-time types
// don't match the runtime webhook payload either — Stripe.Event's shape is
// a best-effort approximation, not a guarantee, regardless of this pin. If
// webhook payload assumptions ever need re-verifying, check the endpoint's
// registered version, not this constant. The setup script
// (scripts/create-stripe-products.ts) is allowed to run unpinned because
// it isn't sensitive to either.
//
// stripe-node v22 ships TypeScript types matching '2026-04-22.dahlia'
// (the SDK's LatestApiVersion). We pin to '2024-11-20.acacia' for
// outbound-request stability — Stripe's documented pattern is a type-error
// suppression comment on the apiVersion line below when pinning to an older
// version than LatestApiVersion. When upgrading STRIPE_API_VERSION to a
// newer pin, remove that suppression comment if it then matches LatestApiVersion.
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
