# APEX SITES — Discovery & Audit

Read-only baseline pass before redesign. No code changes were made.
Date of audit: 2026-05-04. Auditor: Claude (Opus 4.7).
Working directory: `C:/Users/admin/Documents/GitHub/apex-sites/`.
Latest commit at audit time: `3ad2571` (`docs: phase 4 test plan`).

---

## 1. Project shape

### Framework, language, libraries

- **Framework**: Next.js **16.2.4** (App Router, RSC). `next.config.ts` only sets `turbopack.root`; no other custom config (`next.config.ts:1-10`).
- **Language**: TypeScript with `"strict": true`, `target: ES2017`, `moduleResolution: "bundler"`, `paths: { "@/*": ["./src/*"] }` (`tsconfig.json`).
- **React**: 19.2.4. **React DOM**: 19.2.4.
- **Styling**: Tailwind **v4** (`tailwindcss@^4`, `@tailwindcss/postcss@^4`). No `tailwind.config.*` — config lives in `src/app/globals.css` via `@theme inline {}`. `tw-animate-css@^1.4.0` is imported but the only animation visible in app code is `animate-spin`.
- **shadcn/ui** scaffolded with `style: "base-nova"` (`components.json`). Built on Base UI (`@base-ui/react@^1.4.1`) plus `@radix-ui/react-label`, `@radix-ui/react-slot`. CVA for variants.
- **Forms**: `react-hook-form@^7.74.0` + `@hookform/resolvers@^5.2.2` + `zod@^4.3.6`.
- **Payments**: `stripe@^22.1.0` (server) + `@stripe/stripe-js@^9.3.1` (declared but never imported in `src/`). API version pinned to `2024-11-20.acacia` (`src/lib/stripe.ts:15`).
- **Database**: `@supabase/supabase-js@^2.105.1` (service-role from server only; client wrapped in `import "server-only"`).
- **Email**: `resend@^6.12.2`.
- **Icons**: `lucide-react@^1.12.0` (14 import sites).
- **Animation**: `framer-motion@^12.38.0` declared in `package.json` but **zero imports** anywhere in `src/`. Dead dependency.
- **Other deps**: `clsx`, `tailwind-merge`, `class-variance-authority`, `server-only`, `shadcn` (CLI), `@vercel/og` is **not** installed — OG images use `next/og` directly.

### Directory structure (top 3 levels)

```
apex-sites/
├── AGENTS.md           1 line: @AGENTS.md, contains the "this is not the Next.js you know" rules block
├── CLAUDE.md           1 line: @AGENTS.md (alias)
├── README.md           239 lines, comprehensive project status + flow + manual-setup guide
├── components.json     shadcn config (style: base-nova, baseColor: neutral, lucide icons)
├── eslint.config.mjs   eslint 9 flat config; extends eslint-config-next core-web-vitals + typescript
├── next.config.ts      minimal — only turbopack.root override
├── next-env.d.ts
├── package.json        deps + scripts (see below)
├── pnpm-lock.yaml
├── pnpm-workspace.yaml ignoredBuiltDependencies: [sharp, unrs-resolver]; NO `packages:` entry — not a true monorepo
├── postcss.config.mjs  one plugin: @tailwindcss/postcss
├── tsconfig.json       strict; @/* → src/*
├── tsconfig.tsbuildinfo
├── docs/
│   ├── phase-4-test-plan.md       498-line manual Stripe runbook
│   └── post-launch-todo.md         deferred webhook handlers + misc
├── public/
│   ├── file.svg, globe.svg, next.svg, vercel.svg, window.svg  (CRA scaffold leftovers, ~3KB total)
│   ├── portfolio-demos/            24 standalone HTML demos (4-44KB each, 876KB total)
│   └── (favicon.ico lives at src/app/favicon.ico, not /public)
├── scripts/
│   ├── create-stripe-products.ts   189 lines, idempotent setup script
│   └── wordcount.mjs               audit tool for portfolio-copy.ts paragraph word counts
├── src/
│   ├── app/                        13 routes — see Section 2
│   ├── components/                 28 component files — see Section 3
│   └── lib/                        themes/ (24 themes) + 13 helper modules
└── supabase/
    └── migrations/
        ├── 0001_initial.sql        customers + sites tables, RLS enabled, no policies
        └── 0002_onboarding.sql     adds onboarding_state JSONB to sites
```

### Package manager + Node version

- **pnpm** (`pnpm-lock.yaml`, `pnpm-workspace.yaml`). The `pnpm-workspace.yaml` declares `ignoredBuiltDependencies` only, no `packages:` list — this is a single-package repo, not a workspace.
- **Node version constraint**: Not present. No `.nvmrc`, no `engines` in `package.json`. The Stripe test plan recommends Node 20+.
- **Monorepo tooling**: None (no Turborepo, Nx, or workspace packages).

### Scripts (`package.json:5-12`)

```json
"dev":         "next dev",
"build":       "next build",
"start":       "next start",
"lint":        "eslint src/",
"typecheck":   "tsc --noEmit",
"stripe:setup":"tsx --env-file=.env.local scripts/create-stripe-products.ts"
```

No `test`, no `format`, no `prettier`, no `prepare`/`postinstall` hooks.

### Hosting / deploy

- **Vercel**, per `README.md:104-105` and per the `Hosted on Vercel · Built with Next.js` line in `src/components/home/footer.tsx:91`. Deployment is paused per README ("Vercel (web) — deployment paused until end of Phase 4").
- **No `vercel.json`** in repo (default Vercel project config).
- **No `netlify.toml`, no `wrangler.toml`, no `Dockerfile`, no `.github/` directory.** No CI/CD configured.
- `.env.example` (47 lines) and `.env.local` (1505 bytes, identical size — the `.local` file is in repo and may contain placeholder `xxx`s; not inspected for secrets).

---

## 2. Routes & pages

13 route files total (8 pages + 5 API/utility routes). Sourced from `find src/app -name "page.tsx" -o -name "route.ts*"`.

