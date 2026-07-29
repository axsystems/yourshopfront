# apex-sites ↔ axon-growth Bundle Plan (Stage 4)

> **Status:** Spec only. Implementation deferred until Your Shopfront launches solo + validates
> the standalone funnel. Locks the integration story so we don't drift.
>
> **Verified against this repo 2026-07-29.** The Stage 4 plan itself still stands — nothing in
> it has been contradicted by the code. Two things needed correcting, both about *this repo's
> current state* rather than the plan: the Hook status at the bottom, and the fact that Stage 3
> is already underway (see below). Naming note: "apex-sites" throughout this document means
> **Your Shopfront** — the product was renamed 2026-05-25 and the Hook 2 metadata value
> `product: 'apex-sites'` is deliberately kept as-is so the cross-repo contract doesn't move.

> ⚠️ **Stage 3 has effectively already started.** This doc describes Stage 3 as a future step,
> but as of 2026-07-29 Your Shopfront is live at https://yourshopfront.com in Stripe **live
> mode**. It is taking real money **before** Hooks 1–3 shipped (see the corrected Hook status at
> the bottom of this file). Per `CLAUDE.md`, those hooks were supposed to land before paid GA.
> Every live sale from here on creates a Stripe customer with no bundle-compatible metadata,
> which means a backfill later. Not a launch-blocker; do not let it drift silently.

## The bundle play

| Tier | Setup | Monthly | What you get |
|---|---|---|---|
| apex-sites alone | $299 | $149 | Website only |
| axon-growth JUST_ADS alone | $497 | $497 | Google Ads + GBP mgmt only |
| **Site + Ads bundle** | **$697** ($200 off) | **$499** | Website + ads (saves ~$197/mo) |
| **Site + Full Suite bundle** | **$997** | **$797** | Website + full marketing OS |

Expected conversion: 10 apex-sites customers × 20% bundle take = +$1k MRR on axon-growth from zero new marketing spend.

## ICP rationale

Both products target **home-service SMBs** (painters, electricians, HVAC, plumbers, handymen). Same customers. Natural journey:
1. Small HVAC company needs a website → buys apex-sites
2. Month 2: site is live, no leads yet → realizes needs Google Ads
3. Sees upsell modal during checkout OR post-launch email pitch → upgrades to bundle

apex-sites = wedge. axon-growth = lift.

## 4-Stage launch sequence

### Stage 1 — axon-growth solo launch (NOW)
- axon-growth is code-launch-ready (103 API routes, 72 pages, Google Ads operational)
- Blocker: brand assets (logo, demo video). Brand work + GTM = 1-2 weeks
- Goal: validate ICP via real paying customers on axon-growth alone

### Stage 2 — apex-sites finish Phase 4e+4f+5 (parallel to Stage 1)
- Phase 4e: `/onboarding` page (4-step content checklist)
- Phase 4f: E2E test plan execution
- Phase 5: Provisioning pipeline (Vercel API + Cloudflare DNS)
- **Bake in Hook 1 + Hook 2 + Hook 3** during this work (see apex-sites/CLAUDE.md)

### Stage 3 — apex-sites solo launch — **IN PROGRESS as of 2026-07-29**
- Launch with standalone pricing only ($299 setup + $149/mo, or $997 once)
- ⚠️ A **launch promo is live** on `/start`: $99 setup + $99/mo for 3 months, then $149/mo.
  It is standalone pricing (no bundle), so it does not violate this stage — but the conversion
  math this stage is meant to validate will be measured against promo pricing, not list price.
- There is also a **$199 copy-writing add-on** sold at checkout and via
  `/api/checkout/copy-upgrade`, which post-dates this plan and is not reflected in the bundle
  pricing table above.
- Get 5-10 customers through standalone funnel
- Validate the conversion math before adding bundle complexity

### Stage 4 — Bundle launch
- Add upsell modal on apex-sites checkout
- Add `?ref=apexsites` detection on axongrowth.ai landing
- Roll out bundle pricing
- Shared Clerk org for unified login
- Cross-product webhook trigger (site goes live → axon-growth campaign template)

## Stage 4 implementation spec

### Cross-product upsell flow

```
apex-sites checkout
  ↓
Select tier + demo
  ↓
[NEW: collapsible modal] "Once your site is live, you'll want leads.
                          Add Google Ads + GBP management for $497/mo?
                          [Yes, add marketing trial] [No thanks]"
  ↓
If yes: pass want_axon_growth_trial=true to /api/checkout
  ↓
apex-sites session creates AND emails customer:
  "Your site purchase is complete. To activate your marketing trial,
   click here: https://axongrowth.ai/signup?ref=apexsites&email={email}&promo=APEX_BUNDLE"
  ↓
axon-growth landing detects ?ref=apexsites:
  - Pre-fills email
  - Shows bundle pricing tier (with the $200 setup + $97/mo discount applied)
  - Shows note: "Welcome from Your Shopfront! Your bundle discount is active."
  ↓
axon-growth Stripe Checkout uses Hook 1: existing Stripe customer ID (created by apex-sites)
  → NO duplicate customer in Stripe
```

