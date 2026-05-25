# apex-sites ↔ axon-growth Bundle Plan (Stage 4)

> **Status:** Spec only. Implementation deferred until apex-sites Phase 5 launches solo + validates standalone funnel.
> Locks the integration story so we don't drift during Phases 4e / 4f / 5.

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

### Stage 3 — apex-sites solo launch
- Launch with standalone pricing only ($149/mo or $997 once)
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

These bake into the standalone work, NOT bundle-specific:
- ✅ Hook 1 — Shared Stripe customer logic (both repos)
- ✅ Hook 2 — Stripe metadata convention (both repos)
- ✅ Hook 3 — Email canonical-key policy (both repos)

See `apex-sites/CLAUDE.md` and `axon-growth/CLAUDE.md` for hook specs.

## References

- apex-sites/CLAUDE.md — strategic role + 3 hooks
- axon-growth/CLAUDE.md — Cross-Product Integration section (Stage 4)
- `~/.claude/projects/.../memory/apex-sites-status.md` — phase history
- `~/.claude/projects/.../memory/axon-growth-status.md` — launch readiness