| Route | File | What it is |
|---|---|---|
| `/` | `src/app/page.tsx` | Homepage. Renders `<ThemedHome theme={defaultTheme}>` — the `heritage-painters` theme by default. JSON-LD: organization + service. |
| `/demos/[slug]` | `src/app/demos/[slug]/page.tsx` | 24 SSG'd themed demos (`generateStaticParams` returns all 24). Featured 10 self-canonical here; the other 14 canonical to `/portfolio/[slug]`. Renders `<ThemedHome isDemoPreview>`. |
| `/portfolio` | `src/app/portfolio/page.tsx` | Filterable grid of all 24 designs (filters: round, mode, industry). Uses `<PortfolioGrid>`. **Bottom CTA strip is hard-coded with `bg-neutral-900` and `text-emerald-400/500` — does not theme.** |
| `/portfolio/[slug]` | `src/app/portfolio/[slug]/page.tsx` | 24 SSG'd portfolio details. Renders `<PortfolioBanner>` + `<ThemedHome isDemoPreview>` + `<AboutThisDesign>` (per-theme 80–120-word paragraph). Featured 10 canonical to `/demos/[slug]`; 14 self-canonical. |
| `/pricing` | `src/app/pricing/page.tsx` | Untheme'd pricing page in white + emerald + neutral. Uses `<SiteShellHeader>` + `<SiteShellFooter>`. 5 FAQ entries inline. |
| `/contact` | `src/app/contact/page.tsx` | Untheme'd contact form, prefills based on `?ref=` and `?piece=` URL params. Uses `<SiteShellHeader>`. 91 lines server + 203 lines `<ContactForm>` client (`src/app/contact/contact-form.tsx`). |
| `/checkout` | `src/app/checkout/page.tsx` | Themed (wraps `<ThemeProvider theme={theme}>`). Two-column layout: order summary (left) + RHF/Zod form (right). Redirects to `/pricing` if tier invalid, `/portfolio` if demo invalid. |
| `/onboarding` | `src/app/onboarding/page.tsx` | Themed. Renders 4-step content checklist or "ready to build" celebration based on `sites.status`. Bare `<html>` fallbacks for `MissingSession` / `LookupFailed` / `Processing` (which uses `<meta http-equiv="refresh" content="5">` poll). |
| `/dev/themes` | `src/app/dev/themes/page.tsx` | Dev-only audit grid of all 24 themes. `notFound()` if `process.env.NODE_ENV === "production"` (`src/app/dev/themes/page.tsx:16`). `force-static`. |
| `/api/og/[slug]` | `src/app/api/og/[slug]/route.tsx` | Edge runtime. Generates 1200×630 OG PNG using `next/og`'s `ImageResponse`. Fetches Fontsource TTF binaries on each cold invocation. |
| `/api/contact` | `src/app/api/contact/route.ts` | Zod-validates, fans out to Resend (best-effort) + Slack (best-effort). Returns `{ok:true}` even if both side effects no-op. |
| `/api/checkout` | `src/app/api/checkout/route.ts` | Pre-generates `site_id` UUID, validates `CheckoutRequestSchema`, calls Stripe Checkout in 1 of 3 modes (subscription / onetime+addon / onetime). Returns `{url}` to redirect. |
| `/api/stripe/webhook` | `src/app/api/stripe/webhook/route.ts` | Signature-verified, idempotent (`getSiteByStripeSessionId` guard + unique constraint backstop). Handles `checkout.session.completed` → upsert customer, insert site, send welcome email, Slack ping. Handles `customer.subscription.deleted` → flip status to `cancelled`. |
| `/sitemap.xml` | `src/app/sitemap.ts` | 28 canonical URLs: `/`, 10 featured `/demos/[slug]`, `/portfolio`, 14 non-featured `/portfolio/[slug]`, `/pricing`, `/contact`. |
| `/robots.txt` | `src/app/robots.ts` | `allow: /`, `disallow: ["/api/", "/dev/"]`, sitemap link, host. |

### Broken / stubbed / "coming soon" routes

- **No `/about` page** — referenced from `Footer.tsx` (`href: "#"` placeholder).
- **No `/refund-policy` page** — referenced from `Footer.tsx` (`href: "#"` placeholder).
- **No `/terms`** — referenced as `href: "#"` placeholder.
- **No `/privacy`** — referenced as `href: "#"` placeholder.
- **No `/admin` page** — but `webhook/route.ts:159` constructs an `<{SITE_URL}/admin|admin>` Slack link that 404s today.
- **`/onboarding` `Processing` state** uses `<meta http-equiv="refresh" content="5">` to poll — works, but spec-listed Phase 4e improvements (Stripe Customer Portal link) are deferred per `docs/post-launch-todo.md`.
- **`/contact` page** has a `<Link href="/#demos">` (`src/app/contact/page.tsx:62`) but the homepage anchor is actually `#showcase` — broken in-page nav.

### Navigation structure

There are **two parallel nav surfaces**, plus the themed footer.

1. **DemoSwitcher** (`src/components/home/demo-switcher.tsx`) — sticky 50/60px top bar, mounted at root layout (`src/app/layout.tsx:34`) inside a `<Suspense>`. Self-hides on every route except `/`, `/demos/[slug]`, `/portfolio/[slug]`. Hides itself when `?embed=1`. Shows a square color-chip per featured theme (10) plus a `+14 more →` pill linking to `/portfolio`. When viewing a demo, shows an "I want this look" pill linking to `/checkout?tier=subscription&demo=...`.
2. **SiteShellHeader** (`src/components/site-shell.tsx:11-43`) — used on `/pricing` and `/contact` only. Plain white bar with `Apex Sites` mark + `Portfolio · Pricing · Talk to us` links.
3. **Onboarding** (`src/app/onboarding/page.tsx:54-86`) and **Checkout** (`src/app/checkout/page.tsx:51-83`) each define their own bespoke header inline (themed, with logo + back link / contact email).

So nav is inconsistent: 4 different headers across the app (DemoSwitcher, SiteShellHeader, OnboardingHeader inline, CheckoutHeader inline). No single source of truth.

---

## 3. Component inventory

28 component files in `src/components/` + `src/app/**/<feature>.tsx` colocated client components.

### Home components (`src/components/home/`, 11 files)

All themed, all use `--apex-*` CSS vars from `ThemeProvider`. All use the home-grown `Container / Section / Eyebrow / Display / ApexButton` primitives, **not shadcn**.

