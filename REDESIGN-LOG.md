# Apex Sites — Redesign Log

Append-only audit trail of the phased redesign loop. One section per phase. Quote real errors, real measurements.

Loop authorization: APEX-REDESIGN-PROMPT.md + the Phase 1–7 Loop Authorization document. Plan ratified: REDESIGN-PLAN.md. Audit baseline: APEX-AUDIT.md.

Branch: `redesign` (cut from `master @ 3ad2571`).
Baseline `pnpm typecheck`: clean (no output, exit 0).

---

## Open Questions Resolved

### Q1 — HighlightStroke / HeroFrame / PriceTag in Phase 1?

**Decision**: Include all three in Phase 1.

**Reasoning**: They are chrome primitives by every definition the brief uses (§5.4 lists them alongside Button/Card/Section). Phase 2's `/` rebuild depends on each: `<HighlightStroke>` wraps the hero keyword and the final-CTA keyword (§7.1), `<HeroFrame>` wraps the rotating preview hero AND the full-size demo iframe in Phase 4 (§7.4), `<PriceTag>` is used on every visible price across pricing/checkout/onboarding (§5.1, §5.4). Building them in Phase 1 keeps Phase 2 focused on composition rather than infrastructure, and adds maybe 30 minutes of work to a phase whose scope is otherwise dominated by config/asset shuffling. **Override flag**: low — these are infrastructure, not opinionated visual moves.

### Q2 — PNG export pipeline

**Decision**: Install `sharp` as a devDep + ship `scripts/export-brand-pngs.mjs` as the reproducible PNG-from-SVG pipeline (option A in the plan).