### Shared Clerk org pattern

After apex-sites Phase 5.5 ships optional Clerk:
1. Customer signs into apex-sites with Clerk → creates/fetches Clerk Organization for their business
2. Bundle upsell → axon-growth signup detects Clerk session, attaches same Organization
3. Both products dashboard accessible from single Clerk sign-in

### Cross-product webhook trigger

When apex-sites site status flips to `live`:
```typescript
// apex-sites webhook handler
await notifyAxonGrowth({
  event: 'apex_site_launched',
  site_id: site.id,
  email: customer.email,
  stripe_customer_id: customer.stripe_customer_id,
  business_name: site.business_name,
  industry: site.industry,
  live_url: site.live_url,
  timestamp: new Date().toISOString(),
})
```
axon-growth receives via secured endpoint or shared Upstash queue → creates warm-intro task + pre-stages Google Ads landing page template.

## Decisions still pending (operator)

- **Canonical email policy** — business email preferred? domain validation enforced?
- **Cancellation cascade** — if customer cancels apex-sites, auto-pause axon-growth? (recommendation: NO, manual operator decision per case)
- **Bundle vs separate Stripe Products** — single Stripe Price bundle with multiple line items, or separate product subscriptions linked by Org ID?
- **Cross-product analytics** — shared Posthog/Mixpanel project? Same GA4 property? Or per-product separate?
- **Sales tax compliance** — bundle vs separate may have different sales-tax-by-state implications. Talk to CPA before pricing locks.

## DO NOT do before Stage 3 validation

- ❌ Build bundle pricing on either repo's landing page
- ❌ Add upsell modal to apex-sites checkout
- ❌ Add ?ref tracking to axon-growth landing
- ❌ Cross-product webhooks
- ❌ Shared Clerk org logic

All of the above wait until apex-sites is GA standalone AND has 5-10 customers through the standalone funnel. Premature integration = compounded debugging.

## What we DO need before Stage 3 (Hooks 1, 2, 3)

These bake into the standalone work, NOT bundle-specific.

⚠️ **Status corrected 2026-07-29.** The ✅ marks here previously read as "done". **None of the
three is implemented in this repo.** Verified by reading `src/app/api/checkout/route.ts` and
`src/lib/checkout-schema.ts`:

| Hook | Spec | Actual state in this repo (2026-07-29) |
| --- | --- | --- |
| Hook 1 — shared Stripe customer | Call `stripe.customers.list({ email, limit: 1 })` before `checkout.sessions.create()` and reuse an existing customer | ❌ **Not implemented.** No `stripe.customers.list` call anywhere. Subscription modes rely on `customer_email`; the one-time mode uses `customer_creation: "always"`, which mints a **new** Stripe customer on every purchase. |
| Hook 2 — metadata convention | Session metadata must carry `product` and `axon_product` | ❌ **Not implemented.** Metadata carries `site_id`, `tier`, `demo_slug`, `business_name`, `contact_name`, `email`, `phone`, `industry`, `current_website_url`, `hosting_addon`, `copy_addon` — and `promo` on the launch path. Neither `product` nor `axon_product` appears in the codebase. |
| Hook 3 — email canonical key | Lowercase + trim + validate on both repos | ⚠️ **Partial.** `CheckoutRequestSchema` validates the email and caps its length, but does **not** `.toLowerCase()` or `.trim()` it. `get_customer_by_email()` (migration `0009`) does compare case-insensitively, so the DB-side lookup is safe; the stored value is whatever the customer typed. |

Consequence if left as-is: the same person buying both products fragments into two Stripe
customers and, with mixed-case emails, potentially two `customers` rows. That is the exact
"duplicate-customer hell" this section exists to prevent. Adding the hooks later means
backfilling every record created in the meantime.

Not a launch-blocker for standalone operation — but it should be fixed before bundle work
starts, and the longer live sales run, the larger the backfill.

See `CLAUDE.md` (this repo) and `axon-growth/CLAUDE.md` for the hook specs.

## References

- `PROJECT-STATE.md` (this repo) — current live status, blockers, next actions
- `CLAUDE.md` (this repo) — strategic role + 3 hooks
- axon-growth/CLAUDE.md — Cross-Product Integration section (Stage 4)
- `~/.claude/projects/.../memory/apex-sites-status.md` — phase history
- `~/.claude/projects/.../memory/axon-growth-status.md` — launch readiness
