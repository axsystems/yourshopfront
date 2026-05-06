# Apex Sites

Productized website design + hosting for home-service businesses. Pick one of 30 themes, send us your content, your site goes live in 24 hours.

**Two tiers**, both available against any of the 30 designs:

- **Subscription** — $499 setup + $199/mo. Hosted, unlimited edits, Google Business profile management. Cancel anytime.
- **One-time** — $2,997 once. Full source code delivered. Optional $29/mo hosting & maintenance.

---

## Status

The redesign loop (Phases 1–7) ships in commits prefixed `feat(redesign):`. Highest-level summary in `REDESIGN-REPORT.md`. The audit trail is `REDESIGN-LOG.md`. The launch checklist is `LAUNCH-CHECKLIST.md`. The pre-redesign baseline read is `APEX-AUDIT.md`.

| Surface | Where it lives | Notes |
|---|---|---|
| Apex marketing chrome | `src/components/apex/` | 19 primitives + `home/`, `portfolio/` sections, `motion/` wrappers, `marks/` signature SVG, `legal-page.tsx`. Apex tokens namespaced as `--apx-*`. |
| `/` (home) | `src/app/page.tsx` | Apex-branded — no longer renders Heritage Painters as the default theme. Hero with rotating preview, truthful stat strip, gallery, pricing teaser, FAQ, CTA. |
| `/pricing` | `src/app/pricing/page.tsx` | Two-tier cards (cobalt-outlined "Recommended"), comparison table (desktop), FAQ, primary-soft final CTA. |
| `/portfolio` | `src/app/portfolio/page.tsx` | All 30 designs in `<DemoCard>` grid. First 6 above-fold mount eagerly; remaining 24 lazy via IntersectionObserver. |
| `/portfolio/[slug]` | `src/app/portfolio/[slug]/page.tsx` | Sticky `<PortfolioBanner>` (chrome-styled, prev/next nav) + themed `<ThemedHome isDemoPreview>` body + `<AboutThisDesign>` block. |
| `/demos/[slug]` | `src/app/demos/[slug]/page.tsx` | Themed `<ThemedHome>` for all 30 themes. Sticky `<DemoSwitcher>` for hopping between featured 10. |
| `/contact` | `src/app/contact/page.tsx` | Two-column. Form rebuilt on chrome `<TextField>` and `<Button>`. `?ref=`/`?piece=` prefill behavior preserved. |
| `/checkout` | `src/app/checkout/page.tsx` | Themed (so the buyer sees the design they're buying). Minimal Apex header. RHF + Zod form. Stripe Checkout in 3 modes. |
| `/onboarding` | `src/app/onboarding/page.tsx` | Themed. 3-step checklist. ContentStep + AssetsStep are derived from `site_content` (no manual toggles); DomainStep saves explicit choice. Bearer-token via Stripe `session_id`. |
| `/onboarding/worksheet` | `src/app/onboarding/worksheet/page.tsx` | 7-section content worksheet. 5 required (hero, contact, services, about, service area), 2 optional (reviews, hero photo). Each section saves independently; `siteContentIsValid` + `assetsAreSufficient` reconciliation flips status to `ready_to_build` when all three checklist steps pass. |
| `/tenant` | `src/app/tenant/page.tsx` | Customer-facing render at `*.apexsites.com`. Switches on `provision_slug`. Renders `<CustomerHome>` (theme tokens drive style; `site_content` drives copy) when content is valid + status ∈ {awaiting_approval, live}. Branded interstitials for the other states. |
| `/api/upload/sign` | `src/app/api/upload/sign/route.ts` | Mints one-shot signed Storage upload URLs. Browser POSTs `{sessionId, kind, filename, contentType}`; server validates + returns `{signedUrl, publicUrl, path}`. Used by `<AssetUploader>`. |
| `/about` | `src/app/about/page.tsx` | Manifesto + "Three things we won't do" + contact CTA. |
| `/privacy`, `/terms`, `/refund-policy` | `src/app/{privacy,terms,refund-policy}/page.tsx` | Drafted via `<LegalPage draft>`. Plain-English boilerplate gated behind a coral "Drafting in progress" banner until real legal copy lands. |
| Sitemap | `src/app/sitemap.ts` | 38 canonical URLs (1 home + 10 featured demos + portfolio index + 20 portfolio details + 6 static). |
| Smoke tests | `tests/e2e/smoke.spec.ts` | 5 Playwright tests against marketing surfaces. Worksheet/upload flows aren't smoke-covered — manual gate per `LAUNCH-CHECKLIST.md`. |

**68 routes** building (was 66 — added `/onboarding/worksheet` + `/api/upload/sign`). Lint + typecheck + build + smoke all clean.

---

## Architecture (post-redesign)

### Token namespaces — two co-existing systems

- **Apex chrome (`--apx-*`)** — defined in `src/app/globals.css :root`. Stable across every chrome page. Owned by `/`, `/pricing`, `/portfolio`, `/contact`, `/about`, legal pages, and the unified header/footer.
- **Per-theme (`--apex-*`)** — set by `<ThemeProvider>` on a wrapper `<div>` when rendering one of the 24 themed surfaces (`/demos/[slug]`, `/portfolio/[slug]` body). Defined per-theme in `src/lib/themes/<theme>.ts` via `themeToCssVars()`.

The shadcn token names (`--background`, `--foreground`, `--primary`, etc.) are remapped to Apex equivalents in `:root` (e.g. `--primary: #2438FF` is cobalt) so surviving shadcn primitives (Accordion, Form, Input, Label) render in Apex colors automatically.

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
├── home/                       /-page sections
├── portfolio/                  /portfolio-page sections
├── motion/fade-up.tsx          fade-up-on-scroll-into-view
└── marks/                      signature SVG components
    ├── highlight-stroke.tsx    sunshine underline (signature 1)
    └── hero-frame.tsx          cobalt double-frame (signature 2)
```

### Brand assets (`public/`)

```
public/
├── logo.png                    1024×1024 (used in JSON-LD)
├── favicon-16.png, favicon-32.png
├── apple-touch-icon.png        180×180
├── icon-192.png, icon-512.png  manifest icons
├── og-default.png              1200×630 OG fallback
├── manifest.json               PWA manifest
├── brand/
│   ├── apex-mark.svg           24×24 grid, ink + cobalt counter
│   ├── apex-mark-mono.svg      single-color ink variant
│   ├── apex-wordmark.svg       mark + "Apex Sites" text
│   ├── apex-logo-square.svg    1024×1024 logo source
│   └── og-default.svg          1200×630 OG composition source
└── portfolio-demos/            24 standalone HTML files (the demo bodies)
```

PNG variants are exported from the SVG masters via `pnpm brand:export` (uses `sharp`). Reproducible: edit a master SVG, re-run, all PNGs regenerate at the spec sizes.

### Stack

- **Next.js 16.2.4** (App Router) · React 19.2.4 · TypeScript strict · Tailwind v4 · shadcn primitives (Accordion + Input + Label + Form only)
- **Framer Motion** for `<FadeUp>`, `<RotatingPreview>` crossfade, `<DemoCard>` hover-lift. Respects `prefers-reduced-motion` everywhere.
- **Stripe v22** (API pinned `2024-11-20.acacia`) · Supabase (service-role, RLS locked) · Resend · Slack webhooks
- **Plausible** analytics (env-gated; cookie-free)
- **Playwright** (`@playwright/test`) for the 5-test smoke suite. CI runs them on every PR.
- **Vercel** (web) — deploy via `master` branch.

### Payment flow

```
visitor → /portfolio (or rotating-preview hero)
  → /demos/[slug]  →  picks tier  →  /checkout?tier=&demo=
   form submit  →  POST /api/checkout
                                              ↓
                                  Stripe Checkout session
                                              ↓
                          {success → /onboarding?session_id=...
                           cancel  → /checkout?...&cancelled=1}

Stripe → POST /api/stripe/webhook (signature verified, idempotent)
   checkout.session.completed
     ├─ idempotency: getSiteByStripeSessionId; bail if row exists
     ├─ getOrCreateCustomer (upsert by stripe_customer_id)
     ├─ createSite(status='pending_content')
     ├─ sendWelcomeEmail (Resend, best-effort)
     └─ notifySlack (best-effort)
   customer.subscription.deleted
     ├─ updateSiteStatus(siteId, 'cancelled')
     ├─ sendGoodbyeEmail
     └─ notifySlack
```

Three Stripe Checkout modes in `/api/checkout`:

- **subscription tier** — `mode='subscription'` with both `monthly` and `setup` in `line_items`
- **onetime + hosting addon** — `mode='subscription'` with `hosting` and `onetime` in `line_items`
- **onetime no addon** — `mode='payment'`, single line item, `customer_creation: 'always'`

`metadata.site_id` is propagated through both `session.metadata` and `subscription_data.metadata` so the cancellation webhook can correlate back.

---

## Local development

```bash
pnpm install
cp .env.example .env.local
# fill in real values for local work — see "Setup" below

pnpm dev          # http://localhost:3000
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint src/
pnpm build        # next build (verifies all 66 routes)
pnpm test:e2e     # Playwright smoke (auto-builds first)
pnpm brand:export # regenerate PNG brand assets from SVG masters
```

### Useful URLs in dev

- `http://localhost:3000/` — new Apex marketing home
- `http://localhost:3000/portfolio` — gallery of all 24
- `http://localhost:3000/demos/heritage-painters` — themed demo
- `http://localhost:3000/dev/themes` — visual audit grid (gated to non-prod)
- `http://localhost:3000/api/og/voltcraft-electric` — generated OG image

---

## Setup (one-time, requires real credentials)

### 1. Supabase tables + Storage

In Supabase SQL Editor, paste and run each migration in order: `0001_initial.sql`, `0002_onboarding.sql`, `0003_provisioning.sql`, `0004_site_content.sql`, `0005_storage_bucket.sql`. Creates `customers` + `sites` tables (with `site_content` JSONB), enables RLS, sets up the `updated_at` trigger, and provisions the public-read `site-assets` Storage bucket for customer logos/photos.

After running, set in `.env.local`:

```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 2. Stripe products + prices

Set `STRIPE_SECRET_KEY=sk_test_...` in `.env.local` (real test-mode key, not the placeholder), then:

```bash
pnpm stripe:setup
```

Idempotent — safe to re-run. Prints 4 `STRIPE_PRICE_*=price_...` lines to stdout. Paste into `.env.local`.

### 3. Stripe webhook listener (for local dev)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed webhook signing secret into `.env.local` as `STRIPE_WEBHOOK_SECRET=whsec_...`.

### 4. Resend (optional in dev)

If `RESEND_API_KEY` and `CONTACT_INBOX_EMAIL` are unset, `/api/contact` and webhook welcome emails just `console.log` and return success. To exercise real delivery:

```
RESEND_API_KEY=re_<real>
CONTACT_INBOX_EMAIL=you@your-domain.com
RESEND_FROM_EMAIL=Apex Sites <onboarding@resend.dev>   # works without verified domain
```

### 5. Slack (optional)

If `SLACK_WEBHOOK_URL` is set, contact form submissions and new sales ping the channel. Silent skip if unset.

### 6. Plausible analytics (optional)

If `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set, the analytics script loads. Empty/unset = no-op. Defaults to `plausible.io`; override `NEXT_PUBLIC_PLAUSIBLE_HOST` for self-hosted.

---

## Production deployment

See `LAUNCH-CHECKLIST.md` and `.env.production.example`. The tl;dr:

1. Connect Vercel to `master` branch.
2. Set every env var from `.env.production.example` (with real live-mode values) under Vercel → Production scope.
3. Run `pnpm stripe:setup` against your **live** Stripe key, paste the 4 emitted price IDs into Vercel.
4. Add a Stripe webhook endpoint at `https://apexsites.com/api/stripe/webhook` listening for `checkout.session.completed` + `customer.subscription.deleted`.
5. Verify Resend domain (SPF + DKIM in Cloudflare).
6. Run the manual Stripe test plan in `docs/phase-4-test-plan.md` against a staging deploy.
7. Walk the LAUNCH-CHECKLIST end-to-end.

---

## License + contact

Private project. Contact: `hello@apexsites.com`.
