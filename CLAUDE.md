# Your Shopfront — CLAUDE.md

> Productized website design + hosting for home-service businesses. **30 themes**, standard pricing $299 setup + $149/mo OR $997 one-time. **Currently running a launch promo: $99 setup + $99/mo for first 3 months, then $149/mo standard.** **Wedge product for the axon-growth marketing OS.**

## Strategic Role (read FIRST)

Your Shopfront is **NOT a standalone product** in the long term. It's the **wedge** for `axon-growth` (Path A secondary breakout — LIVE B2B SaaS at axongrowth.ai).

**ICP is identical for both:** home-service SMBs (painters, electricians, HVAC, plumbers, handymen). Same customers buy a website (Your Shopfront), realize they need leads, then upsell into Google Ads + GBP + SEO management (axon-growth).

**4-Stage launch sequence:**
1. ✅ axon-growth launches solo (code-ready, brand-assets blocker)
2. ⏳ Your Shopfront finishes Phase 4e+4f+5 (this repo's work)
3. ⏳ Your Shopfront launches solo (validate funnel)
4. ⏳ Bundle launch — upsell modal, shared Clerk, cross-product webhooks

See `docs/BUNDLE-PLAN.md` for full Stage 4 spec. See `axon-growth/CLAUDE.md` for the upstream side.

## Tech Stack
- **Web:** Next.js 16.2.4 (App Router), React 19.2.4, TypeScript strict
- **Styling:** Tailwind v4 (`@theme` in `globals.css` — NO `tailwind.config.ts`), shadcn/ui
- **Payments:** Stripe 22.1.0 (API version `2024-11-20.acacia` PINNED in `src/lib/stripe.ts`)
- **DB:** Supabase (RLS enabled, no policies = locked-by-default; service-role key server-only)
- **Email:** Resend 6.12.2 · **Forms:** React Hook Form 7.74 + Zod 4.3 · **Animations:** Framer Motion 12.38
- **Deploy:** Vercel (paused until end of Phase 4) · **Package manager:** pnpm

⚠️ **Stripe API version cross-repo:** axon-growth uses `2024-06-20`. If sharing metadata between repos in Stage 4, verify payload schemas match across both versions.

## Commands
```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm typecheck    # tsc --noEmit — MUST pass before commit
pnpm lint         # eslint src/
pnpm build        # next build — verifies all 90 routes
pnpm stripe:setup # idempotent — creates Stripe products + prices
```

## IMPORTANT Rules
- Default branch is **`master`**, not `main`. Use upstream-tracking push.
- All API routes: Zod validation at boundary; never trust client input.
- Stripe webhook (`/api/stripe/webhook`): signature verify FIRST, then idempotency check via `getSiteByStripeSessionId` — bail if row exists.
- Stripe API version `2024-11-20.acacia` is PINNED — do NOT bump without re-testing webhook payload shapes AND cross-checking against axon-growth's `2024-06-20`.
- Service-role Supabase key is server-only — never import in client components.
- Email failures (Resend) are best-effort — log + continue, do NOT block checkout success.

## Authentication (current vs future)

**Current (Phase 4):** Public + anonymous. No Clerk. Customer email captured at Stripe Checkout only. Deliberate for conversion.

**Phase 5.5 (planned):** Optional Clerk sign-up post-purchase for self-service portal (check onboarding status, update content, view invoices). Not required for basic flow.

**Stage 4 / Bundle goal:** **SHARED Clerk org** with axon-growth. Customer signs in once via Clerk, accesses both dashboards. Stripe `customer_id` shared across both products (no duplicate customer objects).

## Critical Stage 4 Integration Hooks (MUST ship before paid GA)

These must be baked in BEFORE Your Shopfront reaches paid general availability, or bundle launch will hit duplicate-customer hell:

### Hook 1 — Shared Stripe customer logic
Before `stripe.checkout.sessions.create()`, call `stripe.customers.list({ email, limit: 1 })`. If found, pass existing `customer` param. If not, let Checkout create. Both Your Shopfront and axon-growth must do this — prevents 2-customer-per-bundle problem.

### Hook 2 — Stripe metadata convention
Every Checkout session metadata must include:
```typescript
metadata: {
  product: 'apex-sites',     // or 'axon-growth' in the other repo
  email: customer_email,
  site_id: <pre-generated>,
  axon_product: null,         // null for apex-sites solo; 'JUST_ADS'|'FULL_SUITE' if bundle
}
```
Future bundle webhook handlers depend on this. Adding later means backfilling old records.

### Hook 3 — Email canonical-key policy
Both repos must enforce same email normalization (lowercase, trim, validate). Don't let bundle customers fragment with personal vs business email variants.

## Next.js 16 critical rules
- `params` is a Promise — must `await params` in dynamic routes.
- `useSearchParams` must be wrapped in `<Suspense>`.
- File is `proxy.ts`, NOT `middleware.ts`.
- Tailwind v4 config lives in `src/app/globals.css` via `@theme {}` — no `tailwind.config.ts`.

## Gotchas
- **30 themes total** (14 industry + 16 design-vibe). Featured 10 canonical to `/demos`, other 20 canonical to `/portfolio` (SEO).
- `<ThemeProvider>` applies only the active theme's font className — don't load all 9 fonts everywhere.
- Stripe checkout has 3 modes (subscription / onetime+hosting / onetime-only) — see `src/lib/stripe.ts` comments.
- Custom-build tier was REMOVED in Phase 2.5 — don't re-introduce.
- Supabase RLS is locked-by-default (no policies). Use service-role key from server components only.
- **`/demos/[slug]` vs `/portfolio/[slug]` differ in chrome**: demos hide Pricing/Showcase/FAQ + add `<MobileStickyCta>` + `<DemoBuyGuarantees>` for ad-traffic immersion + conversion; portfolio keeps the full meta-aware layout for SEO inspiration. Gated on `isDemoPreview` in `themed-home.tsx` — DON'T break this distinction when editing.
- Hardcoded launch promo price (`$99`) lives in 3 places: `src/components/apex/home/hero.tsx`, `src/components/home/pricing.tsx`, `src/components/home/mobile-sticky-cta.tsx`. Update all three when the promo ends, or extract a `pricing-constants.ts` module.

## Do Not Build
- `middleware.ts` (use `proxy.ts`)
- `tailwind.config.ts` (use `@theme` in `globals.css`)
- Custom-build tier — killed Phase 2.5 (all 30 unified as themes)
- Client-side Stripe session creation — server-only
- Direct commits to `main` — branch is `master`
- ❌ **DO NOT bundle with axon-growth before Your Shopfront Phase 5 launches solo + validates standalone funnel.** Stage 4 is months away. Don't add bundle pricing or cross-product upsell flows yet.

## Deferred Webhook Handlers (post-launch-todo.md:7-40)

Current webhook only handles `checkout.session.completed` + `customer.subscription.deleted`. Pre-Stage 4, must add:
- `invoice.payment_failed` (dunning emails)
- `customer.subscription.updated` (payment method changes, unpause)
- `charge.refunded` (refund lifecycle)

## Key Files
- `src/lib/themes/` — 30 theme configs + featured slugs index
- `src/lib/themes/types.ts` — Theme interface incl. `heroImage` (Phase A) and `content?: ThemeContentOverrides` (Phase B0 plumbing)
- `src/lib/stripe.ts` — pinned-version Stripe client + 3-mode checkout
- `src/lib/supabase.ts` — server-only service-role typed helpers
- `src/lib/supabase-server.ts` — anon-key SSR client (cookies-backed) for auth
- `src/proxy.ts` — Next 16 proxy (auth cookie refresh + subdomain routing). Gracefully skips Supabase block when env vars are unset (CI/dev clones without `.env.local`)
- `src/lib/checkout-schema.ts` — Zod schemas (form + API)
- `src/app/api/checkout/route.ts` — Stripe session creation (Hook 1 lives here in future)
- `src/app/api/stripe/webhook/route.ts` — signature-verified, idempotent
- `src/app/api/og/[slug]/route.tsx` — per-theme OG PNG generator (also used as portfolio card previews)
- `src/app/dev/themes/page.tsx` — dev-only audit of all 30 themes
- `src/components/home/themed-home.tsx` — composition for `/demos/[slug]` + `/portfolio/[slug]` (gated on `isDemoPreview`)
- `src/components/home/mobile-sticky-cta.tsx` — fixed-bottom mobile CTA (default + emergency variants)
- `src/components/home/demo-buy-guarantees.tsx` — chrome trust strip before SiteFooter on demos
- `supabase/migrations/0001_initial.sql` — `customers` + `sites` tables, RLS, triggers
- `scripts/create-stripe-products.ts` — Phase 4a setup script
- `scripts/fetch-hero-images.mjs` — Phase A hero photo fetcher
- `scripts/fetch-cta-images.mjs` — Phase B1.5 dedicated CTA bg photo fetcher
- `docs/demos-photo-credits.md` — Phase A + B1.5 photo attribution
- `README.md` — full architecture deep-dive + manual setup
- `docs/BUNDLE-PLAN.md` — Stage 4 integration spec (Your Shopfront ↔ axon-growth)

## Status pointers
- Phases 0-4d shipped. 4e (onboarding) + 4f (test plan) pending. 5+ (provisioning, admin, portal, static pages, launch) pending.
- **Phase A + Phase B (demo redesign) shipped 2026-05-25** — see `project_phase_b_complete` memory entry. 12 PRs merged in a single session: hero photos for all 30 themes; per-theme content/imagery for HowItWorks/TrustStrip/FinalCTA; immersion pass (hid Pricing/Showcase/FAQ on demos); per-theme HowItWorks headers; rebrand Apex Sites → Your Shopfront; mobile sticky CTA bar (with emergency-theme phone variant); portfolio cards switched to OG previews + $99 launch badge; chrome buyer-guarantees strip; CI fix (proxy gracefully skips Supabase block without env). Master HEAD `6ec3763`.
- CI `build-and-smoke` job is now green (was failing on every merge for weeks before 2026-05-25's #45 fix).
