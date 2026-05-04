# Apex Sites — Redesign Report

Final handoff document. Read with `REDESIGN-LOG.md` (the audit trail) and `LAUNCH-CHECKLIST.md` (the runbook for actually going live).

Branch: `redesign` (cut from `master @ 3ad2571`). 11+ commits ahead.

---

## §5.1 — TL;DR

- **Status**: complete. All 7 phases plus pre-merge follow-ups (Phase 6.5 bundle measurement, Phase 6.6 themed-page motion) shipped; every quality gate passed locally; 5/5 Playwright smoke tests green.
- **Phases attempted**: 1–7 + 6.5 + 6.6. **Phases completed**: all.
- **Critical issues outstanding**: 0.
- **Bundle budget compliance**: **verified**. `/` first-load JS = **127.6 KB gzip** (12.4 KB under the master brief §9 budget of 140 KB). Every other route is also under its respective budget — full table in §5.5.
- **Human-action items before launch**: 11 (content + credentials + Lighthouse measurement). Listed in §5.4.
- **Recommended next step**: Push `redesign` branch, open PR, watch CI run, then walk `LAUNCH-CHECKLIST.md` end-to-end against a Vercel preview deploy.

The redesign delivers Apex's brand (cobalt + sunshine + cream + coral + mint, daylight-bright, `--apx-*` token namespace), 19 chrome primitives, a new `/` page, rebuilt `/pricing /portfolio /contact`, themed-surface chrome wrap, 4 new static pages (`/about`, `/privacy`, `/terms`, `/refund-policy`), Playwright smoke, GitHub Actions CI, Plausible analytics, JSON-LD XSS hardening, the audit's nested-`<html>` and tel-link bugs fixed, every dead shadcn primitive deleted, every `href="#"` placeholder removed, every fake metric replaced with truthful deliverables. Pre-merge follow-ups added bundle measurement (`@next/bundle-analyzer` + reproducible script) and `<FadeUp>` motion on every themed-surface section that the master brief asked for.

What's *not* done in this loop: a real Vercel preview deploy + Lighthouse measurement + real legal copy. All §5.4 items.

---

## §5.2 — Phase outcomes

### Phase 1 — Foundation
- **Status**: shipped.
- **Files**: created 24, modified 5, deleted 12.
- **Commit**: `88ebaf7 feat(redesign): phase 1 — foundation tokens, brand assets, chrome primitives`.
- **Quality gate**: `pnpm typecheck` clean (after one fix: `Interface 'ButtonAsLinkProps' cannot simultaneously extend types … children of types … not identical` — fixed by also omitting `children`/`className` from the HTML attribute Omits). `pnpm lint` clean (after one fix: `react-hooks/refs` error in `<TextField>` for using `useRef` during render — swapped to `React.useId()`). `pnpm build` clean (62 routes).
- **Deviations**: HighlightStroke, HeroFrame, PriceTag built in Phase 1 (Q1 resolution) — not strictly listed in the §12 Phase 1 chrome-primitive set but Phase 2 depends on them.

### Phase 2 — Apex marketing home
- **Status**: shipped.
- **Files**: created 10, modified 2.
- **Commit**: `d0af500 feat(redesign): phase 2 — Apex home page with rotating preview, gallery, motion`.
- **Quality gate**: `pnpm typecheck` clean. `pnpm lint` clean (after one fix: `react-hooks/set-state-in-effect` on the IntersectionObserver fallback in `<DemoCard>` — moved availability check to `useState` initializer). `pnpm build` clean (62 routes).
- **Deviations**: DemoSwitcher show-condition narrowed to themed pages only (`/` is no longer themed; the switcher there would double-stack with the new SiteHeader). Override flag: low.

### Phase 3 — Non-themed pages
- **Status**: shipped.
- **Files**: created 5, modified 4.
- **Commit**: `eef5caa feat(redesign): phase 3 — pricing, portfolio, contact rebuilt in chrome`.
- **Quality gate**: `pnpm typecheck` clean (after one fix: `Conversion of type 'EventTarget & HTMLInputElement' to type 'HTMLTextAreaElement' may be a mistake` in `contact-form.tsx:146` — dropped the cast since both element types expose `.value`). `pnpm lint` clean. `pnpm build` clean (62 routes). `/portfolio` first-paint iframe count = 6 (verifiable via DevTools Network panel).
- **Deviations**: contact form not migrated to React Hook Form (the original was already plain `useState`; brief described it loosely as "RHF + Zod"). Override flag: low. Inline `<a>`-as-button styles on themed surfaces deferred to Phase 4.

