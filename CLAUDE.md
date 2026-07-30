# Your Shopfront — CLAUDE.md

> Productized website design + hosting for home-service businesses. **30 themes**, standard pricing $299 setup + $149/mo OR $997 one-time. **Currently running a launch promo: $99 setup + $99/mo for first 3 months, then $149/mo standard.** **Wedge product for the axon-growth marketing OS.**

## Status — read `PROJECT-STATE.md` FIRST

The site is **LIVE at https://yourshopfront.com and taking live-mode Stripe payments.** Do not
treat this repo as pre-launch. `PROJECT-STATE.md` is the single current-status doc (what's live,
what's blocked, next actions) — **don't duplicate it here, update it there.** Standing caveat:
the **post-payment path has never been exercised against production** (welcome email, worksheet,
provisioning). Checkout is proven live; everything after it is not.

Doc map: `PROJECT-STATE.md` (status) · `README.md` (architecture + local setup) ·
`LAUNCH-CHECKLIST.md` (go-live gate) · `docs/post-launch-todo.md` (deferred) ·
`docs/marketing-launch-playbook.md` (sales) · `docs/BUNDLE-PLAN.md` (Stage 4) ·
`docs/phase-4-test-plan.md` (manual Stripe plan) · `docs/history/` (archived redesign +
launch-audit records — historical snapshots, not current state).

## Strategic Role

Your Shopfront is **NOT a standalone product** long-term. It's the **wedge** for `axon-growth`
(LIVE B2B SaaS at axongrowth.ai). **ICP is identical:** home-service SMBs (painters,
electricians, HVAC, plumbers, handymen). They buy a website here, realize they need leads, then
upsell into Google Ads + GBP + SEO management there.

**4-Stage launch sequence:**

1. ✅ axon-growth launches solo
2. ✅ Your Shopfront ships the full funnel (checkout, onboarding, provisioning, portal)
3. ⏳ Your Shopfront validates the funnel solo — site is live, but no end-to-end prod sale yet
4. ⏳ Bundle launch — upsell modal, shared identity, cross-product webhooks

See `docs/BUNDLE-PLAN.md` for the Stage 4 spec. See `axon-growth/CLAUDE.md` for the upstream side.

## Tech Stack

- **Web:** Next.js 16.2.4 (App Router), React 19.2.4, TypeScript strict
- **Styling:** Tailwind v4 (`@theme` in `globals.css` — NO `tailwind.config.ts`), shadcn/ui
- **Payments:** Stripe 22.1.0 (API version `2024-11-20.acacia` PINNED in `src/lib/stripe.ts`)
- **DB/Auth:** Supabase — Postgres + RLS, and Supabase **magic-link auth** for the `/app` portal
- **AI:** `@anthropic-ai/sdk` — `claude-haiku-4-5-20251001` for both sales chat and copy drafting
- **Email:** Resend 6.12.2 · **SMS:** Quo (operator alerts) · **Forms:** RHF 7.74 + Zod 4.3
- **Deploy:** Vercel, **LIVE on `master`** · **pnpm** (`packageManager: pnpm@10.28.0`)

⚠️ **CI:** `.github/workflows/ci.yml` must NOT pass `version:` to `pnpm/action-setup` —
`package.json`'s `packageManager` is the only source of truth. Two sources means the action
hard-errors and every job dies in ~5s (this happened; fixed in PR #57). CI runs Node 20.

⚠️ **Stripe API version cross-repo:** axon-growth uses `2024-06-20`. If sharing metadata between
repos in Stage 4, verify payload schemas match across both versions.

## Commands

```bash
pnpm dev          # http://localhost:3000
pnpm typecheck    # tsc --noEmit — MUST pass before commit
pnpm lint         # eslint src/
pnpm build        # next build
pnpm test:e2e     # Playwright — 5 smoke tests (tests/e2e/smoke.spec.ts)
pnpm stripe:setup # idempotent — creates Stripe products + prices
pnpm brand:export # regenerate PNG brand assets from SVG masters
```

## IMPORTANT Rules

- Default branch is **`master`**, not `main`. Use upstream-tracking push.
- All API routes: Zod validation at boundary; never trust client input.
- Stripe webhook (`/api/stripe/webhook`): signature verify FIRST, then idempotency check via
  `getSiteByStripeSessionId` — bail if row exists.
- Stripe API version `2024-11-20.acacia` is PINNED — do NOT bump without re-testing webhook
  payload shapes AND cross-checking against axon-growth's `2024-06-20`.
- Service-role Supabase key is server-only — never import in client components.
- Auth gates are `requireAuth()` / `getCurrentUser()` (`src/lib/auth.ts`), which call
  `supabase.auth.getUser()`. **Never `getSession()` for authorization** — it reads the cookie
  without server verification. The proxy's `getUser()` call refreshes cookies only; its result
  is deliberately discarded.
- Email/SMS/Slack failures are best-effort — log + continue, do NOT block checkout success.

## Route surface

**Pages (27)** — `/` `/about` `/pricing` `/portfolio` `/portfolio/[slug]` `/demos/[slug]` `/start` (promo landing) `/contact` `/checkout` `/privacy` `/terms` `/refund-policy` `/dev/themes` `/tenant` (subdomain render target) · **onboarding:** `/onboarding` `/onboarding/worksheet` `/onboarding/discovery` `/onboarding/copy-review` · **portal:** `/login` `/login/check-email` `/access` `/app` `/app/billing` `/app/edit-requests` `/app/edit-requests/new` `/app/edit-requests/[id]` · **admin:** `/admin/copy-review/[siteId]`

**Route handlers (17)** — `/api/checkout` `/api/checkout/copy-upgrade` `/api/stripe/webhook` `/api/billing-portal` `/api/billing-portal-deep-link` `/api/refund-request` `/api/access` `/api/contact` `/api/chat` `/api/chat/health` `/api/onboarding/status` `/api/upload/sign` `/api/og/[slug]` `/api/cron/provision` `/api/provisioning/approve` · **plus, NOT under `/api`:** `/auth/callback` (magic-link PKCE exchange) and `/auth/signout` (POST, Origin-checked).

⚠️ **`/demos` (index, no slug) is a 404** — `src/app/demos/` has only `[slug]/`, no `page.tsx`.
Don't link to it or describe it as a page.

## Authentication

**Public/anonymous path (unchanged):** browse, `/checkout`, Stripe. No account needed to buy.
Post-purchase the Stripe `session_id` is a **bearer token** for `/onboarding*` and
`/api/refund-request`; the site row resolves via `getSiteByStripeSessionId`.

**Customer portal (`/app/*`) — SHIPPED, on Supabase Auth, NOT Clerk.** Magic link via
`signInWithOtp` at `/login`, `/auth/callback` exchanges the PKCE code, `requireAuth()` gates every
portal page and Server Action. It also requires a matching `customers` row (via the
`get_customer_by_email` SECURITY DEFINER RPC), so authenticating without a purchase redirects to
`/login?error=no_customer`. `/access` is the lost-welcome-email recovery flow (rate-limited,
enumeration-safe — always returns the same body).

**Admin (`/admin/copy-review/[siteId]`, `/api/provisioning/approve`):** `ADMIN_PASSWORD` bearer
token (`Authorization` header or `?token=`), compared with `timingSafeEqual`. A launch shortcut,
not a long-term pattern — rotate the secret, replace with real sessions.

⚠️ **Conflict to resolve before Stage 4:** the bundle plan assumes a _shared Clerk org_, but this
repo shipped Supabase Auth. Reconcile the identity story before building the bundle.

## Critical Stage 4 Integration Hooks (MUST ship before bundle launch)

These must be baked in BEFORE bundling, or bundle launch will hit duplicate-customer hell:

### Hook 1 — Shared Stripe customer logic

Before `stripe.checkout.sessions.create()`, call `stripe.customers.list({ email, limit: 1 })`.
If found, pass existing `customer` param. If not, let Checkout create. Both Your Shopfront and
axon-growth must do this — prevents the 2-customer-per-bundle problem.

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

Both repos must enforce the same email normalization (lowercase, trim, validate). Don't let
bundle customers fragment across personal vs business email variants.

## Next.js 16 critical rules

- `params` is a Promise — must `await params` in dynamic routes. Same for `searchParams`.
- `useSearchParams` must be wrapped in `<Suspense>`.
- File is `src/proxy.ts`, NOT `middleware.ts`.
- Tailwind v4 config lives in `src/app/globals.css` via `@theme {}` — no `tailwind.config.ts`.

## Gotchas

- **30 themes total** (14 home-service + 8 abstract + 8 brand-personality) in the `all` array of `src/lib/themes/index.ts`. The dir has 32 `.ts` files — `css-vars.ts` and `with-overrides.ts` are helpers, not themes. Featured 10 canonical to `/demos`, other 20 to `/portfolio` (SEO).
- `<ThemeProvider>` applies only the active theme's font className — don't load all fonts everywhere.
- Stripe checkout has 3 modes (subscription / onetime+hosting / onetime-only) — see `src/lib/stripe.ts`.
- Custom-build tier was REMOVED in Phase 2.5 — don't re-introduce.
- Supabase RLS is locked-by-default. Portal reads go through service-role helpers, not anon RLS.
- **`/demos/[slug]` vs `/portfolio/[slug]` differ in chrome**: demos hide Pricing/Showcase/FAQ and add `<MobileStickyCta>` + `<DemoBuyGuarantees>` for ad-traffic immersion; portfolio keeps the full meta-aware layout for SEO. Gated on `isDemoPreview` in `themed-home.tsx` — don't break it.
- **All user-visible prices route through `src/lib/pricing-constants.ts`** — import from it, never add a new hardcoded literal. That file is display-only: it does NOT change what Stripe charges (real amounts live in Stripe price IDs, read server-side in `lib/stripe.ts`). Change a number here without updating the Stripe price/coupon and the site quotes one figure and charges another. When auditing for drift, grep `\$[0-9]`, not just the four known numbers — that narrow pattern is exactly how `$49` was missed.
- **`supabase/migrations/` holds 13 files (`0001`–`0013`).** A fresh project needs all 13 — `0007_copy_addon`, `0008_ai_copy_state`, `0009_auth_customer_link`, `0010_edit_requests`, `0012_edit_request_append_comment`, and `0013_referral_tracking` are load-bearing, not cosmetic. There is **no migration ledger** on the production project (every migration was applied by hand), so `supabase migration list` always reports nothing and nothing prevents a double-apply. `0001`–`0004` are non-idempotent.
- **The OG preview image is a static PNG generated from `public/brand/og-default.svg` by `pnpm brand:export`.** It is NOT regenerated automatically — source and output silently diverged for months, shipping dead pricing and the retired "Apex Sites" brand on every social share. After editing the SVG, always re-export, **open the PNG and look at it**, and ship it under a NEW filename (currently `og-v3.png`): Facebook caches OG images per URL, so an in-place edit keeps serving the stale asset. Update all five call sites plus the `src/proxy.ts` matcher exclusion.
- **CSP is a live tripwire for anything third-party.** `next.config.ts` blocked Google Analytics for 66 days without a single visible error — the tag was in the HTML and collected nothing. Any new script, beacon, font, or worker needs its origin added, and must be verified in a real browser console, not inferred from the header. PostHog is routed same-origin through `/ingest` (`src/app/ingest/[...path]/route.ts`) which strips `Cookie`/`Authorization` before forwarding — a plain `rewrites()` would leak Supabase session tokens to a third party.
- `vercel.json` runs `/api/cron/provision` **every minute**, batch-capped at 5 sites/tick.

## Do Not Build

- `middleware.ts` (use `proxy.ts`) · `tailwind.config.ts` (use `@theme` in `globals.css`)
- Custom-build tier — killed Phase 2.5 (all 30 unified as themes)
- Client-side Stripe session creation — server-only
- Direct commits to `main` — branch is `master`
- ❌ **DO NOT bundle with axon-growth before the standalone funnel is validated in production.** Don't add bundle pricing or cross-product upsell flows yet.

## Stripe webhook events

`/api/stripe/webhook` handles **three** events; everything else is ignored:

- **`checkout.session.completed`** — two paths. If `metadata.upgrade === 'copy_addon'`, applies the $199 copy add-on to an existing site. Otherwise: idempotency guard, `getOrCreateCustomer`, `createSite` (status `awaiting_copy_draft` when `copy_addon`, else `pending_content`), then welcome email + Slack + operator SMS via `Promise.allSettled`. Missing email/name alerts Slack and skips site creation rather than failing silently.
- **`customer.subscription.deleted`** — status to `cancelled`, `unprovisionSite` (best-effort Cloudflare + Vercel teardown), goodbye email, Slack.
- **`charge.refunded`** — status to `refunded`, unprovision if it was `live`, Slack alert. Resolves the site via the Stripe **customer id** (most recent site row) because `charge.refunded` carries no `session_id`.

**Still deferred** (`docs/post-launch-todo.md`): `invoice.payment_failed` (dunning) and
`customer.subscription.updated` (payment-method changes, unpause). Matters past ~50 subscriptions.

## Key Files

- `src/lib/themes/` — 30 configs + `index.ts` (`all`, `featuredThemeSlugs`, `defaultThemeSlug`); `types.ts` has the `Theme` interface incl. `heroImage` + `content?: ThemeContentOverrides`
- `src/lib/stripe.ts` — pinned-version client + 3-mode checkout · `src/lib/checkout-schema.ts` — Zod schemas (form + API) incl. the `promo=launch` branch
- `src/lib/supabase.ts` — service-role helpers, server-only; the `SiteStatus` union is the site lifecycle · `src/lib/supabase-server.ts` — anon-key SSR (cookie-backed) client used by auth
- `src/lib/auth.ts` — `getCurrentUser()` / `requireAuth()`; the only sanctioned auth gate
- `src/proxy.ts` — Next 16 proxy: auth cookie refresh + `*.yourshopfront.com` rewrite to `/tenant`. Skips the Supabase block when env vars are unset (CI / clones without `.env.local`)
- `src/lib/provisioning/` — `orchestrator.ts` (provision + unprovision), `cloudflare.ts`, `vercel.ts`, `slug.ts`
- `src/lib/ai-copy/draft.ts` — Haiku copy drafting · `src/lib/site-content/schema.ts` — worksheet Zod schema · `src/lib/chat/` — `system-prompt.ts` + in-memory `rate-limit.ts` (also used by `/api/access`, `/api/contact`)
- `src/lib/edit-requests.ts` · `src/lib/email.ts` · `src/lib/sms-quo.ts` · `src/lib/notify.ts` (Slack)
- `src/app/api/checkout/route.ts` — Stripe session creation (Hook 1 lands here) · `src/app/api/stripe/webhook/route.ts` — signature-verified, idempotent, 3 events
- `src/app/api/cron/provision/route.ts` — CRON_SECRET-gated tick, `timingSafeEqual` bearer check · `src/app/api/og/[slug]/route.tsx` — per-theme OG PNG (also portfolio card previews)
- `src/app/app/` — authed customer portal (dashboard, billing, edit requests + Server Actions) · `src/app/dev/themes/page.tsx` — dev-only audit of all 30 themes
- `src/components/home/themed-home.tsx` — composition for `/demos/[slug]` + `/portfolio/[slug]` · `src/components/apex/` — chrome primitives (full tree in `README.md`)
- `supabase/migrations/0001_initial.sql` through `0013_referral_tracking.sql` — all 13 required
- `next.config.ts` — CSP + security headers (`frame-ancestors 'self'` for same-origin preview iframes)
- `scripts/create-stripe-products.ts` · `scripts/fetch-hero-images.mjs` · `scripts/fetch-cta-images.mjs`