| File | Used by | Notes |
|---|---|---|
| `themed-home.tsx` | `app/page.tsx`, `app/demos/[slug]`, `app/portfolio/[slug]` | Composes Hero → TrustStrip → HowItWorks → Pricing → Showcase → FAQ → FinalCTA → Footer |
| `hero.tsx` | `themed-home.tsx` | 5 hero variants based on `theme.hero`: `phone-first`, `calculator`, `gallery`, `booking-card`, `form-card`. All built from CSS gradients + emoji + dummy text — no real photos. |
| `trust-strip.tsx` | `themed-home.tsx` | 4 cells of fake metrics: "★★★★★ / 4.9/47 Google reviews", "100+ sites launched", "24h delivery", "30 days money-back". Adjusts presentation by vibe. |
| `how-it-works.tsx` | `themed-home.tsx` | 4-step cards. Steps hard-coded in component — STEPS constant. |
| `pricing.tsx` | `themed-home.tsx` | Two-card pricing — themed version. SUB_FEATURES + ONETIME_FEATURES hard-coded. |
| `showcase.tsx` | `themed-home.tsx` | 5-col grid of theme thumbnails — each is a scaled-down 0.42× iframe of `/demos/[slug]?embed=1`. |
| `faq.tsx` | `themed-home.tsx` | 8 questions hardcoded. Uses `<Accordion>` from `components/ui/accordion.tsx` (only shadcn primitive imported by themed code). |
| `final-cta.tsx` | `themed-home.tsx` | Inverted dark CTA panel + "Book a 15-minute call" link → `/contact?ref=final-cta`. |
| `footer.tsx` | `themed-home.tsx` | 4-column themed footer. **3 dead `href="#"` links**: About, Refund policy, Terms, Privacy. |
| `demo-switcher.tsx` | `app/layout.tsx` | Global sticky switcher described in Section 2. |
| `primitives.tsx` | All home/* | `Container`, `Section`, `Eyebrow`, `Display`, `ApexButton`. ApexButton renders styled `<a>` or `<button>` with `theme.button` config (shape, shadow, weight, uppercase). |

### Portfolio components (`src/components/portfolio/`, 3 files)

| File | Used by | Notes |
|---|---|---|
| `portfolio-grid.tsx` | `app/portfolio/page.tsx` | Client component. 3 filters (round / mode / industry). Renders `<PortfolioCard>` per theme — each card embeds a 0.42× iframe of the static HTML at `/portfolio-demos/<slug>.html`. |
| `portfolio-banner.tsx` | `app/portfolio/[slug]/page.tsx` | Hardcoded `#064E3B` (emerald-900) bar — does not respect theme. |
| `about-this-design.tsx` | `app/portfolio/[slug]/page.tsx` | Renders 80-120-word paragraph from `lib/portfolio-copy.ts` + spec table (round, vibe, mode, hero, fonts). |

### Top-level shared (`src/components/`, 4 files)

| File | Notes |
|---|---|
| `theme-provider.tsx` | `<ThemeProvider theme={...}>`. Sets CSS vars from `themeToCssVars(theme)`, applies subset of font classNames (only the active theme's display/body/mono fonts). |
| `site-shell.tsx` | `SiteShellHeader` + `SiteShellFooter` — non-themed chrome for `/pricing` and `/contact`. |
| `json-ld.tsx` | Renders `<script type="application/ld+json">` from a single object or array. **No XSS escaping** — uses `JSON.stringify(item)` directly into `dangerouslySetInnerHTML.__html` (`json-ld.tsx:13`). Inputs are static, so this is currently safe. |
| (`favicon.ico`) | At `src/app/favicon.ico`, not `/public`. |

### shadcn primitives (`src/components/ui/`, 11 files)

`accordion`, `badge`, `button`, `card`, `dialog`, `form`, `input`, `label`, `separator`, `sheet`, `tabs`.

**Usage of shadcn primitives outside `src/components/ui/` itself:**

| Primitive | Imported by | Status |
|---|---|---|
| `Accordion` (item/trigger/content) | `src/components/home/faq.tsx` | ✅ used |
| `Button` | _none_ (only `dialog.tsx` + `sheet.tsx` import it internally) | ❌ **dead** |
| `Card` | _none_ | ❌ **dead** |
| `Input` | _none_ | ❌ **dead** |
| `Form` | _none_ | ❌ **dead** |
| `Dialog` | _none_ | ❌ **dead** |
| `Sheet` | _none_ | ❌ **dead** |
| `Tabs` | _none_ | ❌ **dead** |
| `Badge` | _none_ | ❌ **dead** |
| `Separator` | _none_ | ❌ **dead** |
| `Label` | _none_ | ❌ **dead** |

The team scaffolded shadcn early then built `<ApexButton>` and per-theme primitives instead. **10 of 11 shadcn components are dead weight.** They still ship the global `:root` shadcn neutral OKLCH palette in `globals.css:51-83` (`--primary, --secondary, ...`), which is not used by any app code (every app component reads `--apex-*` instead).

### Duplication / inconsistency

- **Two pricing cards**: `src/components/home/pricing.tsx` (themed, used in Showcase strip) and `src/app/pricing/page.tsx` (non-themed, hardcoded emerald + neutral). Different prop names, different markup, same data.
- **Three buttons**: `<ApexButton>` (themed), shadcn `<Button>` (unused), and dozens of inline `<a className="...">` chrome buttons (e.g. `app/portfolio/page.tsx:96-107`, `app/checkout/page.tsx:75-83`, `components/portfolio/portfolio-banner.tsx:44-50`). No single button abstraction.
- **Four headers** (Section 2 above) — DemoSwitcher, SiteShellHeader, inline checkout header, inline onboarding header. Each duplicates the `[A logo] Apex Sites` mark inline.
- **Two footers**: `Footer` (themed) and `SiteShellFooter` (untheme'd). Different copy, different links, no shared source.

---

## 4. Design system / styling

### Approach

- **Tailwind v4** with shadcn token layer in `:root`. App components also use **inline `style={{ ... }}`** extensively (Hero, Pricing, FAQ, Trust, Footer, FinalCTA, Showcase all use `style={{ background: "var(--apex-bg)", ... }}` for theming — not Tailwind classes for color).
- **Per-theme CSS-variable scope**: `<ThemeProvider>` sets `--apex-bg`, `--apex-fg`, `--apex-primary`, `--apex-primary-fg`, `--apex-accent`, `--apex-accent-fg`, `--apex-muted`, `--apex-muted-fg`, `--apex-border`, `--apex-surface`, `--apex-surface-fg`, plus `--apex-radius-{sm,md,lg,pill}` and `--apex-font-{display,body,mono}` on a wrapper `<div>` (`src/lib/themes/css-vars.ts`).
- **No tailwind.config.ts.** Config is in `src/app/globals.css`.

### `globals.css` (paste of `@theme inline` block — `src/app/globals.css:7-49`)

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-sans);
  --color-sidebar-ring: var(--sidebar-ring);
  /* ... 20+ chart/sidebar/popover/card/destructive token mappings ... */
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}
```

`:root` defines a **neutral OKLCH grayscale palette** (background white, foreground near-black, primary `oklch(0.205 0 0)`, accent `oklch(0.97 0 0)`, etc.). Default shadcn neutrals — never overridden by Apex brand colors. The `.dark` variant is also defined but no toggle wires it.

### Per-theme tokens (24 themes)

Each theme is an object exporting `Theme` (shape in `src/lib/themes/types.ts:65-88`):

```ts
interface Theme {
  slug, name, industry, city, tagline, description: string
  mode: "emergency" | "recurring" | "project"
  vibe: "bold-industrial" | "warm-premium" | "friendly-modern" | "naturalist" | "sleek-tech"
  hero: "phone-first" | "calculator" | "gallery" | "booking-card" | "form-card"
  heroEyebrow: string
  colors: { bg, fg, primary, primaryFg, accent, accentFg, muted, mutedFg, border, surface, surfaceFg }
  fonts: { display, body, mono }   // FontFamily union of 9
  radius: { sm, md, lg, pill }
  button: { shape: "pill"|"sharp"|"rounded", shadow: "none"|"soft"|"hard-offset"|"glow", weight, uppercase }
  seoTitle, seoDescription, sourceHtmlPath: string
  isThemeOption: boolean
  round: 1 | 2 | 3
}
```

Example, Heritage Painters (`src/lib/themes/04-heritage-painters.ts`): `bg #FAF6EE`, `fg #1A1614`, `primary #1A1614`, `accent #C8634A`. Fonts: Fraunces (display) + Inter (body) + JetBrains Mono. Radii: 4/6/8/100px. Buttons: sharp, no shadow, bold weight, sentence case.

