# Conversion Sprint — Execution Plan

**Created:** 2026-07-30 · **Status:** ready to execute in a clean session
**Context:** the funnel is technically validated (BLOCKER 1 closed 2026-07-30) and unsold.
All traffic to date came from Payton's referral links. 40+ visitors → 2 reached `/checkout`
→ **0 purchases**.

Read `PROJECT-STATE.md` first for current status. This doc is the sprint spec only.

---

## The diagnosis

Four findings, ordered by estimated conversion impact. Findings 1 and 2 are grounded in
code and screenshots; finding 3 is a structural read; finding 4 is a measurement gap.

### F1 — The demos describe themselves instead of performing the illusion (CRITICAL)

`src/lib/seo-headlines.ts` `previewHeadline()` builds the H1 as:

> `{Business}: a {vibe adjective}, {hero descriptor} design for {audience}.`

Live examples, verified by screenshot against production:

- `/demos/ironside-plumbing` → _"Ironside Plumbing: a bold, industrial, form-led design for plumbers."_
- `/demos/heritage-painters` → _"Heritage Painters: a warm, premium, gallery-led design for painters and restorers."_

Sub-copy compounds it: _"Bold, industrial, urgency-first… Same Your Shopfront service
underneath — pick this style and we'll have your site live in 24 hours."_

A prospect arriving from a TikTok link expects to see **what their business's website would
look like**. They get a design-system catalog entry talking about serif choices. The demo is
the product; right now it never stops breaking character.

`/portfolio/[slug]` legitimately wants the descriptive headline for SEO. `/demos/[slug]` does
not. The split already exists — `isDemoPreview` in `themed-home.tsx` gates chrome differences.

### F2 — `/start` has no path to `/checkout` (CRITICAL)

Every CTA on `/start` (hero, mobile sticky, final) points at `START_CTA_HREF = "/portfolio"`.
There is no direct checkout link anywhere on the page. The path is:

`/start` → `/portfolio` → browse **30 themes** → open one → `/checkout` = 4 steps.

This was a deliberate fix (see the comment at `src/app/start/page.tsx:60`) — the CTA used to
hard-attach `demo=premium-trade`, mis-branding checkout for every non-plumber. The reasoning
was sound; the cure lengthened the funnel. Consistent with 40+ → 2 reaching checkout (~5%).

### F1b — 17 of 30 themes render gradient placeholders instead of photos (CRITICAL)

Every theme with `hero: "gallery"` renders its four hero tiles as **CSS gradients with a text
label**, not photography. Verified by screenshot on `angelos` (Margherita / Sicilian slice /
Fresh dough / Wood-fired) and `heritage-painters` (Interiors / Exteriors / Cabinetry /
Restoration).

That is **17 of 30 themes — 57% of the catalog** — including `heritage-painters`, the
`defaultThemeSlug`, and `angelos`, the new #1 demo:

`aurora-pressure-wash · cask-vine · angelos · still-point · brutalist · cinematic-dark ·
daylight-lounge · westwood-tree · crystalline-window-co · swiss-editorial · north-fork ·
heritage-painters · webgl-experimental · mara-lin · wildflower-stone · types ·
print-block-books`

The caption under the tiles admits it: _"This is a live preview. The actual gallery on your
site can pull from Instagram, your project CMS, or hand-picked photos."_ For a product whose
entire pitch is "here is what your site looks like," showing coloured rectangles is the single
most damaging thing on the page after F1.

Themes using `form-card` (8), `booking-card` (5), and `calculator` (2) are unaffected — which
is exactly why `ironside-plumbing` looks real and `angelos` does not.

### F3 — Demo chrome eats the first screen

`/demos/[slug]` stacks four bars before any content: theme switcher, colorway switcher,
breadcrumb, site header. On a 375px phone — where TikTok traffic lives — that is most of the
first viewport before the prospect sees anything resembling their business.

### F4 — Referral traffic is invisible before purchase

`referral_code` / `referral_source` are only written to `sites` on a completed sale. With zero
sales, all of Payton's traffic is unmeasurable server-side: no per-channel comparison
(TikTok vs IG vs FB), no drop-off point, and no fair basis for commission beyond closed sales.

PostHog Session Replay went live 2026-07-30 and records from now on, but does not know
`ref`/`src`.

### Not a defect — do not "fix"

Large blank mid-page regions in headless screenshots are `FadeUp` / IntersectionObserver
scroll-reveal never firing in a static capture. Screenshot after scroll, or the finding is
an artifact. Previously confirmed 2026-07-29 and again 2026-07-30.

