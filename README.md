# Apex Sites

Productized website design + hosting for home-service businesses. Pick one of 24 themes, send us your content, your site goes live in 24 hours.

**Two tiers**, both available against any of the 24 designs:

- **Subscription** — $499 setup + $199/mo. Hosted, unlimited edits, Google Business profile management. Cancel anytime.
- **One-time** — $2,997 once. Full source code delivered. Optional $29/mo hosting & maintenance.

---

## Status

Phases shipped (commit history is the source of truth — see `git log --oneline`):

| Phase | Subject | Status |
|---|---|---|
| 0 | Repo + infrastructure bootstrap | ✅ shipped |
| 1 | Theme system (24 configs, types, provider) | ✅ shipped |
| 1.5 | `/portfolio` index + 24 detail routes + `/contact` form | ✅ shipped |
| 2 | Themed homepage components (Hero × 5 variants, TrustStrip, HowItWorks, Pricing, Showcase, FAQ, FinalCTA, Footer, DemoSwitcher) | ✅ shipped |
| 2.5 | All 24 unified as theme options; custom-build tier removed | ✅ shipped |
| 3 | SEO finishing (robots, sitemap, JSON-LD, OG images, distinct H1s, 24 portfolio paragraphs) | ✅ shipped |
| 3.5 | Themed footer + Resend wiring on `/api/contact` | ✅ shipped |
| 4a | Stripe products setup script | ✅ shipped |
| 4b | Supabase schema (`customers`, `sites`) + typed client | ✅ shipped |
| 4c | `/checkout` page UI (themed, RHF + Zod) | ✅ shipped |
| 4d | `/api/checkout` + `/api/stripe/webhook` (signature verify, idempotency, 3-mode session creation) | ✅ shipped |
| 4e | `/onboarding` page + content checklist | ⏳ pending |
| 4f | End-to-end Stripe test plan (`docs/phase-4-test-plan.md`) | ⏳ pending |
| 5+ | Provisioning pipeline, admin dashboard, customer portal, static pages, polish, launch | ⏳ pending |

**61 routes building.** Lint + typecheck + build all clean.

---

## Architecture

### Routes

```
/                       homepage (default theme = heritage-painters)
/demos/[slug]           24 SSG'd pages — featured 10 self-canonical, other 14 canonical to /portfolio
/portfolio              filterable grid of all 24 designs
/portfolio/[slug]       24 SSG'd pages — featured 10 canonical to /demos, other 14 self-canonical
/pricing                two-tier pricing
/contact                form (Resend + Slack notify, Zod validated, ?ref= prefill support)
/checkout               themed checkout page (server component + RHF/Zod client form)
/onboarding             post-purchase content checklist (Phase 4e — pending)
/dev/themes             dev-only audit page (gated by NODE_ENV)

/api/og/[slug]          dynamic OG image (Edge runtime, theme display font from Fontsource CDN)
/api/contact            Zod-validated, Resend email + Slack ping (best-effort)
/api/checkout           creates Stripe Checkout session (3 modes — see `lib/stripe.ts` comments)
/api/stripe/webhook     signature-verified, idempotent (sites.stripe_session_id unique guard)

/sitemap.xml            28 canonical URLs (10 demos + 14 portfolio + 4 pages)
/robots.txt             allow all, disallow /api/ + /dev/, sitemap link
```

### Theme system

24 themes in `src/lib/themes/`, each with full design tokens (colors, fonts, radii, hero pattern, vibe). All 24 are buyable; the 10 featured slugs in `featuredThemeSlugs` (8 round-3 home-service brands + premium-trade + doorstep-editorial) live in the homepage Showcase grid + DemoSwitcher; the other 14 live one click deeper at `/portfolio`.

Each page that renders a theme wraps in `<ThemeProvider theme={...}>`. The provider sets CSS variables (`--apex-bg`, `--apex-primary`, `--apex-font-display`, etc.) on a wrapper div, **and applies only that theme's display + body + mono font className** — so a page using Heritage Painters loads Fraunces + Inter, not all 9 supported fonts.

### Payment flow