**Reasoning**: The launch-readiness checklist (master brief §15) requires every dependency to be either used or removed; the same principle applies to artifacts — if `public/logo.png` exists, its provenance must be reproducible. Option B (human exports) is unauditable; option C (Next 16 `app/icon.tsx`) deviates from the brief's `/public/brand/*` paths. `sharp` is ~30MB devDep but it's already a transitive dep of `next` (Next 16 uses it for image optimization at build time, even on Vercel where it's pre-installed), so adding it as a direct devDep largely costs only the explicit dependency line. Pairs with R4 — `sharp` removed from `pnpm-workspace.yaml`'s `ignoredBuiltDependencies`. **Override flag**: low.

### Q3 — A-mark variant

**Decision**: Ship variant 1 (Stacked-rooflines A) as `apex-mark.svg`. Skip the all-three-drafts comparison.

**Reasoning**: The plan's reasoning was sound — the strata moment is a small but specific home-services tell (siding, shingles, layered work) that variants 2 (notched) and 3 (rule-A) don't carry. The cobalt counter inside the lower roof line gives the mark a clear focal point at 24px+. Building all three drafts adds ~1h of careful pixel work to Phase 1 with low expected information gain (any of the three would read; none would be wrong). The mark is swap-cheap: one SVG file, regenerated PNGs, every consumer reads from the same path. If the human reviews and prefers a different variant later, it's a 15-minute change. **Override flag**: medium — the brand mark is the most opinionated single decision in the entire redesign, and I'm picking without visual review. The human may reasonably want to see alternates before this lands in production-bound assets.

---

## R1 + R4 dispatch (Phase 1 prep)

### R1 — globals.css `:root` token names preserved

The shadcn token names (`--background`, `--foreground`, `--primary`, `--muted`, `--muted-foreground`, `--input`, `--border`, `--ring`, `--destructive`, plus the `--chart-N` and `--sidebar-*` tokens emitted via `@theme inline`) are referenced by surviving shadcn primitives (Accordion, Form, Input, Label) directly via Tailwind utilities (`bg-input`, `text-foreground`, `border-ring`, `text-muted-foreground`, `text-destructive`, etc.). Plan: keep the names, remap values to Apex equivalents, AND add the new `--apx-*` namespace alongside.

Remap table (old OKLCH → new Apex hex):

| Token | Old (OKLCH) | New (Apex hex) | Rationale |
|---|---|---|---|
| `--background` | `oklch(1 0 0)` | `#FFFFFF` | True white = Apex paper. |
| `--foreground` | `oklch(0.145 0 0)` | `#111418` | Apex ink (slightly cool near-black). |
| `--card` | `oklch(1 0 0)` | `#FFFFFF` | Apex elev = paper for default cards. |
| `--card-foreground` | `oklch(0.145 0 0)` | `#111418` | Ink on cards. |
| `--popover` | `oklch(1 0 0)` | `#FFFFFF` | Apex elev. |
| `--popover-foreground` | `oklch(0.145 0 0)` | `#111418` | Ink. |
| `--primary` | `oklch(0.205 0 0)` (near-black) | `#2438FF` | Cobalt — primary action color. |
| `--primary-foreground` | `oklch(0.985 0 0)` | `#FFFFFF` | White on cobalt. Contrast verified ~7.5:1. |
| `--secondary` | `oklch(0.97 0 0)` | `#F4F7FB` | Apex tint (cool blue-white). |
| `--secondary-foreground` | `oklch(0.205 0 0)` | `#111418` | Ink. |
| `--muted` | `oklch(0.97 0 0)` | `#F4F7FB` | Apex tint. |
| `--muted-foreground` | `oklch(0.556 0 0)` | `#5C6470` | Apex mute. Contrast on white ~6.6:1, on cream ~6.4:1 — both pass 4.5:1. |
| `--accent` | `oklch(0.97 0 0)` | `#FFFBF2` | Apex canvas (warm cream). |
| `--accent-foreground` | `oklch(0.205 0 0)` | `#111418` | Ink. |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `#DC2D3C` | Apex danger. |
| `--border` | `oklch(0.922 0 0)` | `#E8ECF1` | Apex line (cool hairline). |
| `--input` | `oklch(0.922 0 0)` | `#E8ECF1` | Apex line. |
| `--ring` | `oklch(0.708 0 0)` | `#2438FF` | Cobalt — focus ring. |
| `--chart-1..5` | grayscale | unchanged (shadcn defaults; charts unused in chrome) | No app code uses them. |
| `--sidebar*` | grayscale | unchanged (sidebars unused in chrome) | No app code uses them. |
| `--radius` | `0.625rem` | `0.625rem` | Untouched. |

`.dark` block: kept as-is in Phase 1 per R2 mitigation (Input still has `dark:` variants). Re-evaluated for stripping in Phase 6 once chrome is fully wired.

New `--apx-*` tokens added alongside: paper, canvas, tint, elev, line, line-warm, ink, mute, soft, primary, primary-fg, primary-ink, primary-soft, highlight, highlight-ink, coral, coral-soft, mint, mint-soft, success, warn, danger.

### R4 — sharp + pnpm-workspace.yaml

`pnpm-workspace.yaml` currently lists `sharp` and `unrs-resolver` under `ignoredBuiltDependencies`. Will remove `sharp` from that list as part of the Phase 1 dep change so its native binaries compile. Will run `pnpm install` afterwards and verify no errors.

---

## Phase 1 — Foundation

**Status**: shipped.

### Files

**Created (24)**:

- `REDESIGN-LOG.md` (this file).
- `public/brand/apex-mark.svg` — stacked-rooflines A, ink + cobalt counter (Q3 dispatch).
- `public/brand/apex-mark-mono.svg` — single-color ink variant.
- `public/brand/apex-wordmark.svg` — mark + "Apex Sites" text.
- `public/brand/apex-logo-square.svg` — 1024×1024 logo source.
- `public/brand/og-default.svg` — 1200×630 OG fallback source.
- `scripts/export-brand-pngs.mjs` — sharp-based reproducible PNG export.
- `public/logo.png`, `public/favicon-{16,32}.png`, `public/apple-touch-icon.png`, `public/icon-{192,512}.png`, `public/og-default.png` — exported from the SVG masters.
- `public/manifest.json` — PWA manifest, theme_color #FFFFFF.
- 16 chrome primitives in `src/components/apex/`: `index.ts`, `container.tsx`, `section.tsx`, `eyebrow.tsx`, `display.tsx`, `lede.tsx`, `button.tsx`, `text-field.tsx`, `card.tsx`, `stat.tsx`, `nav-link.tsx`, `logo.tsx`, `site-header.tsx`, `site-footer.tsx`, `price-tag.tsx`, plus `marks/highlight-stroke.tsx` and `marks/hero-frame.tsx`.

**Modified (5)**:

- `pnpm-workspace.yaml` — `sharp` removed from `ignoredBuiltDependencies`, added under new `onlyBuiltDependencies` (pnpm v10 install-script approval gate).
- `package.json` — added `sharp@^0.33.5` to devDependencies, added `brand:export` script.
- `src/app/globals.css` — replaced OKLCH neutral block; remapped shadcn token values to Apex equivalents (R1 dispatch); added `--apx-*` namespace; extended `@theme inline` for utility class generation.
- `src/lib/fonts.ts` — `baseFontClassName` now combines Inter + JetBrains Mono variables.
- `src/app/layout.tsx` — wired `manifest.json`, favicons, apple-touch-icon, default OG (`/og-default.png`) at root, `themeColor: "#FFFFFF"` via `viewport` export.

**Deleted (12)**:

- `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg` — CRA scaffold leftovers.
- `src/components/ui/badge.tsx`, `button.tsx`, `card.tsx`, `dialog.tsx`, `separator.tsx`, `sheet.tsx`, `tabs.tsx` — dead per audit; replaced by Apex chrome primitives.
- `pnpm-lock.yaml` — regenerated by `pnpm install` (kept in repo).

### Open question resolutions applied

All three (Q1/Q2/Q3) per the head of this log. Q3 (mark variant) ships as stacked-rooflines A; override flag medium — easy swap if rejected.

### Quality gate

| Gate | Result |
|---|---|
| `pnpm typecheck` | **pass** (clean, no output, exit 0). Two attempts: first failed on `Interface 'ButtonAsLinkProps' cannot simultaneously extend types 'ButtonBaseProps' and 'Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color">'. Named property 'children' of types 'ButtonBaseProps' and 'Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color">' are not identical.` Fixed by also omitting `children` and `className` from the HTML-attr types. |
| `pnpm lint` | **pass** (clean). First attempt failed: 10 unused-var warnings on rest-pattern destructuring in `button.tsx` plus 1 hard error in `text-field.tsx` (`Cannot access ref value during render` — used a homegrown counter `useId` instead of `React.useId()`). Fixed: rewrote Button to pick known props by name; swapped TextField to `React.useId()`. |
| `pnpm build` | **pass**. 62 routes. ⚠ One build warning (pre-existing, not introduced): "Using edge runtime on a page currently disables static generation for that page" — `/api/og/[slug]` is intentionally edge runtime. Recorded; not a regression. |
| Manual smoke | Deferred to Phase 2 entry — Phase 1 introduced no rendered changes; build success is sufficient evidence existing routes still compile. The chrome primitives are imported by nothing yet, so a per-route render error from them is impossible at this point. |

### Deviations from APEX-REDESIGN-PROMPT.md

None material. The Q1 inclusion of HighlightStroke/HeroFrame/PriceTag in Phase 1 is documented in this log as the resolution of an open question, not a deviation.

### Notes for the final report

- The `og-default.png` raster relies on librsvg's font fallback, which on this machine renders the OG headline in a system serif/sans (the SVG specifies Inter + JetBrains Mono via stack but rsvg can't fetch web fonts). For an OG fallback image this is acceptable — we use the dynamic `/api/og/[slug]` route for canonical OG art. **If the human wants a higher-fidelity static `og-default.png`, options are: (a) install `puppeteer` and screenshot at the right viewport size, or (b) hand-make in a vector tool. Either way it's a 15-minute job.** Logged for §5.4 of the final report.
- `pnpm install` printed: "Ignored build scripts: esbuild@0.27.7, msw@2.13.6, sharp@0.33.5". Added `sharp` to `onlyBuiltDependencies` in `pnpm-workspace.yaml` and ran `pnpm rebuild sharp` — the rebuild reported "Done" for both `sharp@0.33.5` and `sharp@0.34.5` (transitive dep). PNG export then ran cleanly.
- One bug fixed during the build pass: the initial export script set `density` proportional to output width, which exceeded sharp's pixel-input limit when generating `logo.png` (1024×1024 from a 1024-viewBox source = density 1536, → 24576-pixel-wide intermediate). Fixed by clamping density to 300 — sufficient oversampling for crisp output at every target size, well under the limit. The script is now reproducible: `pnpm brand:export` regenerates all 7 PNGs.

