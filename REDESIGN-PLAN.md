# APEX SITES — Redesign Plan

Plan-first artifact. Read before executing Phase 1. Updated as phases ship.

Cross-references: see `APEX-AUDIT.md` (current-state) and the redesign brief from
the human (the document beginning "APEX SITES — REDESIGN BRIEF & EXECUTION
PROMPT"). When the brief contradicts the audit, the audit is truth on what
exists; the brief is truth on what should exist.

---

## 1. Restated mission

Apex Sites is a productized website agency for trades. The codebase is in good
structural shape — Next.js 16 + React 19 + Tailwind v4 + Stripe + Supabase + Resend,
with a clean theme-as-data system underpinning 24 pre-designed home compositions
across 5 vibes × 5 hero patterns × 3 modes. Stripe checkout, the signature-verified
idempotent webhook, and the bearer-token onboarding flow all work today.

What's missing is **a brand and a finished marketing surface**. The current `/`
renders one of the 24 themes (Heritage Painters) as if Apex itself doesn't exist,
the chrome around the gallery is default shadcn neutral + emerald, the trust strip
publishes invented review counts, the footer points at four `href="#"` placeholders,
the JSON-LD references a `/logo.png` that 404s, and the brand mark is a `<div>`
with the letter A.

**My job is to give Apex its own face — a recognizable, daylight-bright, multi-hue
identity (true white + warm cream + cobalt action + sunshine highlight + coral and
mint seasoning) — and to wrap the gallery, pricing, contact, and commerce
surfaces in that face — without touching the 24 themes' internal compositions
or the Stripe/Supabase/Resend contracts. The iframe-mini-render gallery pattern
is brand-defining and stays; what changes is the chrome around it, the
mounting strategy, and the perf budget. I work phased: foundation → home →
non-themed pages → themed-surface chrome → missing pages → perf/a11y/SEO → launch
readiness.** Each phase ships behind a quality gate; I stop at every boundary
for human go-ahead.

The bar is plain: a first-time visitor knows what Apex sells, what it costs, and
how fast it ships before they scroll. Every link resolves. Every metric is true.
Performance and accessibility are wired in as I build, not retro-fitted at the end.

---

## 2. Phase 1 file diff

Phase 1 is **foundation only — no visual redesign yet**. Goal: clean the slate,
add the brand layer + token namespace, build the Apex chrome primitive set, and
keep every existing route rendering unchanged. Pages may still look like before
at the end of Phase 1; that's expected.

### Create

| Path | Why (one line) |
|---|---|
| `REDESIGN-PLAN.md` | This document. Living plan, kept current as phases ship. |
| `public/brand/apex-mark.svg` | Geometric A-mark master (24×24 grid), ink + cobalt counter detail. Single source of truth for every favicon/icon size. |
| `public/brand/apex-mark-mono.svg` | Single-color ink variant for tight contexts (e.g. small-size header without the cobalt detail). |
| `public/brand/apex-wordmark.svg` | "Apex Sites" wordmark in the chrome display face. Two-color variant (ink default, cobalt-on-hover handled in CSS). |
| `public/brand/logo.png` | 1024×1024 export of the mark (ink + cobalt). Replaces the 404 cited in `seo.ts:16`. |
| `public/favicon-16.png` | 16×16 favicon. The mark may simplify the cobalt counter to a single fill at this size. |
| `public/favicon-32.png` | 32×32 favicon. Full mark with cobalt counter. |
| `public/apple-touch-icon.png` | 180×180. Full-bleed mark on `--apx-paper` background. |
| `public/manifest.json` | PWA manifest — name "Apex Sites", short_name "Apex", theme_color #FFFFFF, background_color #FFFFFF, icons[192,512]. |
| `public/og-default.png` | 1200×630 OG fallback for the home + any route not covered by `/api/og/[slug]`. Apex-branded, sunshine underline beneath one keyword. |
| `scripts/export-brand-pngs.mjs` | One-shot reproducible PNG export from SVG masters. Uses `sharp` at the spec sizes (16/32/180/192/512/1024/1200×630). Auditable and re-runnable when the SVGs change. |
| `src/components/apex/index.ts` | Barrel export for chrome primitives. |
| `src/components/apex/container.tsx` | `<Container>` — 1200px max-width, px-6/px-10. |
| `src/components/apex/section.tsx` | `<Section bg?>` — vertical rhythm + bg variants `paper` / `canvas` / `tint` / `primary-soft`. No ink/inverted variant per brief §5.1. |
| `src/components/apex/eyebrow.tsx` | `<Eyebrow tone?>` — mono uppercase label, tones `mute` (default) / `cobalt` / `coral`. |
| `src/components/apex/display.tsx` | `<Display level>` — heading element with type-scale variant (`display-2xl/xl/lg/md`). |
| `src/components/apex/lede.tsx` | `<Lede>` — large opening paragraph under H1. |
| `src/components/apex/button.tsx` | `<Button variant size href? loading?>` — primary/secondary/ghost; renders `<Link>` when `href` provided, `<button>` otherwise. Cobalt focus ring, aria-disabled while loading, spinner. |
| `src/components/apex/text-field.tsx` | `<TextField>` — label + input + error + helper text. Wraps surviving shadcn `Input` + `Label`. RHF-friendly via `register`. Wires `aria-invalid` + `aria-describedby` (the audit flagged these missing). |
| `src/components/apex/card.tsx` | `<Card elevated?>` — paper bg, 1px line border, 12px radius. No drop shadow. Hover lift hook ready for Phase 2 motion. |
| `src/components/apex/stat.tsx` | `<Stat label value caption tone?>` — for the §5.6 truthful trust-strip rewrite (built but not wired into any page in Phase 1; Phase 2 swaps it into the home). |
| `src/components/apex/nav-link.tsx` | `<NavLink>` — header link with cobalt-underline active state. Computes active via `usePathname`. |
| `src/components/apex/logo.tsx` | `<Logo size>` — renders the SVG mark + wordmark, with `Apex Sites` link to `/`. |
| `src/components/apex/marks/highlight-stroke.tsx` | **Signature element 1.** Sunshine-yellow hand-drawn-feel SVG underline (path, slight wobble). Inline-block, positions under wrapped text. Foundation primitive — Phase 2 first uses it. |
| `src/components/apex/marks/hero-frame.tsx` | **Signature element 2.** Cobalt double-frame wrapper (2px outline offset 8px from content). Phase 2's hero preview + Phase 4's full-size demo iframe both use it. |
| `src/components/apex/price-tag.tsx` | **Signature element 3.** `<PriceTag value period?>` — JetBrains Mono numeric, thin coral underline, weight 600. Used on every price token across pricing/checkout/onboarding. |
| `src/components/apex/site-header.tsx` | Unified header. Variants `default` / `themed` / `minimal` per brief §6.1. **Built but not yet wired into pages** — Phase 2 swaps it into `/`, Phase 3 into `/pricing` / `/contact` / `/portfolio`, Phase 4 into themed pages + checkout/onboarding. |
| `src/components/apex/site-footer.tsx` | Unified footer. Same three variants. Same staged-wiring sequence as the header. |

### Modify

| Path | Change | Why |
|---|---|---|
| `src/app/globals.css` | Replace the unused-by-app OKLCH neutral block with Apex-aligned values **at the same shadcn token names** (`--background: #FFFFFF`, `--foreground: #111418`, `--primary: #2438FF`, `--muted`, `--muted-foreground`, `--input`, `--border`, `--ring`, `--destructive`, etc.) so surviving shadcn primitives (Accordion/Input/Label/Form) render in Apex colors. **Add** the full `--apx-*` namespace (paper, canvas, tint, ink, mute, soft, primary, primary-fg, primary-ink, primary-soft, highlight, highlight-ink, coral, coral-soft, mint, mint-soft, line, line-warm, success, warn, danger). Extend `@theme inline` to map every `--apx-*` to `--color-*` / `--font-*` so Tailwind v4 generates `bg-apx-paper`, `text-apx-ink`, `border-apx-line`, etc. utility classes. **Test for `.dark` rule pruning** — only remove if the surviving shadcn primitives compile clean without it; otherwise leave (out of scope for this phase). | Brand-token foundation (brief §5.1, §6.2). Namespace separation (`--apx-*` vs theme's `--apex-*`) prevents the chrome from being silently overridden inside themed wrappers (brief §6.2). |
| `src/app/layout.tsx` | Add chrome global font className combining Inter + JetBrains Mono variables. Add `<link rel="manifest">`, `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">` etc. for favicons, `<link rel="apple-touch-icon">`, `<meta name="theme-color" content="#FFFFFF">`. Move default OG `images: [{ url: "/og-default.png", ... }]` into root metadata so non-themed pages have a fallback (brief §11). | Wire fonts globally without regressing per-theme subsetting; surface real favicons + manifest; harden default OG (brief §3 "Per-theme font subsetting" + §11 "Twitter card"). |
| `src/lib/fonts.ts` | Update `baseFontClassName` to combine Inter + JetBrains Mono variables (currently only Inter). Adds JetBrains Mono globally so `font-mono` works on chrome pages. Per-theme `themeFontClassNames(theme)` is unchanged — still loads only the active theme's 3 fonts on themed surfaces. | Brief §5.2 wiring + §3 "After redesign, a /demos/[slug] page should load: Apex chrome fonts + 3 theme fonts + 0 extras." |
| `src/lib/seo.ts:16` | Verify the `/logo.png` reference now resolves (the new `public/logo.png` makes it real). No code change needed here in Phase 1 once the asset ships, but I'll note the file's line in the plan-update. | Brief §11. |
| `src/components/json-ld.tsx:13` | **Defer to Phase 6** per brief §11 ordering. Listed here only for visibility — no Phase 1 change. | — |
| `package.json` | Add `sharp` to `devDependencies` (only needed by `scripts/export-brand-pngs.mjs`). Add `pnpm-workspace.yaml` already lists `sharp` in `ignoredBuiltDependencies` so the install will skip prebuild scripts on Windows — fine for our use; we run sharp via tsx/node directly when exporting. | One-shot PNG export pipeline. Sharp is the smallest reproducible path; alternative (online vector tool) is not auditable. |
| `pnpm-lock.yaml` | Regenerated by `pnpm install` after `package.json` change. | — |

### Delete

| Path | Why |
|---|---|
| `public/file.svg` | CRA scaffold leftover. Brief §3 cleanup. |
| `public/globe.svg` | CRA scaffold leftover. |
| `public/next.svg` | CRA scaffold leftover. |
| `public/vercel.svg` | CRA scaffold leftover. |
| `public/window.svg` | CRA scaffold leftover. |
| `src/components/ui/badge.tsx` | Dead — never imported per audit §3. Brief §6.4. |
| `src/components/ui/card.tsx` | Dead — never imported. The chrome `<Card>` lives at `src/components/apex/card.tsx` instead. |
| `src/components/ui/dialog.tsx` | Dead — never imported. Internally uses shadcn `Button`, so deleting this unblocks deleting `button.tsx` next. |
| `src/components/ui/sheet.tsx` | Dead — never imported. Same Button-internal reference; deletion order matters. |
| `src/components/ui/separator.tsx` | Dead — never imported. |
| `src/components/ui/tabs.tsx` | Dead — never imported. |
| `src/components/ui/button.tsx` | Dead **after** `dialog.tsx` and `sheet.tsx` are deleted (those were its only importers per audit). Chrome `<Button>` lives at `src/components/apex/button.tsx`. |

### Keep (for now — re-evaluated in later phases)

- `src/components/ui/accordion.tsx` — used by `src/components/home/faq.tsx`. Still in use after Phase 1. May get replaced by an Apex `<Accordion>` in Phase 2 when the home FAQ is rebuilt; if not, stays.
- `src/components/ui/input.tsx`, `label.tsx`, `form.tsx` — wrapped by chrome `<TextField>`. Stay.
- `src/components/site-shell.tsx` — used by `/pricing` and `/contact` until Phase 3 swaps in `<SiteHeader variant="default">`. **Deleted in Phase 3**, not Phase 1.
- `src/components/home/footer.tsx` (themed) and `src/components/home/demo-switcher.tsx` — stay until Phase 4 rebuilds their visuals.
- `framer-motion` package — stays installed, unused in Phase 1. Wired in Phase 2 (motion budget per brief §8).
- The 24 `public/portfolio-demos/*.html` files — untouched in Phase 1. Optimized in Phase 3 via `scripts/optimize-portfolio-demos.mjs` (brief §6.5).
- All `src/lib/themes/*.ts` files — untouched. The `Theme` interface gets an optional `assetSlug` field added in Phase 4 per brief §7.2; not in Phase 1.

### Quality gate (Phase 1 acceptance)

All of these must pass before requesting human approval to begin Phase 2:

1. `pnpm typecheck` clean.
2. `pnpm lint` clean.
3. `pnpm build` succeeds — all 61 routes still build.
4. Manual smoke: visit `/`, `/pricing`, `/portfolio`, `/portfolio/heritage-painters`, `/demos/heritage-painters`, `/contact`, `/checkout?tier=subscription&demo=heritage-painters`, `/onboarding?session_id=test_invalid`. No console errors. **Pages may still look like before — that's expected at this gate.**
5. `/logo.png` returns a real PNG (no 404). `/favicon-32.png` and `/apple-touch-icon.png` return real PNGs.
6. Net-zero new warnings in DevTools console on any of the smoke pages vs. main.
7. Per-theme font count regression check: load `/demos/heritage-painters`, count Google Fonts requests in Network panel — should be Inter + Fraunces + JetBrains Mono = 3 unique font families (Inter is also the chrome body font; the chrome shouldn't double-load it).
8. Bundle size: `pnpm build` output for the home route's first-load JS is recorded in the plan update (target stays under 140KB gzip in Phase 6 — this is the baseline measurement).
9. The 7 `src/components/ui/*.tsx` files listed under Delete are gone. The 5 CRA SVGs are gone. `pnpm typecheck` confirms no broken imports.

When all 9 pass, I post a Phase 1 completion summary and wait for go on Phase 2.

---

## 3. Open questions

The brief's §2 resolves the audit's 15 questions cleanly. Three small clarifications before Phase 1:

### Q1. HighlightStroke / HeroFrame / PriceTag in Phase 1?

The brief lists Phase 1 chrome primitives in §12 as: *Button, TextField, Card, Container, Section, Eyebrow, Display, Lede, Stat, NavLink, Logo* (11 components). But §5.4 lists three additional signature primitives — `<HighlightStroke>`, `<HeroFrame>`, `<PriceTag>` — that Phase 2's home page uses heavily (§7.1 hero, §7.1 final CTA, §7.5 pricing, §7.4 portfolio detail, §7.8 onboarding success).

**Proposal**: include all three in Phase 1 since they're chrome primitives, they're foundational (Phase 2 doesn't build them, only uses them), and building them in Phase 1 is contained scope. If you'd rather they wait for Phase 2, say so and I'll move them.

### Q2. PNG export pipeline — sharp + script, or human export?

The brief asks for `public/logo.png`, `favicon-{16,32}.png`, `apple-touch-icon.png`, plus the OG fallback `og-default.png`. SVG masters I can ship directly. PNGs need rendering. Three options:

- **A. `sharp` devDep + `scripts/export-brand-pngs.mjs`** (proposed). Reproducible, auditable, re-runnable. Cost: ~30MB sharp install (devDep only), ~80 lines of script.
- **B. Human exports via Figma/Affinity/online tool.** No new deps, but the SVG → PNG transform isn't versioned or reproducible.
- **C. Use Next 16 `app/icon.tsx` / `app/apple-icon.tsx` build-time generators.** Brief specifies `public/brand/...` paths, so this would deviate from spec.

**Proposal**: A. Confirm before I commit to installing sharp.

### Q3. A-mark variant choice

Brief §4.1 lists three reference moves (stacked-rooflines / notched / rule-A) and says "pick whichever reads cleanest at 24px and on the OG image at 96px." I propose to **build all three as draft SVGs in `public/brand/_drafts/`** (not shipped, not referenced), produce a single comparison PNG at 16/24/96px, and have you pick one before the canonical `apex-mark.svg` is committed. Adds maybe an hour to Phase 1; eliminates the risk of locking in a mark that doesn't read at 16px.

If you'd rather I just pick one upfront and move, my pick is **(1) stacked-rooflines A** — the strata moment is a small but specific home-services tell (siding, shingles, layered work) that the other two don't carry, and the cobalt counter inside the lower roof line gives the mark a clear focal point at 24px+.

---

## 4. Risk register

Things that look different from the audit, things that might break a hard
constraint, or scope concerns I want to flag before code lands.

### R1. Globals.css `:root` shadcn tokens are NOT unused — they're load-bearing for the surviving shadcn primitives

The audit's §10 ("attack first") says "Default neutral OKLCH palette in `:root` — `globals.css:51-83`" and the brief §3 echoes this as "the neutral OKLCH palette in `globals.css:51-83` is unused — replace with Apex tokens." **The token *values* are unused by app code, but the token *names* (`--background, --foreground, --primary, --muted, --muted-foreground, --input, --border, --ring, --destructive`) are referenced by every surviving shadcn primitive** (Accordion, Input, Label, Form, plus the `border-input`, `bg-input/30`, `text-foreground`, `text-muted-foreground` utilities they generate via `@theme inline`).

If I literally delete the `:root` block as the audit suggests, the surviving shadcn primitives stop rendering correctly.

**Mitigation**: keep the shadcn token names, **remap their values to Apex equivalents** (e.g. `--background: #FFFFFF` instead of `oklch(1 0 0)` — same thing in this case; `--primary: #2438FF` instead of `oklch(0.205 0 0)`), and add the new `--apx-*` namespace alongside. Net effect: surviving shadcn primitives now render in Apex colors automatically; chrome components use the new `--apx-*` tokens.

Surfaced because the brief's "replace" wording could imply outright deletion. My implementation is "remap values, add namespace" — no broken primitives.

### R2. `.dark` rules pruning is conditional, not unconditional

Brief §3 (decisions): "Strip unused `.dark` rules from globals.css if doing so doesn't break shadcn primitives still in use." Auditing the surviving primitives confirms several reference `dark:` variants (Input has `dark:bg-input/30`, Accordion has none, Label has none, Form has none). After deleting badge/button/card/dialog/sheet/separator/tabs, the only remaining `dark:` references are in Input. **I will keep the `.dark` block in `:root` for Phase 1** to avoid any class-name dependency surprise, and re-evaluate stripping in Phase 6 once the full chrome is on the line and a clean grep can confirm zero `dark:` references in app code or surviving primitives.

### R3. Next 16 favicon convention vs. brief's `/public/brand/` specifier

Next.js 16 App Router auto-detects favicons placed in `src/app/` (existing `favicon.ico` is at `src/app/favicon.ico`, picked up automatically). The brief specifies `public/favicon-{16,32}.png`. If I follow the brief literally, I need explicit `<link rel="icon">` tags in `src/app/layout.tsx`, AND I should consider whether the existing `src/app/favicon.ico` should be replaced with a new Apex favicon or left alone.

**Mitigation**: follow the brief's path exactly (`public/favicon-{16,32}.png`), add explicit `<link>` tags in root layout, **and** replace `src/app/favicon.ico` with a new ico generated from the same SVG master (so `/favicon.ico` and `/favicon-32.png` show the same mark). Documented in `scripts/export-brand-pngs.mjs`.

### R4. `pnpm-workspace.yaml` lists `sharp` in `ignoredBuiltDependencies`

Pre-existing — `pnpm-workspace.yaml:1-3` lists `sharp` and `unrs-resolver` under `ignoredBuiltDependencies`. This was set up before sharp was used; it tells pnpm to skip sharp's prebuild scripts. If I add sharp as a devDep, pnpm install will succeed but **sharp's native binaries won't compile**, which means the export script will fail on first run.

**Mitigation**: in `package.json` postinstall or in the export script itself, run `pnpm rebuild sharp` once before invoking it. Or remove sharp from `ignoredBuiltDependencies`. **Proposed**: remove from the ignore list. The list exists from a prior instinct to skip native builds on Windows during CI installs; sharp is small enough that the build cost is negligible. Will note this change in the Phase 1 commit message.

### R5. Apex chrome font set duplication risk

Brief §3: "After redesign, a /demos/[slug] page should load: Apex chrome fonts + 3 theme fonts + 0 extras." Today the chrome global font is just Inter. If I add JetBrains Mono globally, then visit `/demos/heritage-painters` (theme uses Fraunces + Inter + JetBrains Mono), the page will load Inter + JetBrains Mono globally + Fraunces + Inter + JetBrains Mono per-theme = effective 3 unique families (Inter and JetBrains Mono dedupe), but the **`next/font` className** applied to the root html will be `font-inter font-jetbrains-mono`, and the theme wrapper adds `font-fraunces font-inter font-jetbrains-mono`. The CSS variables resolve correctly, but if Next emits separate `<link>` tags for each declaration site, we get duplicate font requests.

**Mitigation**: `next/font/google` is supposed to dedupe by font family across the same build. Verify in Phase 1 quality gate #7 (Network panel count). If dedup fails, switch to a single composite className that includes both chrome fonts and pass it to the root layout — and ensure `<ThemeProvider>` only adds the *theme-specific* fonts (Fraunces in the Heritage example), not the chrome ones it shares with root. Either way, this is a measure-and-verify task in the gate, not an ahead-of-time problem.

### R6. The audit's `pnpm-workspace.yaml` reading

Audit §1 says "Not a true monorepo." That's correct — the file declares `ignoredBuiltDependencies` only, no `packages:`. No risk; just confirming I read it the same way.

### R7. `framer-motion@^12.38.0` — declared but unused

Audit §1 + brief §3: confirmed installed at v12.38.0, no imports anywhere in `src/`. Phase 1 leaves it queued. Phase 2 wires it for the three motion patterns (fade-up / hover-lift / theme crossfade). If Phase 2 ends and motion lands cleanly, framer-motion stays. If for some reason we drop motion entirely, brief §15 launch-readiness says framer-motion must be either used or removed — I'd remove it. **No risk in Phase 1; flagging that the use-or-remove decision is implicit in Phase 2 outcome.**

### R8. Stripe `@stripe/stripe-js@^9.3.1` — declared, not imported

Cross-check: audit §1 says `@stripe/stripe-js` is "declared but never imported in `src/`." That's because the current checkout flow uses **server-side `stripe.checkout.sessions.create()` followed by `window.location.assign(session.url)`** — no client-side Stripe.js loaded. This is correct and per spec. **No action needed**; flagged so I don't accidentally "fix" it by importing the client SDK in a later phase.

### R9. The `Theme` interface change is Phase 4, not Phase 1

Brief §7.2 adds an optional `assetSlug?: string` field to the `Theme` type. **Phase 1 does not touch `src/lib/themes/types.ts`** per the brief's hard constraint "adding optional fields is allowed; renaming or removing required fields is not" — but since the field doesn't exist yet, no Phase 1 component depends on it. Phase 4 is when this lands. Flagging here so the type stays untouched in this phase even if I'm tempted while wiring chrome.

### R10. The 4 pages I touch in Phase 1 must keep rendering

Phase 1 modifies `src/app/layout.tsx` (root) + `src/app/globals.css` + `src/lib/fonts.ts`. Every page renders through these. If the token remap or font wiring breaks, every page breaks. **Mitigation**: gate #4 (manual smoke on 8 routes) is the safety net. If any page errors, I roll back the change before the phase ships.

### R11. The audit asserts certain claims about the codebase that I want to re-verify before Phase 2 touches them

Specifically the brief expects:
- Fake `(555) 123-XXXX` tel-link in `phone-first` hero — confirmed in audit §10 (`src/components/home/hero.tsx:221`). Phase 4 fix.
- `<html>` nested in `onboarding/page.tsx` Processing/FallbackShell states — confirmed in audit §9. Phase 4 fix (per brief §6.6 / §7.8).
- `/admin` link in webhook Slack payload — confirmed at `src/app/api/stripe/webhook/route.ts:159`. Phase 5 fix.
- `JsonLd` `</script>`-escaping XSS risk — Phase 6 hardening.

All match the audit. No reality-vs-audit drift detected so far.

### R12. Sitemap stability across phases

Brief §3: "The 28 URLs in `src/app/sitemap.ts` stay canonical. New pages (about, legal) are additive." Phase 1 doesn't touch the sitemap. Phase 5 adds `/about`, `/privacy`, `/terms`, `/refund-policy`. **No URL is renamed or removed in any phase.** Flagging so I check this in every phase's quality gate.

### R13. CI is not Phase 1 scope

Brief §12 places CI (GitHub Actions, Playwright smoke) in Phase 6. **Phase 1 doesn't add a workflow file.** I'll run the local quality gate manually for Phase 1's gate. Flagging because some redesign briefs implicitly expect CI-from-day-one; this one does not.

---

## 5. Sign-off requested

Phase 1 is foundation: Apex tokens added (without breaking surviving shadcn primitives), chrome primitive set built, brand assets shipped, dead code deleted, every existing route still renders unchanged. The visual redesign starts in Phase 2.

Three confirmations needed before I touch code:

- **Q1** (signature primitives): include `<HighlightStroke>`, `<HeroFrame>`, `<PriceTag>` in Phase 1 alongside the brief's listed 11 chrome primitives — or defer to Phase 2?
- **Q2** (PNG export): install `sharp` as a devDep + ship `scripts/export-brand-pngs.mjs` as the reproducible PNG-from-SVG pipeline?
- **Q3** (A-mark variant): build all three drafts and have you pick, or take my proposed pick (stacked-rooflines A) and move?

**Ready for human approval to begin Phase 1.**