```
visitor → /demos/[slug]  →  picks tier  →  /checkout?tier=&demo=
   form submit  →  POST /api/checkout
                                              ↓
                                  Stripe Checkout session
                                              ↓
                          {success → /onboarding?session_id=...
                           cancel  → /checkout?...&cancelled=1}

Stripe → POST /api/stripe/webhook (signature verified)
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

- **subscription tier** — `mode='subscription'` with both `monthly` and `setup` in `line_items` (Stripe Checkout natively handles mixed recurring + one-time)
- **onetime + hosting addon** — `mode='subscription'` with `hosting` and `onetime` in `line_items` (same pattern)
- **onetime no addon** — `mode='payment'`, single line item, `customer_creation: 'always'`

Stripe API version pinned to `2024-11-20.acacia` in `src/lib/stripe.ts`. Webhook payload shapes can shift between API versions; pinning keeps production stable until we explicitly upgrade.

### Stack

- **Next.js 16.2** (App Router) · React 19 · TypeScript strict · Tailwind v4 · shadcn/ui
- **Stripe v22** SDK · `@vercel/og` for OG images
- **Supabase** for `customers` + `sites` (service-role key, server-only; RLS enabled with no policies = locked-by-default)
- **Resend** for transactional email · Slack webhooks for real-time notifications
- **Vercel** (web) — deployment paused until end of Phase 4

---

## Local development

```bash
pnpm install
cp .env.example .env.local
# fill in real values for local work — see "Manual setup" below

pnpm dev          # http://localhost:3000
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint src/
pnpm build        # next build (verifies all 61 routes)
```

### Useful URLs in dev

- `http://localhost:3000/dev/themes` — visual audit of all 24 themes (gated to non-prod)
- `http://localhost:3000/checkout?tier=subscription&demo=heritage-painters` — checkout in Heritage style
- `http://localhost:3000/api/og/voltcraft-electric` — generated OG image PNG

---

## Manual setup (one-time, requires real credentials)

Two of these need to happen before Phase 4 can fire end-to-end. They require credentials not in this repo — you run them yourself.

### 1. Supabase tables

In Supabase SQL Editor, paste and run `supabase/migrations/0001_initial.sql`. Creates `customers` and `sites` tables, enables RLS, sets up the `updated_at` trigger.

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

### 5. Slack webhook (optional)

If `SLACK_WEBHOOK_URL` is set, contact form submissions and new sales ping the channel. Silent skip if unset.

---

## Repo layout

```
src/
├── app/
│   ├── (themed pages)
│   │   ├── page.tsx                  homepage
│   │   ├── demos/[slug]/page.tsx     24 SSG'd themed demos
│   │   ├── portfolio/[slug]/page.tsx 24 SSG'd portfolio details
│   │   └── checkout/                 themed checkout page + client form
│   ├── (utility pages)
│   │   ├── portfolio/page.tsx        filterable grid
│   │   ├── pricing/page.tsx          2-tier pricing
│   │   └── contact/                  form + server actions
│   ├── api/
│   │   ├── og/[slug]/route.tsx       dynamic OG images
│   │   ├── contact/route.ts          Zod + Resend + Slack
│   │   ├── checkout/route.ts         Stripe session creation
│   │   └── stripe/webhook/route.ts   signature-verified webhook
│   ├── sitemap.ts · robots.ts · layout.tsx
│   └── dev/themes/page.tsx           dev audit (gated)
├── components/
│   ├── home/                         themed page components
│   ├── portfolio/                    portfolio cards + banner
│   ├── theme-provider.tsx · site-shell.tsx · json-ld.tsx
│   └── ui/                           shadcn primitives
├── lib/
│   ├── themes/                       24 theme configs + index
│   ├── checkout-schema.ts            Zod schemas (form + API)
│   ├── stripe.ts                     pinned-version Stripe client
│   ├── supabase.ts                   server-only typed helpers
│   ├── email.ts · notify.ts          Resend + Slack helpers
│   ├── seo.ts · seo-headlines.ts     metadata + descriptive H1s
│   ├── portfolio-copy.ts             24 unique 80–120 word paragraphs
│   └── fonts.ts                      next/font with per-theme subsetting
public/
└── portfolio-demos/                  24 raw demo HTMLs (iframe sources)
scripts/
├── create-stripe-products.ts         Phase 4a setup script
└── wordcount.mjs                     audit tool for portfolio paragraphs
supabase/
└── migrations/0001_initial.sql       run manually in Supabase SQL editor
```

---

## What's next

**Phase 4e** — `/onboarding` page. Server component reads `?session_id=`, fetches the matching `sites` row from Supabase, renders a 4-step content checklist (purchase confirmed → send content → send logo + photos → pick domain). Adds an `onboarding_state jsonb` column via `0002_onboarding.sql` migration. When all 4 steps complete, status flips from `pending_content` to `ready_to_build`.

**Phase 4f** — End-to-end test plan in `docs/phase-4-test-plan.md`. Manual checklist for running the Stripe CLI, exercising both tiers + addon variants with test card 4242, verifying Supabase writes, Resend delivery, Slack pings.

**Phase 5+** — Provisioning pipeline (Vercel API + Cloudflare DNS), admin dashboard, customer portal for self-service edits, static pages (`/about`, `/terms`, `/privacy`, `/refund-policy`), launch.

---

## License + contact

Private project. Contact: `hello@apexsites.com`.