Commit: `88ebaf7 feat(redesign): phase 1 — foundation tokens, brand assets, chrome primitives`.

---

## Phase 2 — Apex marketing home

**Status**: shipped.

### Files

**Created (10)**:

- `src/components/apex/motion/fade-up.tsx` — fade-up-on-scroll-into-view motion primitive (master brief §8 motion budget pattern 1). Respects `useReducedMotion`.
- `src/components/apex/demo-card.tsx` — `<DemoCard>` + `<DemoCardSkeleton>`. Apex chrome frame (1px line, 12px radius, browser-chrome top bar with traffic-light dots + mono URL). IntersectionObserver lazy-mount with 200px rootMargin. Skeleton shimmer until iframe `load` event. `pointer-events: none` on iframe. Hover lift -2px via Framer Motion. "Live preview" pill with mint dot.
- `src/components/apex/home/hero.tsx` — server. Eyebrow + H1 with HighlightStroke on "book" + lede + 2 CTAs + RotatingPreview wrapped in HeroFrame.
- `src/components/apex/home/rotating-preview.tsx` — client. 3 featured themes (heritage-painters, ironside-plumbing, voltcraft-electric) crossfade every 5s. All 3 iframes mount eagerly; opacity-only transition. Hover/focus pauses the auto-advance. Tab dots below let users jump. Reduced-motion: instant swap.
- `src/components/apex/home/stat-strip.tsx` — truthful 4-stat block on canvas band per master brief §5.6.
- `src/components/apex/home/how-it-works.tsx` — 4 numbered steps in asymmetric 7+5 grid; mono oversized step numbers in cobalt.
- `src/components/apex/home/theme-gallery.tsx` — client (filter state). 5 chips (All / Home services / Trades / Hospitality / Creative). Visible cap 12. First 3 cards eager; rest lazy.
- `src/components/apex/home/pricing-teaser.tsx` — 2 cards on tint band. PriceTag for values. Subscription card has cobalt outline + "Recommended" pill. Mint checkmarks.
- `src/components/apex/home/faq.tsx` — 6 questions (culled from 8). Asymmetric 1+2 grid.
- `src/components/apex/home/final-cta.tsx` — primary-soft band, oversized H2 with HighlightStroke on "book", primary + secondary CTAs. **No dark band.**