Example, Ironside Plumbing (`src/lib/themes/01-ironside-plumbing.ts`): `bg #F4F4F5`, `fg #0A0A0A`, `primary #FACC15` (hi-vis yellow), `accent #0A0A0A`. Fonts: Archivo Black + Inter + JetBrains Mono. Radii: 0/0/0/0 (all sharp). Buttons: sharp, hard-offset shadow, heavy, ALL CAPS.

24 themes × ~37 lines each. Theme registry at `src/lib/themes/index.ts` exposes `allThemes`, `featuredThemeSlugs` (10), `defaultTheme` (heritage-painters).

### Fonts (`src/lib/fonts.ts`)

9 Google Fonts loaded via `next/font/google` with `display: "swap"` and CSS-var bindings:

- **Inter** → `--font-inter`
- **Archivo Black** → `--font-archivo-black` (weight 400 only)
- **Fraunces** → `--font-fraunces`
- **Bricolage Grotesque** → `--font-bricolage-grotesque`
- **Plus Jakarta Sans** → `--font-plus-jakarta-sans`
- **Oswald** → `--font-oswald`
- **Playfair Display** → `--font-playfair-display`
- **JetBrains Mono** → `--font-jetbrains-mono`
- **Caveat** → `--font-caveat`

`themeFontClassNames(theme)` deduplicates and joins only the 3 fonts the active theme uses. Wired into `<ThemeProvider>` (`src/components/theme-provider.tsx:18-30`). Untheme'd pages (`/pricing`, `/contact`) get `baseFontClassName` = Inter only. **Root layout uses `baseFontClassName`** so utility pages don't pay the per-theme font cost.

### Icons

- **lucide-react**: 14 import sites. Used: `ArrowRight`, `ArrowLeft`, `Check`, `Circle`, `ChevronRight`, `ChevronDownIcon`, `ChevronUpIcon`, `Lock`. No custom SVGs in app code beyond the favicon and a couple of CRA leftover SVGs in `/public`.
- The "logo" is **a black square with a bold "A" in it**, rendered inline as a 7×7 or 8×8 div with `bg-neutral-900` + `text-white` (`demo-switcher.tsx:51`, `site-shell.tsx:16`, `checkout/page.tsx:65-72`, `onboarding/page.tsx:67-74`). No actual brand mark file. `seo.ts:16` references `${SITE_URL}/logo.png` in the Organization JSON-LD, but **no `logo.png` exists in `/public`** — that link 404s today.

### Dark mode

- **Not implemented as a user-toggleable feature.**
- `globals.css` defines a `.dark` rule and `@custom-variant dark` (`src/app/globals.css:5,86-118`). shadcn primitives (`button.tsx`, `badge.tsx`, `tabs.tsx`, `input.tsx`) include `dark:` variants from the shadcn defaults. No code anywhere sets `class="dark"` on `<html>` or `<body>`. The `cinematic-dark` theme is one of the 24 themes but achieves dark via `--apex-bg #...` not via Tailwind dark variants.
- In short: **dark mode is technically wired into the shadcn primitives but no UI toggles it, no preference is read, and no app component uses `dark:` variants directly.** Per-theme color schemes do the work.

---

## 5. Brand & content

### What is "Apex Sites"?

A **productized website agency** for home-service businesses. Two-tier offering:

- **Subscription**: $299 setup + $149/mo. Hosted on Apex's Vercel/Cloudflare, unlimited edits, Google Business profile management, cancel anytime, 30-day grace period. (`src/components/home/pricing.tsx:9-17`, `src/app/pricing/page.tsx:59-67`.)
- **One-time**: $997 once. Full source code handed over. Optional $49/mo hosting+maintenance addon (unlimited small edits + monthly SEO check). 30 days of edits included. (`src/components/home/pricing.tsx:19-26`.)

The product mechanism: customer picks 1 of 24 designed themes → fills out 30-min content worksheet → Apex swaps in their content → site live in 24 hours.

### Target audience

**Home-service businesses** (per the homepage hero): plumbers, painters, cleaners, roofers, electricians, lawn care, tree care, movers, HVAC. The 24 themes also cover adjacent categories (creative agencies, restaurants, breweries, photographers, design studios) but the marketing copy explicitly positions home-service as the wedge:

> "Production-grade home-service websites, designed to convert." — `src/components/home/hero.tsx:15`
> "The average home-service customer is worth $400–800. Apex Sites pays for itself the first time it books you a job you wouldn't have gotten otherwise." — `src/components/home/pricing.tsx:50-51`

### Value proposition

Three claims repeated across pages:

1. **Speed**: "Live in 24 hours from content receipt." (Hero, Pricing, Checkout, Footer.)
2. **Conversion-engineered**: "Production-grade", "designed to convert", per-vertical hero patterns (phone-first, calculator, booking-card, etc.).
3. **No commitment risk**: "Cancel anytime", "30-day money-back guarantee", "site stays online for 30 days post-cancellation."

### Tone of voice

**Direct, confident, anti-agency.** Short sentences. Prices upfront. Few hedges. Recurring rhetorical move: contrast Apex with Wix/Squarespace ("They sell tools and a blank canvas; we sell finished sites" — `faq.tsx:45`) or with traditional agencies ("We don't disappear into a six-week design process" — `how-it-works.tsx:48`).

Examples:
- "Websites that book more jobs." (default H1)
- "Two ways to buy. Pick the one that fits."
- "The actual phone CTA on YOUR Apex site can do anything you want — call, SMS, schedule a callback."
- "Hi {Name} — let's build your site."
- "We've got everything." (post-onboarding celebration)

### Logos / brand marks / hero imagery

- **There is no logo file.** The "logo" is a div with a single letter `A` (black square + white A). Lives inline in DemoSwitcher, SiteShellHeader, checkout/onboarding inline headers.
- **No hero image.** All 5 hero variants in `src/components/home/hero.tsx` are CSS-only mockups — gradients, mock form rows, mock booking buttons. No real photography.
- **No customer photos / logos / testimonials.** The trust-strip "★★★★★ 4.9 / 47" and "100+ sites launched" are placeholder values hardcoded in `trust-strip.tsx:9-13`.
- **OG images** are dynamically generated per theme via `/api/og/[slug]/route.tsx`, using Fontsource TTFs and theme tokens. No bitmap OG fallback.
- **Portfolio "previews"** are 24 hand-coded HTML files (`public/portfolio-demos/*.html`, 4–44KB each) embedded as scaled-down iframes everywhere a thumbnail is needed.

### Brand colors

- **No global brand palette.** The marketing pages (`/pricing`, `/contact`, `/portfolio` index) use **Tailwind neutral grays + emerald-500/600** as the de-facto brand accent. (`portfolio/page.tsx:124,135`, `pricing/page.tsx:39,176-208`.) Emerald is hard-coded, not a token.
- **24 per-theme palettes**, each with bg/fg/primary/primaryFg/accent/accentFg/muted/mutedFg/border/surface/surfaceFg. Each theme owns its color logic.
- The "neutral OKLCH" palette in `globals.css:51-83` is from the shadcn scaffold and **is not used by any app component**.

