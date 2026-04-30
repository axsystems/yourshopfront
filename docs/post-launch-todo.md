# Post-launch TODO

Things deliberately deferred from Phase 4 because they only matter at scale we don't have yet. Listed here so they don't drift out of memory.

## Stripe webhook handlers to add (in priority order)

### `invoice.payment_failed`

**When to add:** before scaling past ~50 active subscriptions.

**Why:** Stripe retries failed invoice charges over a 3-week dunning cycle by default (smart retries). If we're not handling `invoice.payment_failed`, customers can drop into a state where their card has expired but the site keeps running for weeks until Stripe finally cancels the subscription. By that point the customer has churned without us knowing.

**What to do:** add a handler in `src/app/api/stripe/webhook/route.ts` that:

1. Looks up the site via `subscription.metadata.site_id` (we already set this on session creation in Phase 4d)
2. Sends a Resend email to the customer: "your card was declined, here's a link to update payment method" — the link goes to a Stripe-hosted billing portal session (`stripe.billingPortal.sessions.create`)
3. After 3 consecutive failures (use a counter in `sites` or read `subscription.attempt_count`), pings Slack and adds a soft-warning banner on the customer's onboarding page
4. Don't touch `sites.status` — Stripe's dunning handles the eventual cancellation, which fires `customer.subscription.deleted` (already handled)

Add a `customer.subscription.updated` handler at the same time so we catch the brief `past_due` → `active` transitions and clear any warning state.

### `charge.refunded`

**When to add:** when refund volume justifies, probably ~5+ refunds/month.

**Why:** today, a refund is a manual operation in the Stripe dashboard. The webhook fires but we ignore it. Result: the `sites` row stays at whatever status it was (often `live`), the customer keeps using their site after a refund, and admin reporting is wrong.

**What to do:** add a handler that:

1. Reads `charge.payment_intent` to get the PaymentIntent → look up the Checkout session that created it
2. Updates the matching `sites.status` to `'refunded'`
3. If the site is currently `live`, kick off de-provisioning (DNS removal, project deletion) — this needs Phase 5 provisioning to exist first
4. Resend email to customer confirming the refund
5. Slack ping

Pre-Phase-5 (no provisioning): just flip status to `'refunded'`, manually take the site down via Vercel dashboard.

## Other deferred items (not webhook-related)

- **Stripe Customer Portal link in /onboarding** — give subscription customers a self-service way to update payment method, change billing email, view invoices. Spec: `stripe.billingPortal.sessions.create({ customer, return_url })`, render link inline on the onboarding page once site is `live`.
- **Site-level rate-limit on `/api/contact`** — currently anyone can spam the form. Add an IP-based limiter once spam shows up (Vercel KV or Upstash, ~20 submissions per IP per hour).
- **OG image caching** — `/api/og/[slug]` re-fetches the Fontsource font on every cold edge invocation. Vercel CDN caches the response by URL, so this is fine for steady-state, but a deployment churn could wipe the cache and hit us with 24× cold loads. Pre-warm by curl-ing each `/api/og/{slug}` after deploy.
- **Real Lighthouse audit** — Phase 3 hit 95+ targets in theory but I never measured against a deployed preview. Run before launch.

## Notes for whoever picks this up

- `metadata.site_id` is set on both `session.metadata` and `subscription_data.metadata` at checkout-session-create time (`src/app/api/checkout/route.ts`). Both subscription-mode and payment-mode sessions carry it. Use it as the bridge from any Stripe event back to a `sites` row.
- The webhook handler is already idempotent on `checkout.session.completed` (guards via `sites.stripe_session_id` unique constraint). Apply the same pattern to new handlers — Stripe retries aggressively.
- API version pinned to `2024-11-20.acacia` in `src/lib/stripe.ts`. When adding new event types, verify the payload shape against that pinned version, not the latest Stripe docs.