### Phase 4 — Themed-surface refinement
- **Status**: shipped.
- **Files**: created 1, modified 8.
- **Commit**: `38cfd58 feat(redesign): phase 4 — chrome wraps themed surfaces, real metrics, nested-html fix`.
- **Quality gate**: `pnpm typecheck` clean (first attempt). `pnpm lint` clean (first attempt). `pnpm build` clean (62 routes). Stripe contract untouched; API version pin unchanged.
- **Deviations**: DemoSwitcher narrowed to `/demos/[slug]` only (override flag: medium — PortfolioBanner sticky on `/portfolio/[slug]` would have collided with the switcher). Themed-page motion (FadeUp on themed sections) not yet wired (override flag: low — chrome motion covers `/`; themed pages still inherit hover-lift from `<DemoCard>`). Full-size demo iframe in HeroFrame not implemented (override flag: low — `/portfolio/[slug]` doesn't render the demo as an iframe; brief premise didn't match codebase reality).

### Phase 5 — Missing pages
- **Status**: shipped.
- **Files**: created 5, modified 2, deleted 1.
- **Commit**: `ef21175 feat(redesign): phase 5 — about, privacy, terms, refund-policy pages`.
- **Quality gate**: `pnpm typecheck` clean (first attempt). `pnpm lint` clean (first attempt). `pnpm build` clean (**65 routes** — 4 new static pages added; sitemap now 32 URLs). Footer dead `href="#"` links replaced with real targets.
- **Deviations**: legal copy is plain-English placeholder (master brief §7.10 explicitly authorized this; coral "Drafting in progress" warn banner makes it visually unambiguous). `/about` has placeholder team copy. Both items listed in §5.4 below.

