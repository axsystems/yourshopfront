# Your Shopfront

Productized website design + hosting for small businesses. Pick one of 30 themes, send us your content, your site goes live in 24 hours.

**Two tiers**, both available against any of the 30 designs:

- **Subscription** — standard $299 setup + $149/mo. **Launch promo (current):** $99 setup + $99/mo for the first 3 months, then $149/mo standard. Hosted, unlimited edits, Google Business profile management. Cancel anytime.
- **One-time** — $997 once. Full source code delivered. Optional $49/mo hosting & maintenance (unlimited small edits + monthly SEO check).

**Add-on:** $199 AI copywriting service (`/api/checkout/copy-upgrade`), buyable at checkout or after the fact.

---

## Status

**The site is live at https://yourshopfront.com and takes live-mode Stripe payments.**

`PROJECT-STATE.md` is the canonical current-status doc — what's live, what's blocked, what's next. This README is the architecture reference; it deliberately does not restate status. `CLAUDE.md` is the agent-facing cold-start hub and hard rules. `LAUNCH-CHECKLIST.md` is the go-live gate. `docs/history/` holds the archived record of the Phase 1–7 redesign (`docs/history/REDESIGN-REPORT.md`, `docs/history/REDESIGN-LOG.md`, `docs/history/APEX-AUDIT.md`, and the 2026-05-21 launch audits) — historical, not current state.

### Surface map

