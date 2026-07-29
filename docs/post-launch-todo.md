# Post-launch TODO

Things deliberately deferred from Phase 4 because they only matter at scale we don't have yet. Listed here so they don't drift out of memory.

**Last reconciled against the code: 2026-07-29.**

## Already shipped (do not re-list as deferred)

### `charge.refunded` — SHIPPED

Verified 2026-07-29 by reading `src/app/api/stripe/webhook/route.ts`. The webhook registers
**three** event types: `checkout.session.completed`, `customer.subscription.deleted`, and
`charge.refunded`.

What `handleChargeRefunded` actually does:

1. Resolves the Stripe customer id off the charge. `charge.refunded` carries **no**
   `session_id`, so the site is found via `getCustomerByStripeId()` → the customer's most
   recent `sites` row (`order by created_at desc limit 1`), rather than by session lookup.
   This handles subscription and one-time refunds uniformly.
2. Idempotent: if the site is already `status='refunded'`, it logs and returns.
3. Flips `sites.status` to `'refunded'`.
4. If the site **was** `live`, calls `unprovisionSite()` to tear down Cloudflare DNS + the
   Vercel domain attach. Failure there is caught and logged so the Slack alert still fires.
5. Pings Slack with the business name, customer email, refunded amount, and whether the site
   had been live.

Known gaps in the shipped handler, if they ever matter:

- **No customer-facing refund confirmation email.** The original spec called for one; only the
  Slack operator ping was implemented. Stripe sends its own refund receipt, so this is a
  nice-to-have, not a correctness bug.
- **"Most recent site" is a heuristic.** A customer with more than one site who is refunded for
  an older purchase gets their *newest* site marked refunded. Fine at current volume (no
  customer has two sites); revisit before any repeat-purchase motion.
- **Partial refunds are treated as full refunds.** The handler reads `amount_refunded` for the
  Slack message but does not compare it to `charge.amount`, so a partial refund still flips the
  site to `'refunded'` and unprovisions a live site.

### Stripe Customer Portal link in `/onboarding` — SHIPPED

Verified 2026-07-29. `src/app/api/billing-portal/route.ts` and
`src/app/api/billing-portal-deep-link/route.ts` exist, and
`src/app/onboarding/billing-button.tsx` is rendered from `src/app/onboarding/page.tsx:224`.
The welcome email also links to `/onboarding?session_id=...#billing` for customers with
recurring billing (subscription tier, or one-time + hosting add-on).

⚠️ Still requires the **one-time Stripe Dashboard portal configuration** described in
`LAUNCH-CHECKLIST.md` §5c. Without it, `POST /api/billing-portal` returns a Stripe error and
the button fails at click time. That config is dashboard-only and has **not** been verified.

## Stripe webhook handlers still to add (in priority order)

### `invoice.payment_failed`

**When to add:** before scaling past ~50 active subscriptions.

**Why:** Stripe retries failed invoice charges over a 3-week dunning cycle by default (smart retries). If we're not handling `invoice.payment_failed`, customers can drop into a state where their card has expired but the site keeps running for weeks until Stripe finally cancels the subscription. By that point the customer has churned without us knowing.

**What to do:** add a handler in `src/app/api/stripe/webhook/route.ts` that:

1. Looks up the site via `subscription.metadata.site_id` (we already set this on session creation in Phase 4d)
2. Sends a Resend email to the customer: "your card was declined, here's a link to update payment method" — the link goes to a Stripe-hosted billing portal session (`stripe.billingPortal.sessions.create`)
3. After 3 consecutive failures (use a counter in `sites` or read `subscription.attempt_count`), pings Slack and adds a soft-warning banner on the customer's onboarding page
4. Don't touch `sites.status` — Stripe's dunning handles the eventual cancellation, which fires `customer.subscription.deleted` (already handled)

### `customer.subscription.updated`

**When to add:** at the same time as `invoice.payment_failed`.

Catches the brief `past_due` → `active` transitions so any warning state gets cleared, and
picks up payment-method changes and unpauses.

Together with `invoice.payment_failed`, these are the **only two** Stripe events still
deferred as of 2026-07-29.

## Other deferred items (not webhook-related)

- **Site-level rate-limit on `/api/contact`** — currently anyone can spam the form. Add an IP-based limiter once spam shows up (Vercel KV or Upstash, ~20 submissions per IP per hour).
- **OG image caching** — `/api/og/[slug]` re-fetches the Fontsource font on every cold edge invocation. Vercel CDN caches the response by URL, so this is fine for steady-state, but a deployment churn could wipe the cache and hit us with 30× cold loads (1 per theme). Pre-warm by curl-ing each `/api/og/{slug}` after deploy. NOTE: also matters now because `<PortfolioCard>` uses these images directly (PR #46), so first portfolio render after a deploy may flash skeletons until edge cache warms.
- **Real Lighthouse audit** — Phase 3 hit 95+ targets in theory but I never measured against a deployed preview. Run before launch.
- **Retire `HeroPhoneFirst` dead code** — PR #53 removed every `hero: "phone-first"` theme
  assignment when Your Shopfront went online-only (the 3 emergency demos moved to
  `form-card`/`booking-card`). Verified 2026-07-29: no theme sets `"phone-first"`, but
  `src/components/home/hero.tsx:175` still dispatches to it and `HeroPhoneFirst` is still
  defined at :228 — unreachable. Cleaning it up means deleting the function AND pruning
  `"phone-first"` from the `HeroPattern` union in `src/lib/themes/types.ts:11`, so it's a
  two-file change, not a one-liner. Carried forward from PR #54, which was closed as
  stale-based rather than merged.

## Notes for whoever picks this up

- `metadata.site_id` is set on both `session.metadata` and `subscription_data.metadata` at checkout-session-create time (`src/app/api/checkout/route.ts`). Both subscription-mode and payment-mode sessions carry it. Use it as the bridge from any Stripe event back to a `sites` row.
- The webhook handler is already idempotent on `checkout.session.completed` (guards via `sites.stripe_session_id` unique constraint). Apply the same pattern to new handlers — Stripe retries aggressively.
- API version pinned to `2024-11-20.acacia` in `src/lib/stripe.ts`. When adding new event types, verify the payload shape against that pinned version, not the latest Stripe docs.