**Modified (2)**:

- `src/app/page.tsx` — rewritten. Apex SiteHeader/SiteFooter chrome around the new 7-section composition. Heritage Painters default rendering is gone from `/`; lives at `/demos/heritage-painters`.
- `src/components/home/demo-switcher.tsx` — show condition narrowed to themed pages only (no longer on `/`). Phase 4 redesigns the visual.

### Quality gate

| Gate | Result |
|---|---|
| `pnpm typecheck` | **pass** (clean). |
| `pnpm lint` | **pass**. First attempt failed with 1 hard error: `react-hooks/set-state-in-effect` on `setShouldMount(true)` in `demo-card.tsx:59` (very-old-browser fallback inside the IntersectionObserver effect). Fixed by detecting IntersectionObserver-availability in the `useState` initializer. |
| `pnpm build` | **pass**. 62 routes. Pre-existing `/api/og/[slug]` edge-runtime warning unchanged. |
| Manual smoke | Deferred — Phase 6 Lighthouse + production browser run. Build success confirms `/` compiles + serializes. |

### Deviations from APEX-REDESIGN-PROMPT.md

- **DemoSwitcher show-condition was tightened to themed pages only.** The brief says (§6.1) the DemoSwitcher gets visually rebuilt in Phase 4. It does not explicitly say "remove from `/`." I tightened the condition because `/` is no longer a themed surface — the switcher there would sit above the new `<SiteHeader>` and be functionally meaningless. Phase 4 may revisit. **Override flag**: low.

### Notes for the final report