---

## Workstreams

Five streams. **File ownership is non-overlapping by design** — that is what makes parallel
isolated worktrees safe. Do not let a stream edit a file it does not own.

### WS1 — Demo headlines become real business headlines (owns: headline layer)

**Owns:** `src/lib/seo-headlines.ts`, `src/components/home/hero.tsx`,
`src/components/home/themed-home.tsx`

Give every theme a real customer-facing headline + sub-headline, used when `isDemoPreview`
is true. Keep `previewHeadline()` exactly as-is for `/portfolio/[slug]` (SEO value is real).

Example target for `ironside-plumbing`: _"Burst pipe? We're there today."_ / _"24/7 emergency
plumbing across Dallas. Flat-rate quotes before we start."_

Headline text belongs in each theme's `content?: ThemeContentOverrides` (see
`src/lib/themes/types.ts`) so it travels with the theme, not the component.

**Verify:** screenshot 6 demos at 375 + 1440 _after scrolling_; no demo may mention design
vocabulary (serif, industrial, gallery-led, palette) above the fold.

### WS2 — Trade picker on `/start` (owns: the promo landing page)

**Owns:** `src/app/start/page.tsx`, plus one new component under `src/components/apex/start/`

Add a trade picker — 6–8 trades — each linking straight to
`/checkout?tier=subscription&promo=launch&demo=<that trade's slug>`. Cuts 4 steps to 2 while
preserving the anti-mis-branding fix (nobody lands on another trade's brand).

`~/leads/trade-demo-map.json` already holds a trade→theme mapping; reuse it, don't invent one.

**Out of scope:** pricing copy on this page — WS3 owns every price string.

**Verify:** from `/start`, two clicks reach a `cs_test_` session with the correct `demo` slug.

### WS3 — "$99 today" offer for the first 20 customers (owns: pricing + Stripe)

**Owns:** `src/lib/pricing-constants.ts`, `src/lib/stripe.ts`, `src/lib/checkout-schema.ts`,
`src/app/api/checkout/route.ts`, `scripts/create-stripe-products.ts`

Today's charge is currently **$198** ($99 setup + $99 first month billed together). The goal
is **$99 today, full stop**, for the first 20 customers.

**DECIDED by owner 2026-07-30: $99 total today, first month free.** Implement with
**`subscription_data.trial_period_days: 30`** on the promo path — the setup fee bills today,
the first recurring charge lands 30 days later. No coupon interaction, and it composes with
the existing `launch_promo_3mo` coupon so months 2–4 still run at $99 before reverting to $149.

Rejected alternative: a 100%-off-first-interval coupon. Stripe refuses `discounts` alongside
`allow_promotion_codes`, which the promo funnel already depends on.

Copy consequence: every surface currently saying "$198 today" or "$99 setup + $99/mo" must be
restated. The new offer is **"$99 today. First month free. Then $99/mo for 3 months, then
$149/mo."** Confirm the exact month-2 boundary against a real trial subscription before
writing the copy — do not infer it.

**The cap is the hard part.** "First 20" needs a real mechanism, not a promise:

- Count `sites` rows where `referral_code IS NOT NULL` or a dedicated `promo_cohort` column,
  checked server-side in `/api/checkout` before applying the offer.
- Decide explicitly what happens at 21: silently fall back to the current $198 promo, or hard
  stop. **This is a product decision — surface it, do not choose it unilaterally.**
- A client-side counter is not a cap. The check belongs in the route handler.

**Every user-visible price string routes through `pricing-constants.ts`.** Do not add a
literal. Note `$199` (copy add-on) is currently hardcoded in 4 places and should be folded in
while this stream owns the file.

**Verify:** a real test-mode purchase where the Stripe session's `amount_total` is exactly
`9900`, and the 21st checkout does not receive the offer.

### WS4 — Make referral traffic measurable (owns: analytics layer)

**Owns:** `src/components/posthog.tsx`, `src/lib/referral.ts`

Capture `ref` / `src` as PostHog person + event properties on first touch so each session
replay is attributable to a channel. Add funnel events at `/start` view, trade picked,
checkout view, checkout submit.

Also fix the P2 noted in PROJECT-STATE: `writeCookie()` at `src/lib/referral.ts:40` omits
`Secure`.

**Verify:** load `/start?ref=payton&src=tiktok` in a real browser, confirm a PostHog capture
carrying both properties. CSP is a live tripwire here — verify in a browser console, never
infer from the header.

### WS5 — Three standout demos (owns: chosen theme configs + their assets)

**Owns:** exactly three theme config files under `src/lib/themes/` and their
`public/themes/<slug>/` assets. **Must not** touch shared components — WS1 owns those.

**Owner-selected 2026-07-30, in priority order:**

1. **`angelos`** — the owner's #1. Confirmed the best typography in the catalog on inspection:
   Playfair Display editorial serif, parchment/tomato/olive/mustard, newspaper-banner hero,
   full-bleed pizza photography, an "OPEN UNTIL 11PM TONIGHT" badge, and an Est./Hand-/Open/
   Dine-in trust strip. **Blocked by F1b** — its four hero tiles are gradient placeholders.
   Real food photography is the single highest-value asset purchase in this sprint.
2. **`ironside-plumbing`** — the strongest as-shipped. `form-card` hero, so it is unaffected by
   F1b: real photo, working quote form, genuine urgency. Needs only WS1's headline.
3. **`voltcraft-electric`** or **`summit-roofing`** — high-ticket trades, well represented in
   the 103-lead list. Prefer whichever is not a `gallery` hero.

`heritage-painters` was the earlier suggestion and is **demoted** — it is `gallery`-hero, so
it shows placeholders, and it is also `defaultThemeSlug`, meaning the placeholder problem is
what an unparameterised visitor sees first. Fixing it is F1b work, not WS5 work.

**Flagged for the owner, once, not to be re-litigated:** `angelos` is a pizza restaurant, while
the ICP and the entire 103-business lead list are Phoenix-metro _trades_. Leading with a
restaurant optimises for Payton's consumer-broad social audience rather than the businesses
about to be pitched. That may well be the right call for shareable TikTok content — it is the
owner's decision and this plan follows it. Just do not let `angelos` displace a trade demo in
the _outreach_ materials.

"Standout" means a prospect would believe it is a real company's live site. Apply the
`frontend-design-quality` skill; screenshot at 375 + 1440 after scroll and critique before
claiming done.

Making `angelos` #1 also requires adding it to `featuredThemeSlugs` in `src/lib/themes/index.ts`
— it is currently not featured. That file is shared; coordinate with WS1 rather than both
editing it.

---

## Sequencing

WS1, WS4, WS5 are independent — run in parallel worktrees.

WS2 and WS3 **both surface on `/start`**. WS3 owns price strings; WS2 owns layout. Run in
parallel but merge **WS3 first**, then rebase WS2, because a changed offer changes what the
picker's buttons say.

Merge order: **WS3 → WS2 → WS1 → WS5 → WS4**

## Gates — non-negotiable

1. Every stream: `pnpm typecheck` and `pnpm build` pass, output shown.
2. Every UI stream: screenshots at **375 and 1440**, taken _after scroll_, read and critiqued.
3. **Fresh-context reviewer** on each branch before it reaches Parker. WS3 additionally needs
   a security/payments review — it touches money.
4. WS3 needs a **real test-mode purchase** proving `amount_total == 9900`.
5. No direct commits to `master`. Branch → PR → Parker merges. Every merge deploys to
   production.

## Known environment traps

- **The formatter hook reflows whole files.** A PostToolUse hook runs `npx prettier --write`
  and adds semicolons to a semicolon-free repo — a 1-line change came back as 150 insertions
  on 2026-07-30. After any Edit, run `git diff --stat`; if the count exceeds your change,
  `git checkout --` the file and re-apply via Bash (the hook does not fire on Bash writes).
- **`pkill -f` is dangerous here** — this box runs ~79 repos and broad patterns match the
  agent's own shell. Kill by recorded PID or exact process name.
- **No Supabase migration ledger.** `supabase migration list` reports nothing and nothing
  prevents a double-apply. `0001`–`0004` are non-idempotent. If a stream needs a migration,
  it writes the SQL into its report as a recommendation — owner-run only.
- **Stripe account is shared with axon-growth.** Filter on `metadata.site_id` before drawing
  any conclusion from Stripe data; only 26 of 102 lifetime sessions belong to this product.
- Vercel env vars: all five trailing-newline defects were fixed 2026-07-30 across all three
  environments. Re-added vars are **Sensitive** and read back blank from `vercel env pull` —
  verify `NEXT_PUBLIC_*` by grepping the deployed bundle instead.
