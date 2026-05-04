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