### CTAs (full inventory)

| Where | Label | Target |
|---|---|---|
| Hero (default) | "Pick a style →" | `/checkout?tier=subscription` |
| Hero (default) | "See pricing" | `/pricing` |
| Hero (in demo) | "Pick a style →" | `/checkout?tier=subscription&demo={slug}` |
| Pricing card (sub) | "Start subscription →" | `/checkout?tier=subscription` |
| Pricing card (one-time) | "Buy one-time →" | `/checkout?tier=onetime` |
| Showcase | "See all 24 designs (10 options + 14 custom-build inspiration) →" | `/portfolio` |
| Final CTA | "Pick your style →" | `#showcase` (anchor) |
| Final CTA | "Book a 15-min call →" | `/contact?ref=final-cta` |
| DemoSwitcher | "I want this look" | `/checkout?tier=subscription&demo={active}` |
| Portfolio banner | "I want this look" | `/checkout?tier=subscription&demo={slug}` |
| Portfolio index | "See the featured 10 →" | `/#showcase` |
| Portfolio index | "Suggest a design →" | `/contact?ref=portfolio-suggestion` |
| Portfolio detail | "I want this look — start subscription" | `/checkout?tier=subscription&demo={slug}` |
| Portfolio detail | "Buy as one-time build" | `/checkout?tier=onetime&demo={slug}` |
| Pricing FAQ | "portfolio" | `/portfolio` |
| Pricing FAQ | "contact" | `/contact?ref=portfolio-suggestion` |

The CTA copy is consistent ("Pick a style", "I want this look") and on-brand. Targets all resolve.

---

## 6. Assets & media

### `/public` inventory

```
public/
├── file.svg          391 B    CRA scaffold leftover
├── globe.svg         1035 B   CRA scaffold leftover
├── next.svg          1375 B   CRA scaffold leftover
├── vercel.svg        128 B    CRA scaffold leftover
├── window.svg        385 B    CRA scaffold leftover
└── portfolio-demos/  876 KB total, 24 standalone HTML files (each is its own
                              full SSR'd marketing site, with Google Fonts
                              loaded via <link> and inline <style>).
```

Plus `src/app/favicon.ico` (the only favicon — no PNG/SVG icons, no apple-touch-icon, no manifest.json, no any-size variants).

### Oversized assets

- **None over 500KB individually.** Largest is `04-heritage-painters.html` at 44KB.
- The 24 portfolio HTML files **each load Google Fonts via raw `<link>` tag inside an iframe** — every thumbnail render hits `fonts.googleapis.com`. On `/portfolio` index that's 24 simultaneous Google Fonts requests (some duplicate, but the browser doesn't dedupe across iframes by URL alone).

### Missing alt text patterns

- **Zero `<img>` tags in `src/`**. No images to alt-text. Every visual is CSS, an iframe, or a `lucide-react` icon.
- **Zero `next/image` imports in `src/`**. So no image optimization is in play, but also no images to optimize.
- Iframes do have `aria-hidden="true"` + `tabIndex={-1}` (good), but their `title` props are populated.

### Favicon / OG image setup

- **Favicon**: just `src/app/favicon.ico`. No 16×/32×/180× PNG variants, no Apple-touch-icon, no manifest, no theme-color meta.
- **OG**: dynamic via `/api/og/[slug]` — works, but the cold edge invocation fetches a TTF from `cdn.jsdelivr.net` per request (cached on Vercel CDN, but vulnerable to deploy-time cache invalidation per `docs/post-launch-todo.md:42`).
- **Twitter card**: declared globally as `summary_large_image` in `src/app/layout.tsx:23` but `images:` is set per-page in metadata, not in root.

### Animation libraries installed

- `framer-motion@^12.38.0` — **declared, never imported.** Dead dep.
- `tw-animate-css@^1.4.0` — imported in `globals.css:2`. The only animation classes actually used in code are `animate-spin` (3 sites: form submit spinner, onboarding processing spinner) and `animate-pulse` (none).
- No GSAP, Lottie, Motion One, or hand-rolled animation system.

---

## 7. Forms, interactions, integrations

### Forms

| Form | Where | Submits to | Handled by |
|---|---|---|---|
| Contact | `src/app/contact/contact-form.tsx` (203 lines) | `POST /api/contact` | Zod-validated, then Resend (email) + Slack (webhook), both best-effort. |
| Checkout | `src/app/checkout/checkout-form.tsx` (335 lines), RHF + Zod | `POST /api/checkout` | Stripe Checkout session created, browser redirected to `session.url`. |
| Onboarding (3 server actions) | `src/app/onboarding/onboarding-checklist.tsx` (374 lines) → `actions.ts` (149 lines) | `setContentSent`, `setAssetsSent`, `setDomain` server actions | Server-action mutates Supabase `sites.onboarding_state` JSONB; flips `status` to `ready_to_build` when all 3 complete. |
| Hero "form-card" / "booking-card" / "calculator" / "phone-first" | `src/components/home/hero.tsx` | Nothing — visuals only | Inputs are `readOnly` with placeholder values; no submission path. |

### Auth

**Not present.** No NextAuth/Auth.js, no Clerk, no Supabase Auth, no custom auth.

The onboarding access model is a **bearer-token pattern**: anyone holding the Stripe Checkout session_id (~70 unguessable chars) can mutate the corresponding site's onboarding state. Documented in `src/app/onboarding/actions.ts:14-25` ("Phase 5+ will layer customer auth on top.") No `/admin` exists yet despite the webhook posting an admin link to Slack.

### CMS

**None.** All content is in TypeScript files:

- 24 themes → `src/lib/themes/*.ts`
- 24 portfolio paragraphs → `src/lib/portfolio-copy.ts` (1 file, 80–120 words each)
- FAQ Q&A → hardcoded in `src/components/home/faq.tsx:14-47`
- "How it works" 4 steps → hardcoded in `src/components/home/how-it-works.tsx:8-29`
- Pricing copy → hardcoded in `src/components/home/pricing.tsx:9-26` AND duplicated in `src/app/pricing/page.tsx:59-86`
- 24 portfolio HTML demos → `public/portfolio-demos/*.html`
- SEO headlines → derived in `src/lib/seo-headlines.ts` from theme metadata

### Analytics / tracking

**None.** No GA4, Plausible, PostHog, Vercel Analytics. No `<script>` tags for GTM/Facebook Pixel in `layout.tsx` or anywhere else.

### Third-party embeds

**None.** No Calendly, no YouTube embeds, no Google Maps, no chat widgets (Intercom/Crisp/Drift). The "Book a 15-min call" CTA links to `/contact?ref=final-cta`, not to a calendar booking tool.

### External integrations actually wired