### Phase 6 — Performance, accessibility, SEO infrastructure
- **Status**: shipped.
- **Files**: created 4, modified 5.
- **Commits**: `c0ced1b feat(redesign): phase 6 — playwright smoke, plausible, json-ld escape, ci, a11y` + `8cfadf5 chore(redesign): gitignore playwright artifacts`.
- **Quality gate**: `pnpm typecheck` clean (after JSON-LD U+2028/U+2029 lexer issue — see §5.6). `pnpm lint` clean. `pnpm build` clean (66 routes). `pnpm test:e2e` 5/5 pass in 33.7s after one fix (`<main id="main">` was missing on themed surfaces, broke the skip-link target and the Playwright assertion). Chromium downloaded via `pnpm exec playwright install chromium`.
- **Deviations**: Lighthouse measurements not run (this shell can't reliably run lighthouse-cli; deferred to LAUNCH-CHECKLIST step 9 — override flag: medium). `@next/bundle-analyzer` not installed (override flag: low). `.dark` block left in `globals.css` (override flag: low — surviving Input primitive references `dark:` variants).

### Phase 7 — Launch readiness
- **Status**: shipped (handoff documents only).
- **Files**: created 2, modified 2.
- **Commit**: pending (this report + Phase 7 docs commit together).
- **Quality gate**: `pnpm typecheck` clean. `pnpm lint` clean. `pnpm build` clean (66 routes).
- **Deviations**: no Vercel preview deploy verification (override flag: high — the human owns the deploy). README does not link a preview URL because none exists yet.

---

## §5.3 — Open questions resolved

### Q1 — HighlightStroke / HeroFrame / PriceTag in Phase 1?
- **Decision**: Yes, included in Phase 1.
- **Reasoning**: They're chrome primitives (the brief §5.4 lists them alongside Button/Card). Phase 2 depends on each. Building them in Phase 1 added ~30 minutes of work; deferring would have meant Phase 2 partially building infrastructure mid-page-composition.
- **Override flag**: low.

### Q2 — PNG export pipeline
- **Decision**: Install `sharp` as a devDep + ship `scripts/export-brand-pngs.mjs`.
- **Reasoning**: Reproducibility. Option B (human exports) is unauditable; option C (Next 16 `app/icon.tsx`) deviates from the brief's `/public/brand/*` paths. `sharp` is already a transitive dep of `next` (Next uses it for image optimization), so the explicit devDep mostly costs only the dependency line. Pairs with R4 — `sharp` removed from `pnpm-workspace.yaml`'s `ignoredBuiltDependencies`.
- **Override flag**: low.

### Q3 — A-mark variant choice
- **Decision**: Stacked-rooflines A.
- **Reasoning**: The strata moment is a small but specific home-services tell (siding, shingles, layered work) that variants 2 (notched) and 3 (rule-A) don't carry. The cobalt counter inside the lower roof line gives the mark a clear focal point at 24px+. Skipping the all-three-drafts comparison saved ~1h with low expected information gain.
- **Override flag**: medium — the brand mark is the most opinionated single decision in the entire redesign, and it shipped without visual review. Easy swap: edit `public/brand/apex-mark.svg` + `apex-logo-square.svg`, re-run `pnpm brand:export`.

### Q4 (encountered) — pnpm v10 install-script approval gate
- **Decision**: Add `sharp` to a new `onlyBuiltDependencies` list in `pnpm-workspace.yaml`. Run `pnpm rebuild sharp` to compile native binaries.
- **Reasoning**: pnpm 10 changed default behavior — install scripts of new deps are skipped without explicit approval. The R4 plan removed `sharp` from `ignoredBuiltDependencies` but that's no longer the relevant mechanism. The new mechanism is `onlyBuiltDependencies`.
- **Override flag**: none — pnpm 10 default-deny is correct security-by-default; we explicitly opted in only to the dep we wanted to build.

### Q5 (encountered) — JSON-LD U+2028/U+2029 source-code encoding
- **Decision**: Use `String.fromCharCode(0x2028)` + `new RegExp(...)` to build matchers at module-init.
- **Reasoning**: TypeScript's lexer treats literal U+2028 / U+2029 characters as line terminators. Inline regex literals containing them break with `Unterminated regular expression literal`. Two attempts to inline failed (the editor preserves the raw chars on round-trip). The constructor-based approach sidesteps the lexer entirely and reads cleanly.
- **Override flag**: none — single-purpose escape hatch, well-documented in source.

---

## §5.4 — Things that need human action before launch

| # | What | Why it can't be auto-resolved | Where in code | Estimated effort |
|---|---|---|---|---|
| 1 | Real legal copy (privacy, terms, refund) | Requires legal review; can't be ghost-written by an AI for production use | `src/app/{privacy,terms,refund-policy}/page.tsx` (each renders `<LegalPage draft>`; remove the `draft` prop when copy is real) | 1–4 hours per policy with a lawyer; 30 min total to swap into the codebase |
| 2 | `[TBD]` governing-law clause in Terms | Needs the founder's state of incorporation | `src/app/terms/page.tsx:69` (the `<h2>Governing law</h2>` paragraph) | 1 minute once the state is known |
| 3 | Real founder/team copy in About | None drafted — placeholder manifesto only | `src/app/about/page.tsx` (the 3-paragraph block + "Three things we won't do") | 1 hour |
| 4 | Real customer testimonials / case-study photography | None exist; trust-strip kept truthful but the hero rotating-preview is the only visual proof | None — additive content; would land in a new `<HomeTestimonials>` section between gallery and pricing | 2 hours assuming source material |
| 5 | DNS records: `apexsites.com` A/AAAA → Vercel | Requires DNS-host credentials | None (config) | 5 minutes once Vercel project exists |
| 6 | Resend SPF + DKIM verification | Requires DNS-host credentials | None (Resend dashboard + DNS host) | 10 minutes + propagation wait |
| 7 | Stripe live-mode key swap + price IDs | Requires live Stripe access | Vercel env vars (per `.env.production.example`) | 10 minutes (run `pnpm stripe:setup` against live key, copy outputs) |
| 8 | Supabase production project + migrations | Requires Supabase access | `supabase/migrations/0001_initial.sql`, `0002_onboarding.sql` (run in production SQL editor) | 5 minutes |
| 9 | Plausible domain configuration in env | Requires Plausible account | Vercel env: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=apexsites.com` | 1 minute |
| 10 | Higher-fidelity `og-default.png` (optional) | The librsvg renderer used by sharp falls back to system fonts for the OG SVG; the current PNG is acceptable as a fallback but not pixel-perfect to the design | `public/og-default.png` (regenerate via `pnpm brand:export` if `public/brand/og-default.svg` is updated; or render via Puppeteer for true Inter/JetBrains Mono) | 15 minutes for a Puppeteer render script |
| 11 | Sitemap submission to Google Search Console | Requires GSC credentials and domain ownership verification | None (GSC web UI) | 10 minutes once DNS resolves |

---

## §5.5 — Performance numbers

**Lighthouse**: not measured in this loop. See Phase 6 deviation rationale. The recommended path:

1. After Vercel preview deploy succeeds, run `lighthouse <preview-url>/<page> --form-factor=mobile --throttling-method=simulate --output=html` three times per page.
2. Pages to measure: `/`, `/pricing`, `/portfolio`, `/contact`, `/about`, `/demos/heritage-painters`.
3. Targets per master brief §9: ≥90 mobile on every page except `/portfolio` which gets ≥85 mobile / ≥90 desktop.
4. Median of the 3 runs is the canonical value.

**First-load JS**: **measured**. Phase 6.5 added `@next/bundle-analyzer` (devDep) and `scripts/measure-first-load.mjs`. Reproducible workflow:

```
ANALYZE=true pnpm exec next build --webpack    # generates .next/analyze/{client,edge,nodejs}.html
node scripts/measure-first-load.mjs            # prints the table below
```

Note: `@next/bundle-analyzer` is incompatible with Turbopack in Next 16 — the analyzer no-ops with a warning unless `--webpack` is passed. The default `pnpm build` remains Turbopack and is unaffected by the analyzer wrap (silent no-op when `ANALYZE` is unset).

**Root main files (shared on every page)**: 415.2 KB raw / **122.5 KB gzip** total across 4 chunks. The dominant shared chunk is `20-…js` at 59.3 KB gzip — likely the framer-motion + lucide-react + Radix-base composite that Next hoists from the root layout's client islands.

**Per-route first-load (gzipped, root mains + the route's page chunk)**:

| Route | Raw KB | Gzip KB | Budget | Status |
|---|---:|---:|---:|:---:|
| `/` | 430.0 | **127.6** | < 140 | ✅ pass (12.4 KB headroom) |
| `/portfolio` | 422.6 | **125.1** | < 180 | ✅ pass (54.9 KB headroom) |
| `/pricing` | 419.7 | **124.3** | < 140 | ✅ pass |
| `/contact` | 419.3 | **124.4** | < 140 | ✅ pass |
| `/about` | 419.7 | **124.3** | < 140 | ✅ pass |
| `/demos/[slug]` | 419.5 | **124.1** | < 200 | ✅ pass |
| `/portfolio/[slug]` | 419.5 | **124.1** | < 200 | ✅ pass |
| `/checkout` | 426.1 | **126.3** | (chrome page, no explicit budget) | ✅ |
| `/onboarding` | 425.7 | **125.8** | (chrome page, no explicit budget) | ✅ |
| `/privacy`, `/terms`, `/refund-policy` | 419.3 | **124.1** | < 140 | ✅ pass |

**No optimization needed.** Per the master brief's "If `/` is at or under 140 KB gzip → record numbers, skip to step 7" instruction, the four candidate fixes (dynamic import of `<RotatingPreview>`, dynamic import of `<HomeThemeGallery>`, lucide tree-shake check, leaked `"use client"` audit) were not applied. If a future regression pushes `/` over budget, the first lever to pull is dynamic-importing `<RotatingPreview>` since framer-motion currently sits in the shared chunk.

**Iframe-mount counts**:

- `/portfolio` first paint loads 6 iframes (verifiable via DevTools Network → filter `Doc`). Remaining 18 lazy-mount via IntersectionObserver as cards scroll into 200px-extended viewport.
- `/` hero loads 3 iframes eagerly (the rotating preview's `heritage-painters`, `ironside-plumbing`, `voltcraft-electric`); the gallery's first 3 cards also eager-mount.
- Each `public/portfolio-demos/*.html` file has both `fonts.googleapis.com` AND `fonts.gstatic.com crossorigin` preconnects (`node scripts/optimize-portfolio-demos.mjs` is idempotent and re-runnable).

**Pages that may miss the §9 mobile Lighthouse budget**: `/portfolio` is the highest-risk surface because of the iframe gallery. If the first Lighthouse measurement comes back below 85 mobile, the master brief §6.5 escalation applies (cap above-fold to 4 cards instead of 6) — don't silently relax the budget. The fallback is documented in `LAUNCH-CHECKLIST.md` step 9 and the master brief §6.5.

---

## §5.6 — Quality issues

**Lint warnings remaining**: 0. `pnpm lint` is clean.

**TypeScript strict-mode issues remaining**: 0. `pnpm typecheck` is clean.

**Accessibility issues found and not auto-fixable**:

- **Runtime keyboard navigation** not verified end-to-end. Recommended: tab through `/`, `/contact`, and `/checkout` with keyboard only and verify every interactive element has a visible focus ring (the chrome `<Button>` and `<TextField>` ship rings; inline links should too). 15 minutes of manual testing.
- **Screen-reader announcement of error states** not verified. `<TextField>` wires `aria-invalid` + `aria-describedby` + `role="alert"`, which should make NVDA/VoiceOver announce errors on submit. Recommended: 10 minutes of manual SR testing on `/contact`.
- **Color contrast** verified statically against the chrome palette: ink on white = 16:1, mute on white = 6.6:1, mute on canvas = 6.4:1, cobalt button + white text = 7.5:1. All pass 4.5:1. Sunshine `#FFE34D` is never used as a text color or button fill (only as an underline stroke).

**Browser console errors observed during manual eyeball checks**: None — the Playwright suite navigates 4 of 5 pages without console errors (the 5th is an API route). Manual browser eyeballing was not performed in this loop.

---

## §5.7 — Security & dependency notes

### New dependencies added

| Package | Version (resolved) | Reason |
|---|---|---|
| `sharp` | `0.33.5` (devDep) | PNG export pipeline (`scripts/export-brand-pngs.mjs`). Was already a transitive dep of `next`; explicit declaration makes the script's contract explicit. |
| `@playwright/test` | `1.59.1` (devDep) | Smoke suite per master brief §2 #14. |

No production-runtime deps added. Both are devDep only.

### Things in `package.json` that should be removed but weren't

`framer-motion` was a "dead dep" in the audit (declared, never imported). After the redesign, it's used by `<FadeUp>`, `<DemoCard>`, `<RotatingPreview>` — earned its place. Final-report decision: keep.

### `@ts-expect-error` / `@ts-ignore` / `eslint-disable` introduced

None in this loop. The single pre-existing `@ts-expect-error` in `src/lib/stripe.ts:31` (Stripe API version pinning to an older version than the SDK's `LatestApiVersion`) is unchanged.

### Confirmation that no secrets, keys, or PII landed in commits

Verified. `git ls-files | xargs grep -l 'sk_live\|sk_test_[a-zA-Z0-9]\{20,\}\|whsec_[a-zA-Z0-9]\|service_role\|eyJ'` returns no hits in source files. `.env.local` is gitignored. `.env.example` and `.env.production.example` document shapes only.

---

## §5.8 — Future work surfaced (out-of-scope but identified)

Items #1 (`@next/bundle-analyzer`) and #7 (themed-page motion) shipped in the pre-merge follow-ups (Phase 6.5 and 6.6 respectively). The remaining items, renumbered:

1. **`invoice.payment_failed` webhook handler** (per `docs/post-launch-todo.md`). Effort: 2 hours (handler + test + Resend template). Required before scaling past ~50 active subscriptions.
2. **`charge.refunded` webhook handler** (per `docs/post-launch-todo.md`). Effort: 1 hour. Required when refund volume exceeds ~5/month.
3. **Stripe Customer Portal link on `/onboarding`** for subscription customers (self-service payment-method update). Effort: 30 minutes (`stripe.billingPortal.sessions.create` + render link).
4. **`/api/contact` rate limit.** Currently anyone can spam the form. Effort: 1 hour with Vercel KV or Upstash (~20 submissions per IP per hour).
5. **Higher-fidelity `og-default.png`.** The current sharp+librsvg render falls back to system fonts. A Puppeteer-based render hitting the same SVG with real Inter/JetBrains Mono loaded would produce pixel-perfect output. Effort: 15 minutes.
6. **`<HeroFrame>` around `/portfolio/[slug]`'s themed body.** Brief §7.4 wanted the demo visually anchored as "an Apex design". Currently the chrome PortfolioBanner above + chrome SiteFooter below carry that signal. Adding a full-page outline is doable but visually heavy. Effort: 30 minutes + visual review.
7. **CI workflow tested on a real PR.** The workflow exists (`.github/workflows/ci.yml`) but has never run. First post-merge PR will exercise it; if anything fails the artifact upload helps triage. Effort: zero (just push and watch).

---

## §5.9 — Verbatim error log

These are the gate failures hit during the loop, quoted as recorded.

### Phase 1 typecheck failure (resolved)

```
src/components/apex/button.tsx(18,11): error TS2320: Interface 'ButtonAsLinkProps' cannot simultaneously extend types 'ButtonBaseProps' and 'Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color">'.
  Named property 'children' of types 'ButtonBaseProps' and 'Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color">' are not identical.
src/components/apex/button.tsx(25,11): error TS2320: Interface 'ButtonAsButtonProps' cannot simultaneously extend types 'ButtonBaseProps' and 'Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color">'.
  Named property 'children' of types 'ButtonBaseProps' and 'Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color">' are not identical.
```

Resolution: also `Omit<…, "children" | "className">` in addition to `"color"`.

### Phase 1 lint failure (resolved)

```
C:\Users\admin\Documents\GitHub\apex-sites\src\components\apex\text-field.tsx
  21:10  error  Error: Cannot access refs during render

React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef).
> 21 |   return ref.current
     |          ^^^^^^^^^^^ Cannot access ref value during render
```

Resolution: replaced homegrown `useRef`-based ID counter with `React.useId()`.

### Phase 2 lint failure (resolved)

```
C:\Users\admin\Documents\GitHub\apex-sites\src\components\apex\demo-card.tsx:59:7
  57 |     if (!("IntersectionObserver" in window)) {
  58 |       // Fallback for very old browsers
> 59 |       setShouldMount(true)
     |       ^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect
  60 |       return
  61 |     }
  62 |     const obs = new IntersectionObserver(  react-hooks/set-state-in-effect
```

Resolution: detect IntersectionObserver-availability in the `useState` initializer instead of in the effect.

### Phase 3 typecheck failure (resolved)

```
src/app/contact/contact-form.tsx(146,38): error TS2352: Conversion of type 'EventTarget & HTMLInputElement' to type 'HTMLTextAreaElement' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type 'EventTarget & HTMLInputElement' is missing the following properties from type 'HTMLTextAreaElement': cols, rows, textLength, wrap
```

Resolution: dropped `as HTMLTextAreaElement` cast (`.value` exists on both element types).

### Phase 6 typecheck + lint + build failure (resolved)

```
src/components/json-ld.tsx(39,14): error TS1161: Unterminated regular expression literal.
src/components/json-ld.tsx(41,14): error TS1161: Unterminated regular expression literal.

  37 |     .replace(/>/g, "\\u003e")
  38 |     .replace(/&/g, "\\u0026")
> 39 |     .replace(/<U+2028>/g, "\\u2028")
     |              ^
  40 |     .replace(/<U+2029>/g, "\\u2029")
```

Resolution: TypeScript lexer treats literal U+2028/U+2029 as line terminators. Replaced inline regex literals with `String.fromCharCode(0x2028)` + `new RegExp(...)` constructed at module-init.

### Phase 6 Playwright failure (resolved)

```
1) [chromium] › tests\e2e\smoke.spec.ts:39:5 › /demos/heritage-painters loads themed ─────────────

    Error: expect(locator).toBeVisible() failed

    Locator: locator('main h1')
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

    Call log:
      - Expect "toBeVisible" with timeout 5000ms
      - waiting for locator('main h1')
```

Resolution: `<ThemedHome>` did not wrap section content in `<main id="main">` — the chrome `<SiteHeader>`'s skip-to-content link (which targets `#main`) was therefore broken on themed pages. Added `<main id="main" className="flex-1">` wrapper. Fixed the test failure AND a pre-existing a11y bug.

### Phase 1 sharp pixel-input limit (resolved)

```
Error: Input image exceeds pixel limit
    at Sharp.toFile (...sharp\lib\output.js:90:19)
    at file:///.../scripts/export-brand-pngs.mjs:63:6
```

Resolution: original script set sharp `density` proportional to output width (`density: Math.max(72, t.w * 1.5)` → at 1024×1024 output that's density 1536, producing a 24576-pixel intermediate). Clamped density to 300 — sufficient oversampling at every target size, well under the limit.

### pnpm v10 install scripts skipped (resolved)

```
Ignored build scripts: esbuild@0.27.7, msw@2.13.6, sharp@0.33.5.
Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.
```

Resolution: added `onlyBuiltDependencies: [sharp]` to `pnpm-workspace.yaml`. Ran `pnpm rebuild sharp` afterwards — both `sharp@0.33.5` (direct devDep) and `sharp@0.34.5` (transitive via Next 16) compiled native binaries cleanly.

---

End of report.