| Surface | Where it lives | Notes |
|---|---|---|
| Marketing chrome | `src/components/apex/` | 19 top-level primitives + `home/`, `portfolio/` sections, `motion/` wrappers, `marks/` signature SVGs, `legal-page.tsx`, `sales-agent.tsx`. Chrome tokens namespaced `--apx-*`. |
| `/` (home) | `src/app/page.tsx` | Your Shopfront–branded. Hero with rotating preview, stat strip, theme gallery, pricing teaser, FAQ, CTA. |
| `/start` | `src/app/start/page.tsx` | Launch-promo landing page — the page outreach links to. $99 pricing, FAQ, multiple CTAs. |
| `/pricing` | `src/app/pricing/page.tsx` | Two-tier cards, comparison table (desktop), FAQ, final CTA. |
| `/portfolio` | `src/app/portfolio/page.tsx` | All 30 designs in `<PortfolioGrid>`. Cards render theme-distinct OG previews (`/api/og/<slug>`), each with a "$99 launch" badge. |
| `/portfolio/[slug]` | `src/app/portfolio/[slug]/page.tsx` | Sticky `<PortfolioBanner>` (prev/next) + `<ThemedHome>` body (no `isDemoPreview` — keeps `<Pricing>`, `<Showcase>`, `<FAQ>`) + `<AboutThisDesign>`. |
| `/demos/[slug]` | `src/app/demos/[slug]/page.tsx` | `<ThemedHome isDemoPreview>` — hides Pricing/Showcase/FAQ, adds `<DemoBuyGuarantees>` + fixed-bottom `<MobileStickyCta>`. Sticky `<DemoSwitcher>` for hopping between the featured 10. **There is no `/demos` index — that URL 404s.** |
| `/contact` | `src/app/contact/page.tsx` | Two-column. `?ref=` / `?piece=` prefill preserved. |
| `/checkout` | `src/app/checkout/page.tsx` | Themed (buyer sees the design they're buying). RHF + Zod form. Stripe Checkout in 3 modes. |
| `/onboarding` | `src/app/onboarding/page.tsx` | Themed 3-step checklist. Content + Assets steps derive from `site_content`; Domain step saves an explicit choice. Bearer-token via Stripe `session_id`. |
| `/onboarding/worksheet` | `src/app/onboarding/worksheet/` | 7-section content worksheet (`sections/`). 5 required (hero, contact, services, about, service area), 2 optional (reviews, media). Sections save independently; `siteContentIsValid` + `assetsAreSufficient` flip status to `ready_to_build`. |
| `/onboarding/discovery` | `src/app/onboarding/discovery/` | Copy-service intake. 5 questions, then Haiku drafts hero/services/about. Only reachable pre-draft (`pending_content`, `awaiting_copy`, `awaiting_copy_draft`). |
| `/onboarding/copy-review` | `src/app/onboarding/copy-review/` | Customer approval of the operator-approved draft. Double-gated: status must be `awaiting_copy_approval` AND `ai_copy_draft.operatorApprovedAt` must be set. The draft is never customer-visible before the operator signs off. |
| `/login`, `/login/check-email` | `src/app/login/` | Supabase magic-link sign-in (`signInWithOtp`) for the customer portal. |
| `/access` | `src/app/access/page.tsx` | Lost-welcome-email recovery. Rate-limited and enumeration-safe — always returns the same response. |
| `/app`, `/app/billing`, `/app/edit-requests*` | `src/app/app/` | Authed customer portal: site status, Stripe billing portal deep links, edit-request threads (Server Actions in `edit-requests/actions.ts`). Every page and action calls `requireAuth()`. |
| `/admin/copy-review/[siteId]` | `src/app/admin/copy-review/` | Operator review of an AI draft before the customer sees it. Gated on `ADMIN_PASSWORD` (header or `?token=`), `noindex`. |
| `/tenant` | `src/app/tenant/page.tsx` | Customer-facing render at `*.yourshopfront.com` (the proxy rewrites here). Renders `<CustomerHome>` when content is valid and status ∈ {`awaiting_approval`, `live`}; branded interstitials otherwise. |
| `/about`, `/privacy`, `/terms`, `/refund-policy` | `src/app/{about,privacy,terms,refund-policy}/page.tsx` | Manifesto + legal. All three legal pages render through `<LegalPage>` with real copy (lastUpdated 2026-05-04 / 2026-05-21). The `draft` banner prop still exists on the component but no page passes it any more. |
| Sitemap | `src/app/sitemap.ts` | 38 canonical URLs (1 home + 10 featured demos + portfolio index + 20 portfolio details + 6 static). |
| Smoke tests | `tests/e2e/smoke.spec.ts` | 5 Playwright tests against marketing surfaces. Worksheet / upload / portal flows are **not** smoke-covered — manual gate per `LAUNCH-CHECKLIST.md`. |

**Source route count: 27 page routes + 17 route handlers** (15 under `/api`, plus `/auth/callback` and `/auth/signout`). The build emits considerably more than that because `/demos/[slug]`, `/portfolio/[slug]`, and `/api/og/[slug]` each expand across all 30 themes — run `pnpm build` if you need the exact figure. CI runs lint, typecheck, build, and the 5 smoke tests on every PR (Node 20).

---

## Architecture

### Token namespaces — two co-existing systems

- **Chrome (`--apx-*`)** — defined in `src/app/globals.css :root`. Stable across every chrome page. Owned by `/`, `/start`, `/pricing`, `/portfolio`, `/contact`, `/about`, legal pages, the portal, and the unified header/footer.
- **Per-theme (`--apex-*`)** — set by `<ThemeProvider>` on a wrapper `<div>` when rendering one of the 30 themed surfaces (`/demos/[slug]`, the `/portfolio/[slug]` body, `/checkout`, `/onboarding*`, `/tenant`). Defined per-theme in `src/lib/themes/<theme>.ts` via `themeToCssVars()`.

The shadcn token names (`--background`, `--foreground`, `--primary`, etc.) are remapped to the chrome equivalents in `:root` (e.g. `--primary: #2438FF` is cobalt) so surviving shadcn primitives render in brand colors automatically.

### Chrome primitives (`src/components/apex/`)

```
apex/
├── index.ts                    barrel export
├── button.tsx                  primary / secondary / ghost
├── card.tsx                    border-only or elevated
├── container.tsx               1200px max, responsive padding
├── display.tsx                 H1/H2/H3 with type-scale variant
├── eyebrow.tsx                 mono uppercase label
├── lede.tsx                    large opening paragraph
├── logo.tsx                    SVG mark + wordmark
├── nav-link.tsx                cobalt-underline active state
├── price-tag.tsx               mono $ + coral underline (signature 3)
├── section.tsx                 paper / canvas / tint / primary-soft band
├── site-footer.tsx             default / themed / minimal
├── site-header.tsx             default / themed / minimal
├── stat.tsx                    mono value + ink label
├── text-field.tsx              label + input/textarea + a11y wiring
├── demo-card.tsx               live-iframe mini-render with lazy-mount
├── legal-page.tsx              shell for /privacy /terms /refund-policy
├── mobile-sticky-cta.tsx       chrome-side fixed-bottom CTA
├── open-chat-button.tsx        opens the sales agent
├── sales-agent.tsx             Claude-backed sales chat bubble (/api/chat)
├── home/                       /-page sections (hero, stat-strip, theme-gallery,
│                               how-it-works, pricing-teaser, faq, final-cta,
│                               rotating-preview, partner-axon-growth)
├── portfolio/                  /portfolio-page sections (hero, grid, final-cta)
├── motion/fade-up.tsx          fade-up-on-scroll-into-view
└── marks/                      signature SVG components
    ├── highlight-stroke.tsx    sunshine underline (signature 1)
    └── hero-frame.tsx          cobalt double-frame (signature 2)
```

Only four shadcn primitives survive, in `src/components/ui/`: `accordion`, `form`, `input`, `label`.

### Brand assets (`public/`)

```
public/
├── logo.png                    1024×1024 (used in JSON-LD)
├── favicon-16.png, favicon-32.png
├── apple-touch-icon.png        180×180
├── icon-192.png, icon-512.png  manifest icons
├── og-default.png              1200×630 OG fallback
├── manifest.json               PWA manifest
├── brand/                      SVG masters (mark, mono mark, wordmark,
│                               logo-square, og-default composition)
├── portfolio-demos/            24 standalone HTML files — LEGACY. No longer
│                               rendered by <PortfolioCard> (switched to OG
│                               image previews). Does not cover all 30 themes.
└── themes/                     30 subfolders (one per slug), each with
                                hero.jpg + cta-bg.jpg, both served same-origin.
```

PNG variants are exported from the SVG masters via `pnpm brand:export` (uses `sharp`). Reproducible: edit a master SVG, re-run, all PNGs regenerate at spec sizes.

### Stack

- **Next.js 16.2.4** (App Router) · React 19.2.4 · TypeScript strict · Tailwind v4 · 4 shadcn primitives
- **Framer Motion** for `<FadeUp>`, `<RotatingPreview>` crossfade, `<DemoCard>` hover-lift. Respects `prefers-reduced-motion` everywhere.
- **Stripe v22** (API pinned `2024-11-20.acacia`) · **Supabase** — Postgres + RLS for data, and Supabase Auth (magic link) for the customer portal
- **Anthropic** (`@anthropic-ai/sdk`) — `claude-haiku-4-5-20251001` powers both the sales chat (`/api/chat`) and copy drafting (`src/lib/ai-copy/draft.ts`)
- **Resend** (transactional email) · **Slack** webhooks + **Quo** SMS for operator alerts
- **Cloudflare** (DNS) + **Vercel** (domain attach) for automated provisioning — `src/lib/provisioning/`
- Analytics: **Plausible** (cookie-free), **GA4 / Google Ads** (`src/lib/analytics-config.ts`), **Vercel Analytics**. All env-gated; unset means no-op.
- **Playwright** for the 5-test smoke suite. CI runs it on every PR.
- **Vercel** hosting, deployed from `master`. `vercel.json` schedules `/api/cron/provision` every minute.

### Security posture

- `next.config.ts` sets CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, and `Permissions-Policy` on every response. `frame-ancestors 'self'` / SAMEORIGIN are deliberate — the homepage rotating preview iframes `/demos/<slug>?embed=1` same-origin.
- Route handlers that accept a JSON body parse it with Zod before use (`/api/checkout` via `CheckoutRequestSchema`; the rest with inline schemas). The Stripe webhook instead verifies the signature against the raw body and trusts Stripe typing. Known gap: `/api/onboarding/status` reads its `site_id` query param with no schema.
- Auth uses `supabase.auth.getUser()` (server-verified), never `getSession()`. `src/lib/auth.ts` is the only sanctioned gate; the proxy's `getUser()` call refreshes cookies and its result is discarded.
- Secret comparisons (`CRON_SECRET`, `ADMIN_PASSWORD`) use `timingSafeEqual`.
- `/auth/callback` validates `?next=` against an allowlist and rejects protocol-relative and backslash paths (open-redirect hardening). `/auth/signout` requires a same-origin `Origin` header in production.
- `/api/access` is enumeration-safe (constant response) and rate-limited, as are `/api/contact` and `/api/chat` (`src/lib/chat/rate-limit.ts`, in-memory).

### Payment flow

```
visitor → /start or /portfolio (or the rotating-preview hero)
  → /demos/[slug]  →  picks tier  →  /checkout?tier=&demo=
   form submit  →  POST /api/checkout
                                              ↓
                                  Stripe Checkout session
                                              ↓
                          {success → /onboarding?session_id=...
                           cancel  → /checkout?...&cancelled=1}

Stripe → POST /api/stripe/webhook (signature verified, idempotent)
   checkout.session.completed
     ├─ metadata.upgrade === 'copy_addon' → apply the $199 add-on, done
     ├─ idempotency: getSiteByStripeSessionId; bail if row exists
     ├─ missing email/name → Slack alert + bail (never silent)
     ├─ getOrCreateCustomer (upsert by stripe_customer_id)
     ├─ createSite(status = copy_addon ? 'awaiting_copy_draft'
     │                                 : 'pending_content')
     └─ Promise.allSettled: welcome email · Slack · operator SMS
   customer.subscription.deleted
     ├─ updateSiteStatus(siteId, 'cancelled')
     ├─ unprovisionSite (Cloudflare + Vercel teardown, best-effort)
     ├─ sendGoodbyeEmail
     └─ notifySlack
   charge.refunded
     ├─ resolve site via Stripe customer id (no session_id on this event)
     ├─ updateSiteStatus(site.id, 'refunded')   [idempotent]
     ├─ unprovisionSite if the site was 'live'
     └─ notifySlack
```

Three Stripe Checkout modes in `/api/checkout`:

- **subscription tier** — `mode='subscription'` with both `monthly` and `setup` in `line_items`. `promo=launch` swaps the setup price to the promo SKU and applies the launch coupon.
- **onetime + hosting addon** — `mode='subscription'` with `hosting` and `onetime` in `line_items`
- **onetime no addon** — `mode='payment'`, single line item, `customer_creation: 'always'`

`metadata.site_id` is propagated through both `session.metadata` and `subscription_data.metadata` so the cancellation webhook can correlate back.

**Still deferred** (`docs/post-launch-todo.md`): `invoice.payment_failed` and `customer.subscription.updated`.

### Post-purchase pipeline

`SiteStatus` (`src/lib/supabase.ts`) is the state machine:

```
pending_content ──worksheet complete──────────────► ready_to_build
      │
      └─(copy add-on)─► awaiting_copy_draft ──/onboarding/discovery + Haiku──►
        awaiting_copy_review ──operator approves in /admin/copy-review──►
        awaiting_copy_approval ──customer approves──► ready_to_build

ready_to_build ──cron tick──► provisioning ──► awaiting_approval
              ──/api/provisioning/approve (ADMIN_PASSWORD)──► live

any state ──► cancelled | refunded | failed
```

`/api/cron/provision` runs every minute (`vercel.json`), authenticated with `CRON_SECRET`, and picks up `ready_to_build` plus interrupted `provisioning` rows — capped at 5 per tick to stay under Vercel's 60s function timeout. `src/lib/provisioning/orchestrator.ts` is idempotent, with per-step state persisted in `sites.provisioning_state`.

---

## Local development

```bash
pnpm install
cp .env.example .env.local
# fill in real values for local work — see "Setup" below

pnpm dev          # http://localhost:3000
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint src/
pnpm build        # next build
pnpm test:e2e     # Playwright smoke (auto-builds first)
pnpm brand:export # regenerate PNG brand assets from SVG masters
```

pnpm is pinned by `package.json`'s `packageManager` field (`pnpm@10.28.0`). Don't add a `version:` to `pnpm/action-setup` in CI — two sources of truth makes the action hard-error.

### Useful URLs in dev

- `http://localhost:3000/` — marketing home
- `http://localhost:3000/start` — launch-promo landing page
- `http://localhost:3000/portfolio` — gallery of all 30
- `http://localhost:3000/demos/heritage-painters` — themed demo
- `http://localhost:3000/dev/themes` — visual audit grid (gated to non-prod)
- `http://localhost:3000/api/og/voltcraft-electric` — generated OG image

---

## Setup (one-time, requires real credentials)

### 1. Supabase schema + Storage

In the Supabase SQL Editor, run **every** migration in `supabase/migrations/` in order — there are **12**, `0001_initial.sql` through `0012_edit_request_append_comment.sql`. Running only the first few leaves a broken schema: `0007_copy_addon`, `0008_ai_copy_state`, `0009_auth_customer_link`, `0010_edit_requests`, and `0012_edit_request_append_comment` are all load-bearing for the copy service, the customer portal, and edit requests.

Together they create `customers` + `sites` (with `site_content` and `provisioning_state` JSONB), the `edit_requests` table, RLS, the `updated_at` trigger, the `get_customer_by_email` SECURITY DEFINER RPC used by `requireAuth()`, and the public-read `site-assets` Storage bucket for customer logos/photos.

Then set in `.env.local`:

```
SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Both `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL` are read in code — the proxy and the SSR auth client use the public one.

### 2. Stripe products + prices

Set `STRIPE_SECRET_KEY=sk_test_...` in `.env.local` (a real test-mode key, not the placeholder), then:

```bash
pnpm stripe:setup
```

Idempotent — safe to re-run. Prints `STRIPE_PRICE_*=price_...` lines to stdout; paste them into `.env.local`. The full set the app reads is `STRIPE_PRICE_ONETIME`, `STRIPE_PRICE_HOSTING_ADDON`, `STRIPE_PRICE_COPY_ADDON`, `STRIPE_PRICE_SUBSCRIPTION_MONTHLY`, `STRIPE_PRICE_SUBSCRIPTION_SETUP`, `STRIPE_PRICE_SUBSCRIPTION_SETUP_PROMO`, The script does **not** create the launch coupon — build `STRIPE_COUPON_LAUNCH_PROMO` by hand in the Stripe dashboard, or the `promo=launch` path silently falls back to full price.

### 3. Stripe webhook listener (for local dev)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed signing secret into `.env.local` as `STRIPE_WEBHOOK_SECRET=whsec_...`.

### 4. Optional integrations

All of these degrade to a no-op or a `console.log` when their env vars are unset, so local dev works without any of them:

| Feature | Env vars |
|---|---|
| Transactional email | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_INBOX_EMAIL` |
| Slack alerts | `SLACK_WEBHOOK_URL` |
| Operator SMS | `QUO_API_KEY`, `QUO_FROM_NUMBER`, `QUO_OPERATOR_PHONE` |
| Sales chat + AI copy | `ANTHROPIC_API_KEY` |
| Provisioning | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`, `VERCEL_API_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID`, `APEX_DOMAIN` |
| Cron + admin | `CRON_SECRET`, `ADMIN_PASSWORD` |
| Analytics | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `NEXT_PUBLIC_PLAUSIBLE_HOST`, `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` |
| Canonical URLs | `NEXT_PUBLIC_SITE_URL` |

Note that `RESEND_FROM_EMAIL=Your Shopfront <onboarding@resend.dev>` works without a verified domain, which is handy for local testing.

---

## Production deployment

The production site is already deployed. See `LAUNCH-CHECKLIST.md` and `.env.production.example` for the full gate. The tl;dr for standing up a fresh environment:

1. Connect Vercel to the `master` branch.
2. Set every env var from `.env.production.example` (real live-mode values) under Vercel → Production scope. Adding or changing an env var does **not** affect a running deployment — redeploy to pick it up.
3. Run `pnpm stripe:setup` against your **live** Stripe key and paste the emitted price IDs into Vercel.
4. Add a Stripe webhook endpoint at `https://yourshopfront.com/api/stripe/webhook` subscribed to **`checkout.session.completed`, `customer.subscription.deleted`, and `charge.refunded`** — all three are handled in code.
5. Verify the Resend sending domain (SPF + DKIM in Cloudflare).
6. Confirm `CRON_SECRET` is set, or `/api/cron/provision` refuses to run and nothing ever provisions.
7. Run the manual Stripe test plan in `docs/phase-4-test-plan.md`.
8. Walk `LAUNCH-CHECKLIST.md` end to end.

---

## License + contact

Private project. Contact: `hello@yourshopfront.com`.