- **Stripe** (Checkout + webhook + 4 prices). `src/lib/stripe.ts`, `src/app/api/checkout`, `src/app/api/stripe/webhook`, `scripts/create-stripe-products.ts`. Pinned API version `2024-11-20.acacia`.
- **Supabase** (`@supabase/supabase-js`, service-role only). 2 tables (`customers`, `sites`), RLS enabled with no policies (locked-by-default). `src/lib/supabase.ts` (230 lines, typed helpers).
- **Resend** (best-effort transactional email). `src/lib/email.ts` (42 lines). Welcome / goodbye / contact-inbox templates inline in webhook + contact route handlers.
- **Slack incoming webhook** (best-effort notifications). `src/lib/notify.ts` (27 lines). Optional — silent skip if `SLACK_WEBHOOK_URL` unset.
- **Fontsource CDN** — fetched at edge runtime in `/api/og/[slug]` to load TTFs Satori can decode (woff2 from Google Fonts CSS endpoint doesn't work).

---

## 8. SEO & metadata

### Title / description / OG / Twitter

- **Global defaults** in `src/app/layout.tsx:10-25`:
  - `metadataBase: new URL(SITE_URL)` (good — fixes relative URLs)
  - Title template: `%s — Apex Sites`, default `Apex Sites — Websites that book more jobs`
  - Default description (60 words)
  - Default OG: `type: website`, `siteName: Apex Sites`
  - Default Twitter: `card: summary_large_image`
  - `robots: { index: true, follow: true }`

- **Per-page metadata** is set via `export const metadata` or `generateMetadata`:
  - `/` → adds canonical = SITE_URL, OG with `/api/og/default` image. (`page.tsx`)
  - `/demos/[slug]` → per-theme `seoTitle` + `seoDescription`, canonical conditional (featured 10 self-canonical, 14 → /portfolio/[slug]), OG with `/api/og/{slug}`. Twitter card images.
  - `/portfolio/[slug]` → mirror of demos, opposite canonical logic.
  - `/portfolio` → CollectionPage JSON-LD with `hasPart` listing all 24 themes.
  - `/pricing` → service offer in JSON-LD.
  - `/contact` → ContactPage JSON-LD.
  - `/checkout` and `/onboarding` → `robots: { index: false, follow: false }`.

### Sitemap and robots

- **Sitemap** (`src/app/sitemap.ts`) emits 28 canonical URLs: `/` + 10 featured demos + `/portfolio` + 14 non-featured portfolios + `/pricing` + `/contact`. Lastmod=now, changeFrequency varies, priority 0.6–1.0.
- **robots.txt** (`src/app/robots.ts`): `allow: /, disallow: ["/api/", "/dev/"]`, sitemap link, host link.

### Structured data (JSON-LD)

Centralized in `src/lib/seo.ts`:

- `organizationSchema()` — Organization with logo (`${SITE_URL}/logo.png`, **404s today**), contact point.
- `serviceSchema()` — Service with two offers (Subscription $149/mo, One-time $997).
- `breadcrumbSchema(items)` — BreadcrumbList.
- `demoSchema(theme)` — WebPage with `about` Service.

Wired on `/`, `/portfolio`, `/portfolio/[slug]`, `/demos/[slug]`, `/pricing`, `/contact`. Rendered through `<JsonLd data={[...]}>` (`src/components/json-ld.tsx`).

**Concerns**:
- `seo.ts:16` references `/logo.png` which does not exist in `/public`. Google Rich Results Test will warn.
- `JsonLd` does not escape `</script>` sequences in the JSON. Inputs are static at this point so it's currently safe, but if any user-supplied string ever ends up in a schema object this is an XSS vector.

### Canonical URLs / hreflang / redirects

- **Canonicals** are set per-page (above).
- **Hreflang**: not present — single-language site.
- **Redirects**: `/checkout` redirects server-side to `/pricing` if tier invalid or `/portfolio` if demo invalid (`src/app/checkout/page.tsx:36-43`). No URL-level redirects (no `next.config.ts` `redirects()` block, no Vercel `vercel.json`).

---

## 9. Performance & quality baseline

### Quick wins / red flags from code reading

- **No `next/image` usage anywhere** — but also no `<img>` tags, so no optimization opportunity is being missed in the current state. Real customer photos / hero imagery, when added, will need this.
- **24 iframes embedded as thumbnails** on `/portfolio` index, plus 5 more on the homepage Showcase. Each embeds `<iframe src="/demos/{slug}?embed=1">` or `<iframe src="/portfolio-demos/{file}.html">`. No `loading="lazy"` on most (some have it). 24 iframes on a single page is a serious perf hit even when scaled to 0.42×.
- **9 Google Fonts loaded** on utility pages? No — utility pages get `baseFontClassName` (just Inter). Themed pages load only the theme's 3. Good. But the 24 `public/portfolio-demos/*.html` files each load their own Google Fonts via `<link>`, which fires when the iframes render.
- **Edge OG route** (`/api/og/[slug]`) fetches a TTF from Fontsource on every cold start — Vercel CDN-cached by URL, but a deploy churn invalidates 24 entries. Pre-warming script noted in `docs/post-launch-todo.md:42`.
- **No image optimization** because no images.
- **No bundle analyzer** wired (no `@next/bundle-analyzer`).

### TypeScript / lint / format

- `tsconfig.json`: `"strict": true`, `"noEmit": true` — strict TS enforced. ✅
- `eslint.config.mjs`: flat config, extends `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`. Lint runs via `pnpm lint` → `eslint src/`. ✅
- **No Prettier config** (no `.prettierrc*`, no `prettier.config.*`). Formatting is whatever the editor enforces.

### Tests

- **No tests.** No `*.test.*`, no `*.spec.*`, no `vitest.config.*`, no `playwright.config.*`, no `jest.config.*`. README confirms — there is a manual Stripe runbook in `docs/phase-4-test-plan.md` but no automated suite. ❌
- No CI either (no `.github/workflows/`).

### Accessibility red flags

- **Color contrast**: Most themes look fine on a code read (e.g. heritage `#1A1614` on `#FAF6EE`). Cannot verify without rendering.
- **`<button>` vs `<a>`**: `ApexButton` correctly uses `<a>` when `asChildHref` is set, `<button>` otherwise. ✅ But many in-component CTAs (portfolio cards, banners, checkout headers, onboarding fallbacks) use raw `<a>` or `<Link>` styled like buttons — inconsistent semantics for screen readers.
- **`role="tablist"` + `role="tab"`** on the DemoSwitcher chips (`demo-switcher.tsx:62,71`) but **no `role="tabpanel"`** anywhere — the chips don't actually control panels, they navigate. Wrong ARIA. Should be `role="navigation"` or omitted.
- **Form labels**: `CheckoutForm` and `ContactForm` have associated `<label>`s. ✅ Errors are surfaced visibly with red text but no `aria-invalid` / `aria-describedby` wiring.
- **Iframes** are `aria-hidden="true"` and `tabIndex={-1}`. ✅
- **Hero "phone-first" tap-to-call** uses a fake number `(555) 123-{theme.slug.length.toString().padStart(4, "0")}` in `hero.tsx:221` — the `<a href="tel:+15551234567">` is a real (deceptive) tel link in the demo. Acceptable for demos labeled with "This is a live preview" caption, but an a11y/ethics flag.
- **Skip-to-content link**: not present.
- **`<html lang="en">`**: ✅ set in root layout.
- **Focus styles**: shadcn primitives have them; the inline `<a>`-as-button patterns mostly do not (no `focus-visible` ring).
- **`alt` text** on the only `<img>`-equivalents: 0 `<img>` tags, so n/a. Iframes correctly have `title` attrs.
- The `<Processing>` and `<FallbackShell>` components in `onboarding/page.tsx:255-318` render a **second `<html>` and `<body>`** inside the page tree, which Next will render as nested HTML — invalid markup. (Likely a bug from extracting fallback states without wrapping `notFound()` instead.)

---

## 10. The "basic-ness" problem

The system is well-architected, but visual sophistication is uneven. Two distinct surfaces:

### A. The 24 themed surfaces (Hero, TrustStrip, HowItWorks, Pricing, Showcase, FAQ, FinalCTA, Footer)

These are actually the strongest part — varied, opinionated, branded per theme. **Not basic.** The Heritage Painters editorial vibe is genuinely different from Ironside's hi-vis brutalism. The "vibe + hero pattern" matrix is original.

But specific basic-ness inside the themed surfaces:

- **No real photography anywhere.** Every "hero visual" is CSS-only (gradient tiles, fake form rows with placeholder values, mock booking cards). Industry-standard SaaS sites use product screenshots; agency sites use case-study photography. Apex shows neither. (`src/components/home/hero.tsx:316-491`.)
- **No motion.** No scroll-triggered animation, no hover micro-interactions beyond `hover:-translate-y-0.5`. `framer-motion` is installed and unused.
- **TrustStrip metrics are placeholder** (`★★★★★ 4.9 / 47 Google reviews`, `100+ sites launched`). Will look fake/stock-y to anyone scanning. (`src/components/home/trust-strip.tsx:9-13`.)
- **The "logo" is a black square with the letter A** rendered as a div. Looks like a placeholder, because it is. (`demo-switcher.tsx:51`, etc.)
- **Hero CTA secondary copy**: `$299 setup + $149/mo · or $997 one-time · live in 24h` (mono, 11px, all caps) is fine — but the hero has no visual rhythm beyond [eyebrow → display H1 → body → CTAs → mono CTA]. Same template every theme uses.
- **Single-column scrolling** for the entire home composition. No editorial multi-column layouts, no asymmetric grids, no overlapping elements.

### B. The non-themed surfaces (`/pricing`, `/portfolio` index, `/contact`, `/checkout`-summary)

These are **definitively basic.** They look like default shadcn + Tailwind neutral with emerald-500 as the accent. Concrete tells:

- **`/pricing`** (`src/app/pricing/page.tsx`): white bg, `bg-neutral-900` headline section, `text-emerald-600` accent, `bg-neutral-50` info panel. The "MOST POPULAR" pricing card is `bg-neutral-900` with `text-emerald-400` highlights — generic SaaS template.
- **`/portfolio` index** (`src/app/portfolio/page.tsx`): identical neutral+emerald aesthetic. The 24-card grid uses `bg-neutral-100` placeholders behind 0.42× iframe thumbnails. The footer CTA strip is a hard-coded `bg-neutral-900` + `text-emerald-400` block.
- **`/contact`** (`src/app/contact/page.tsx`): same again — `text-neutral-900`, `text-emerald-600`. Plain rounded inputs.
- **`SiteShellHeader`** (`src/components/site-shell.tsx:11-43`): `border-b border-neutral-200 bg-white`. Minimal nav. Generic.
- **The "logo"** in every header is the same `bg-neutral-900` square with white "A".
- **`PortfolioBanner`** uses hard-coded `#064E3B` / emerald-900, not the theme's colors — visually disjointed from the themed page below it. (`portfolio-banner.tsx:16-22`.)

### C. Cross-cutting basic-ness

- **No considered typography pairing on the marketing chrome.** Utility pages use Inter, full stop. The themed home uses theme-specific pairs (Fraunces+Inter, Archivo Black+Inter, etc.) and looks intentional — but the moment a user steps onto `/pricing` or `/portfolio` they're back in default Inter.
- **No depth.** Shadows are soft / hard-offset / glow per theme spec, but used sparingly. No layered z-index. No glassmorphism (correct call), but also no subtle elevation.
- **Inconsistent spacing.** `py-20 md:py-28` is the standard `Section` rhythm in `primitives.tsx:31`, but checkout/onboarding/pricing pick their own (`py-12 md:py-16`, `py-20 md:py-28`, `py-16 md:py-24`).
- **Inconsistent buttons.** ApexButton (themed), shadcn Button (unused), inline `<a>` chrome buttons (10+ different style strings across pages).
- **The default theme is Heritage Painters** which is a *painting business*, not a generic Apex Sites brand. The `/` homepage thus looks like a painter's site by default, not an Apex Sites marketing site. This is intentional ("the homepage is the demo"), but it means **Apex Sites has no brand of its own** beyond a black A square.

### Specific files to attack first for the redesign

| Issue | File |
|---|---|
| Default theme = a painter's site, not Apex itself | `src/lib/themes/index.ts:98-99` (`defaultThemeSlug`) |
| Brand mark is a black square with "A" | `src/components/home/demo-switcher.tsx:51`, `src/components/site-shell.tsx:16`, `src/app/checkout/page.tsx:65-72`, `src/app/onboarding/page.tsx:67-74` |
| No hero photography / video | `src/components/home/hero.tsx` (5 hero variants, all CSS-only) |
| No motion | n/a (framer-motion installed, never used) |
| Fake testimonial/trust metrics | `src/components/home/trust-strip.tsx:9-13` |
| Untheme'd "basic" pages | `src/app/pricing/page.tsx`, `src/app/portfolio/page.tsx`, `src/app/contact/page.tsx`, `src/components/site-shell.tsx`, `src/components/portfolio/portfolio-banner.tsx` |
| Dead shadcn primitives | `src/components/ui/{button,card,input,form,dialog,sheet,tabs,badge,separator,label}.tsx` |
| Default neutral OKLCH palette in `:root` | `src/app/globals.css:51-83` |
| Footer dead links | `src/components/home/footer.tsx:22-31` |
| 4 different headers | `demo-switcher.tsx`, `site-shell.tsx:11`, inline in `checkout/page.tsx:51-83`, inline in `onboarding/page.tsx:54-86` |
| Logo.png referenced in JSON-LD but missing | `src/lib/seo.ts:16` |
| `<html>` nested inside page (`Processing` / `FallbackShell`) | `src/app/onboarding/page.tsx:255-318` |

---

## 11. Constraints & dependencies to respect

### Must keep working post-redesign

- **Stripe checkout flow end-to-end.** `/checkout` form → `POST /api/checkout` → Stripe Checkout session → success_url `/onboarding?session_id=...`. Three modes (subscription, onetime, onetime+addon). Test plan in `docs/phase-4-test-plan.md`.
- **Stripe webhook at `/api/stripe/webhook`** with signature verification + idempotency via `sites.stripe_session_id` unique guard. The `metadata.site_id` propagation through `session.metadata` AND `subscription_data.metadata` is load-bearing for cancellation handling.
- **Supabase service-role write paths** (`src/lib/supabase.ts`): `getOrCreateCustomer`, `createSite`, `updateOnboardingState`, `updateSiteStatus`. RLS is enabled with no policies — the service-role key bypasses, so no unauthenticated write path exists. **Do not enable any anon-key paths against these tables without writing policies first.**
- **Onboarding bearer-token model** (`src/app/onboarding/actions.ts:14-25`): the Stripe session_id is the access token. Do not weaken validation or expose session_ids in SEO surfaces (`/onboarding` is `noindex,nofollow` — keep it that way).
- **Per-theme font subsetting** (`src/components/theme-provider.tsx:15-30`): page weight depends on this. A redesign that loads all 9 Google Fonts globally would regress LCP.
- **24 themes as data, not duplicated markup.** The redesign should keep `src/lib/themes/*.ts` as the single source of truth — every consumer (homepage, demos, portfolio, OG image, checkout, onboarding) reads from the same `Theme` object.

### URLs that must not change (or need redirects)

The 28 URLs in `src/app/sitemap.ts` are the public surface area. Specifically:

- `/`
- `/demos/{ironside-plumbing|greenwise-lawn|bellhorn-movers|heritage-painters|brightside-cleaning|summit-roofing|westwood-tree|voltcraft-electric|premium-trade|doorstep-editorial}` (10 featured)
- `/portfolio`
- `/portfolio/{14 non-featured slugs}` — but also `/portfolio/{any of all 24 slugs}` resolves and is canonicalized correctly
- `/demos/{any of all 24 slugs}` — same
- `/pricing`
- `/contact`

The site has not deployed yet (Vercel is paused per README) so there is **no inbound SEO traffic to protect today**. Once it deploys, these URLs become canonical; redesign that renames slugs would need redirects.

### Branded elements the owner cares about

- **Two-tier offer ($299+$149/mo, $997+optional $49/mo)** — repeated 6 different places in copy. Pricing structure is core to the product.
- **24-hour delivery promise** — repeated everywhere as a key differentiator.
- **24 themes** — the count is in headlines, the FAQ, the portfolio CTA. Redesigning to "12 themes" or "30 themes" requires copy rewrites everywhere.
- **The vibe×hero matrix** (5 vibes × 5 hero patterns × 3 modes × 3 design rounds) is non-trivial design IP that should survive the redesign.
- **Domain**: `apexsites.com` (referenced in `seo.ts:4` fallback, `email.ts:13`, footer copy, contact email).
- **Resend `from` address**: `Apex Sites <onboarding@resend.dev>` — works without verification but should move to a custom verified domain before launch.

### Dependencies to be careful with

- **Stripe API version `2024-11-20.acacia`** is pinned in `src/lib/stripe.ts:15`. Do not bump without re-reading webhook payload assumptions; the SDK's `LatestApiVersion` is `2026-04-22.dahlia` and there's a deliberate `@ts-expect-error` on the apiVersion line.
- **Supabase service-role key** is the only way the app talks to its tables. RLS is enabled with no policies — anon/authenticated clients will be 403'd by design.
- **`process.env` reads at request time, not module-init** in `lib/stripe.ts` and `lib/supabase.ts`. This is what lets `next build` pass without secrets. Do not move env reads to module top-level.
- **`framer-motion` is installed but unused.** A redesign that adopts it should also de-install if going a different direction.

---

## Open questions for the owner

These are the things I cannot determine from the code alone. Need answers before redesign starts.

1. **Brand identity**. Is there a logo file, wordmark, or brand-guideline doc anywhere outside this repo? Right now the brand is a black A square. Should the redesign create one, or keep the "we are infrastructure, our customers are the brand" stance?
2. **What is the *Apex Sites* visual identity supposed to look like?** The default theme on `/` is Heritage Painters — i.e. the marketing site looks like a painter's site by default. Is that intentional ("the homepage is a live demo"), or should `/` get its own dedicated Apex-branded look that's separate from the 24 themes?
3. **Real customer assets**. Are there testimonials, case studies, customer logos, before/after photos, or any social proof we can use? The `100+ sites launched · 4.9/47 Google reviews` placeholders are the only social proof on the site.
4. **Real content for the 24 demos**. The portfolio HTML files use plausible-but-fictional businesses (Heritage Painters, Ironside Plumbing, etc.). Are any of those real customers, or are they all illustrative? This affects whether we can show "real work" or have to keep them framed as concept demos.
5. **Has anything launched in production yet?** The README says Vercel is paused. Are there any inbound URLs we're worried about for SEO continuity, or is this still pre-launch with zero traffic?
6. **Is the customer redirected somewhere we don't have admin tooling for?** The webhook posts a `/admin` Slack link that 404s. What's the operational tooling story for actually building sites once an order comes in — manual? Notion doc? Something else?
7. **Domain strategy.** `apexsites.com` is referenced everywhere. Is that registered? Will the customer's site live on a `*.apex-sites.com` subdomain (referenced in `.env.example:32`), `*.apexsites.com`, or their own domain via Vercel + Cloudflare?
8. **Persona**. The copy targets home-service operators, but the theme catalog includes creative agencies, restaurants, breweries, photographers, etc. (24 themes covers many verticals). Is the redesign aiming to **narrow** the marketing toward home services only (and treat the other 16 themes as pleasant surprises), or **broaden** to "we do all small-business brands"? This changes hero copy, hero imagery, and which themes get featured.
9. **Scope of "redesign"**. Are we redesigning the *Apex Sites* marketing+commerce surface (the chrome around the themes), or are we also touching the 24 themes themselves? Or both?
10. **Timeline / launch tie-in**. The README marks Phase 4f (test plan) as ⏳ pending. Is the redesign blocking launch, parallel to launch, or post-launch?
11. **Custom-build offering.** Phase 2.5 *removed* the custom-build tier per the README, but `/contact?ref=portfolio-suggestion` still implies one ("If your industry, vibe, or hero pattern isn't represented in our 24, send a quick note"). Do we want to bring custom-build back as a third tier, or keep it as just an inquiry-only path?
12. **Animation appetite**. `framer-motion` is installed unused. How much motion do you want — none, subtle (fade-on-scroll, hover micro), or expressive (scroll-driven hero animations, theme-switch transitions)?
13. **Is dark mode a goal?** `globals.css` has dark-mode tokens defined but no toggle. Some of the 24 themes are inherently dark (cinematic-dark). Is a global dark-mode toggle on the redesign's scope, or out?
14. **Tests + CI**. There are no tests, no CI. Should the redesign add a test scaffold, or is the manual `docs/phase-4-test-plan.md` runbook still the only quality gate?
15. **Analytics**. Nothing installed today. PostHog, GA4, Plausible, or skip?