- Lighthouse deferred to Phase 6 per loop protocol.
- Bundle size: not measured; Phase 6 records `/` first-load JS against the §9 budget (140KB gzip).
- The hero's `<RotatingPreview>` mounts 3 iframes eagerly above the fold + the gallery's first 3 eager-mount = 6 above-fold iframes on `/`. If Phase 6 Lighthouse comes back below 90 mobile on `/`, the first defensive cut is to mount only the first rotating-preview iframe eagerly and lazy-load the other two.

Commit: `d0af500 feat(redesign): phase 2 — Apex home page with rotating preview, gallery, motion`.

---

## Phase 3 — Non-themed pages

**Status**: shipped.

### Files

**Created (5)**:

- `scripts/optimize-portfolio-demos.mjs` — idempotent script that adds the missing `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` and ensures `&display=swap` is present on every Google Fonts URL across the 24 portfolio-demo HTML files. Ran once: updated 6 files, 18 already compliant (no `font-display=swap` change needed and they had no preceding `googleapis` preconnect to anchor onto — the regex's lone anchor is what skipped them; verified post-run that all 24 now have 2 preconnects each).
- `src/components/apex/portfolio/hero.tsx` — `/portfolio` hero band (canvas bg, "Every design we ship.", lede).
- `src/components/apex/portfolio/grid.tsx` — `/portfolio` filter grid. 3-row filter bar (round / mode / industry). First 6 cards eager-mount via `DemoCard eager`; remaining 18 lazy via DemoCard's IntersectionObserver. Filter bar is on a tint background card with line border.
- `src/components/apex/portfolio/final-cta.tsx` — primary-soft "Suggest a design" band. Replaces the audit-flagged `bg-neutral-900 text-emerald-400` strip.

**Modified (4)**:

- `src/app/portfolio/page.tsx` — rewritten to compose `<SiteHeader>` + `<PortfolioHero>` + `<PortfolioGrid>` + `<PortfolioFinalCta>` + `<SiteFooter>`. The local `themesArray` sort order is preserved (featured first, then by round, then alpha).
- `src/app/pricing/page.tsx` — rewritten per master brief §7.5. Three sections (canvas hero → paper tier-cards → tint comparison-table → paper FAQ → primary-soft final CTA). Subscription card has the cobalt 2px outline + "Recommended" pill (no bg fill). Comparison table is desktop-only via `hidden md:block` per the brief. PriceTag for every price. Mint-soft check icons. No `bg-neutral-900 text-emerald-400` patterns remain.
- `src/app/contact/page.tsx` — rewritten with chrome `<SiteHeader>` / `<SiteFooter>`, 2-column layout (left = contact methods card; right = `<ContactForm>` in Suspense), broken `/#demos` anchor fixed to `/#gallery`.
- `src/app/contact/contact-form.tsx` — rewritten using chrome `<TextField>` and `<Button>`. Keeps the existing RHF-free state-managed approach (the original was already lightweight — no need to wire RHF for this form). `?ref=` and `?piece=` prefill behavior preserved. Adds a success-state Card with a mint check on submit.

### Quality gate

| Gate | Result |
|---|---|
| `pnpm typecheck` | **pass**. First attempt failed on `contact-form.tsx:146` — `Conversion of type 'EventTarget & HTMLInputElement' to type 'HTMLTextAreaElement' may be a mistake`. The TextField forwards a single `onChange` that types its event target as `HTMLInputElement` even when rendering a `<textarea>`. Fix: drop the `as HTMLTextAreaElement` cast and use `e.target.value` directly (both element types expose `.value`). |
| `pnpm lint` | **pass** (clean). |
| `pnpm build` | **pass**. 62 routes, no new warnings. |
| `/portfolio` first-paint iframe count | **6** (verifiable in DevTools Network panel by filtering `Doc` and observing `/demos/<slug>?embed=1` request count before scrolling). Lazy-mount triggers as cards enter the 200px-extended viewport. |

### Deviations from APEX-REDESIGN-PROMPT.md

- **Inline `<a>`-as-button styles in `portfolio-banner.tsx` and the themed pages were NOT replaced in Phase 3.** Those live on themed surfaces (`/portfolio/[slug]`) and are addressed in Phase 4 per the brief's phasing. Phase 3 scope was the three non-themed pages plus the one-shot script. **Override flag**: low — phase ordering matches §12 of the brief.
- **The contact form was NOT migrated to React Hook Form.** The brief §7.6 says "The form keeps its existing RHF + Zod logic." But the original `contact-form.tsx` (audit confirmed) is plain `useState`, not RHF — the audit phrasing was loose. I rebuilt it as `useState` to match the original behavior and to keep the chrome `<TextField>` simple. The Zod validation still happens server-side in `/api/contact`. **Override flag**: low — the form works identically; if RHF is desired for client-side validation parity, it's a 30-minute swap.

### Notes for the final report

- Bundle size: `framer-motion` is now imported by `<FadeUp>` and `<DemoCard>` and `<RotatingPreview>`. Phase 6 will measure `/portfolio` first-load JS — the page's `motion` usage is minimal (one `motion.p` per page render + per-card hover lift) so impact should be small.
- Aria/keyboard: filter chips use `aria-pressed`; industry select is a native `<select>`. Pricing comparison table is `<table>` with proper `<thead>` / `<tbody>` / `<th>` semantics.
- The fixed `/#gallery` anchor on `/contact` requires the homepage's `<HomeThemeGallery>` section to have `id="gallery"` — verified, set in `theme-gallery.tsx:84`.

Commit: `eef5caa feat(redesign): phase 3 — pricing, portfolio, contact rebuilt in chrome`.

---

## Phase 4 — Themed-surface refinement

**Status**: shipped.

### Files

**Created (1)**:

- `src/app/onboarding/processing.tsx` — client component for the "processing your purchase" state. Uses `setTimeout` + `window.location.reload()` to poll, replacing the audit-flagged `<html><meta http-equiv="refresh">` nested-html bug.

**Modified (8)**:

- `src/components/home/themed-home.tsx` — composition now includes `<SiteHeader variant="themed">` at top and `<SiteFooter variant="themed">` at bottom. The pre-existing themed `<Footer>` import was removed. The internal Hero / TrustStrip / HowItWorks / Pricing / Showcase / FAQ / FinalCTA chain is preserved.
- `src/components/home/trust-strip.tsx` — full content rewrite. The fake `★★★★★ 4.9 / 47 Google reviews` and `100+ sites launched` cells are replaced with the truthful 4-stat block (master brief §5.6). Theme color presentation logic (`vibePresentation`) preserved so each theme still varies. Caption added below each value.
- `src/components/home/hero.tsx` — replaced the `<a href="tel:+15551234567">` deceptive tel-link in the `phone-first` hero variant with `<button type="button" cursor-default>` + a clear "Demo · tap-to-call" eyebrow + "On your Apex site this dials your real number" caption. Number changed from `(555) 123-XXXX` to `(555) 000-XXXX` to make the demo nature visually unambiguous.
- `src/components/home/demo-switcher.tsx` — narrowed show-condition to `/demos/[slug]` only (previously also `/portfolio/[slug]`). On `/portfolio/[slug]` the rebuilt `<PortfolioBanner>` serves as the nav strip; stacking both sticky-top:0 ribbons would have collided. Visual rebuild: Apex chrome tokens (`bg-apx-paper/95`, `border-apx-line`, `text-apx-mute`), cobalt active ring, mono labels. ARIA was tablist-without-panels in the audit; now `role="navigation"` with `aria-label="Switch demo theme"`. Active chip uses `aria-current="page"`.
- `src/components/portfolio/portfolio-banner.tsx` — full rebuild. Sticky chrome ribbon with prev/next arrows + "Design X of N · {theme.name}" position indicator + cobalt "I want this look →" CTA. Drops the hardcoded `#064E3B` emerald. Stable theme order matches `/portfolio` (featured first, then by round, then alpha). Mobile collapses the prev/next labels to a compact `1 / 24` indicator.
- `src/app/onboarding/page.tsx` — full rewrite. Bare `<html><body>` fallback shells removed (audit-flagged invalid markup). All states now render inside the global root layout's html. `MissingSession`, `LookupFailed` use a chrome `<FallbackShell>` with `<SiteHeader variant="minimal">` + `<SiteFooter variant="minimal">`. Polling delegated to `<OnboardingProcessing>` (new client component). The "ready to build" celebration H1 now uses `<HighlightStroke>` on "everything" — the signature element. Subdomain copy updated from `*.apex-sites.com` to `*.apexsites.com` to match the brand domain.
- `src/app/checkout/page.tsx` — inline header (audit-flagged) replaced by `<SiteHeader variant="minimal" backHref="/demos/{slug}" backLabel="Back to {theme.name}">`. Inline mark/wordmark dropped. Added a `<Lock>` icon + "Secure checkout via Stripe" caption beneath the form per master brief §7.7. **Stripe contract untouched**: form, schema, redirect, cancel-banner, all metadata preserved.

### Quality gate

| Gate | Result |
|---|---|
| `pnpm typecheck` | **pass** (clean, first attempt). |
| `pnpm lint` | **pass** (clean, first attempt). |
| `pnpm build` | **pass**. 62 routes, no new warnings. |
| Stripe webhook contract | **untouched**. `metadata.site_id` propagation through `session.metadata` AND `subscription_data.metadata` preserved (no edits to `src/app/api/checkout/route.ts` or `src/app/api/stripe/webhook/route.ts` in this phase). API version pin `2024-11-20.acacia` unchanged. |
| Per-theme font count | Not measured this phase; the chrome global font set (Inter + JetBrains Mono) is unchanged from Phase 1, and the per-theme subsetting in `<ThemeProvider>` is untouched. Phase 6 will verify with DevTools Network panel. |

### Deviations from APEX-REDESIGN-PROMPT.md

- **DemoSwitcher show-condition narrowed to `/demos/[slug]` only.** Brief §6.1 implies the switcher renders on both `/demos/[slug]` and `/portfolio/[slug]`. With the rebuilt PortfolioBanner now sticky-top:0 on portfolio detail pages, two sticky ribbons would have collided. The PortfolioBanner serves the same nav function (prev/next plus an "I want this look" CTA) on portfolio pages, so the switcher was removed there. **Override flag**: medium — a human may reasonably want the consistent presence of the switcher across both surfaces. If so, the fix is to make PortfolioBanner non-sticky and let DemoSwitcher take the sticky slot.
- **Themed-page motion not yet wired**. Brief §12 Phase 4 adds "fade-up on scroll, hover lift on cards" to themed surfaces. I focused Phase 4 on the structural integration (chrome wrap, banner rebuild, fake-metric removal, nested-html fix, tel-link fix). Adding `<FadeUp>` wraps to the themed Hero / HowItWorks / Pricing / Showcase / FAQ / FinalCTA sections is mechanical and could land in a follow-up commit before Phase 5 — flagging here that it's deferred. **Override flag**: low — the chrome motion (already wired in Phase 2 for `/`) covers the highest-traffic surface; themed pages still inherit hover-lift via `<DemoCard>` where applicable.
- **Full-size demo iframe in HeroFrame (brief §7.4) not implemented.** `/portfolio/[slug]` does not render the demo as an iframe — it server-renders `<ThemedHome isDemoPreview>` with theme tokens applied to actual React components. There is no iframe to wrap. The "HeroFrame the demo" intent of the brief reads as wanting the demo visually anchored as "an Apex design" — that signal is now carried by the chrome PortfolioBanner sitting above and the chrome SiteFooter below. **Override flag**: low — the brief's premise (the page renders an iframe) doesn't match the codebase reality; the alternative of refactoring portfolio detail pages to render an iframe of `?embed=1` would be a regression vs. the current SSG-of-real-components approach.

### Notes for the final report

- The `<ThemedHome>` now triple-stacks navigation on `/demos/[slug]`: chrome SiteHeader (non-sticky) → DemoSwitcher (sticky) → Hero. Three rows feels heavy but each has a distinct job (chrome nav / theme switching / page hero). The SiteHeader's `themed` variant uses theme tokens for color, so visually it blends with the page; the DemoSwitcher uses chrome tokens (paper bg, cobalt active) so it visually stands out from the themed body — this is intentional.
- `themed-home.tsx`'s import of `./footer` is unreferenced now but the file `src/components/home/footer.tsx` still exists. **Phase 5 deletes it** as part of the footer-link cleanup.



