# Project State — Your Shopfront

**Last updated:** 2026-07-29 (MST)
**Live:** https://yourshopfront.com · **Repo:** axsystems/yourshopfront · **Branch:** `master`
**Vercel project:** `yourshopfront` (axsystems-projects) · **Supabase ref:** `vszlrvczfpgwdenmsfvx`
(verified 2026-07-29 via `supabase projects list` — project `your-shop-front`, ACTIVE_HEALTHY, us-east-2)

Sister docs — do not duplicate these, update them:
`CLAUDE.md` (cold-start hub + hard rules) · `LAUNCH-CHECKLIST.md` (go-live gate) ·
`README.md` (architecture) · `docs/marketing-launch-playbook.md` (day-1 sales) ·
`docs/post-launch-todo.md` (deferred work) · `docs/history/` (archived records).

---

## Status table

| Area              | State          | Evidence (2026-07-29)                                                                                                                 |
| ----------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Marketing site    | **LIVE**       | `/`, `/pricing`, `/start`, `/portfolio` all HTTP 200                                                                                  |
| Demos             | **LIVE**       | all 15 trade demo slugs HTTP 200; 30 registered themes                                                                                |
| Stripe checkout   | **LIVE MODE**  | `POST /api/checkout` returns a `cs_live_` session on the $99 promo path                                                               |
| $99 promo         | **CONFIGURED** | `STRIPE_PRICE_SUBSCRIPTION_SETUP_PROMO` + `STRIPE_COUPON_LAUNCH_PROMO` both present in Vercel production (the two `isPromo` requires) |
| Referral tracking | **LIVE**       | `?ref=`/`?src=` validated in prod: invalid ref → 400, `payton` → `cs_live_`                                                           |
| Production schema | **CURRENT**    | all 12 migrations verified applied + `0013` applied 2026-07-29                                                                        |
| Provisioning cron | **ARMED**      | `/api/cron/provision` returns 401 unauth → `CRON_SECRET` set                                                                          |
| Sales chat bubble | **CONFIGURED** | `/api/chat` returns 400 on empty body (not 503) → `ANTHROPIC_API_KEY` set                                                             |
| SEO               | **LIVE**       | `robots.txt` 200; `sitemap.xml` 38 `<loc>` entries                                                                                    |
| CI                | **GREEN**      | `lint-and-typecheck` ~35s, `build-and-smoke` ~1m35s                                                                                   |

## Production database — verified 2026-07-29

Introspected directly (there is **no `supabase_migrations.schema_migrations` ledger** — every
migration here was applied by hand, so the ledger is empty and `supabase migration list` will
always report nothing. The schema itself is the only source of truth):

- `0006` bucket MIME list is exactly `jpeg, png, webp` — no SVG · `0007` `sites.copy_addon` ·
  `0008` `sites.ai_copy_draft` + `discovery_answers` · `0009` `customers.auth_user_id` ·
  `0010` `edit_requests` table · `0011` exactly one `customers_auth_user_id_idx` ·
  `0012` `append_edit_request_comment()` RPC.
- `sites_status_check` carries all **12** states, which proves `0003`/`0007`/`0008` ran in the
  correct order (only `0008` last yields the full set).
- `0013_referral_tracking` applied 2026-07-29: `referral_code`/`referral_source` both `text`,
  nullable, no default; partial index `WHERE referral_code IS NOT NULL`; the 1 pre-existing row
  untouched with both NULL.
- RLS enabled on `sites`, `customers`, `edit_requests`.

**Debt:** no migration ledger means nothing stops the next migration being applied twice or
skipped. Worth baselining `schema_migrations` before the next one.

## Referral attribution (shipped 2026-07-29, PR #60)

Promoter links: `https://yourshopfront.com/start?ref=<who>&src=<channel>`.
Live set for Payton: `?ref=payton` with `src=tiktok` / `src=ig` / `src=fb`.

`ref` is the payout key; `src` is the channel report. 30-day first-party cookie, first-touch
wins, validated at the Zod boundary against `/^[a-z0-9][a-z0-9_-]{0,31}$/i`, carried through
Stripe metadata onto `sites.referral_code` / `sites.referral_source`. Fully additive — absent
`ref` changes nothing. Payout + channel queries are comments in `supabase/migrations/0013_*.sql`.

Business decisions still open: commission amount (suggested $50/closed sale, paid after the
30-day refund window) and confirming the promoter discloses the paid relationship on-video (FTC
liability sits with us, not her).

## What shipped 2026-07-29

| PR  | Merge     | What                                                                                 |
| --- | --------- | ------------------------------------------------------------------------------------ |
| #56 | `ecd07de` | Playbook: stop pitching custom per-prospect demos                                    |
| #57 | `13b37a9` | CI fix — `pnpm/action-setup` vs `packageManager` conflict had killed every PR in ~5s |
| #58 | `9a8984b` | `PROJECT-STATE.md` created as canonical status doc                                   |
| #59 | `565c79b` | Chatbot quoted $299/$149 and never mentioned the $99 promo                           |
| #60 | `d4f6b0e` | Referral attribution (`ref`/`src`)                                                   |
| #61 | `400df5b` | `CLAUDE.md` + `README.md` refreshed against current code                             |
| #62 | `16e9c20` | `LAUNCH-CHECKLIST` + runbooks — 11 corrections                                       |
| #63 | `540b9db` | 8 point-in-time docs archived to `docs/history/`                                     |
| #64 | `fd6fcab` | Repointed links broken by the archive move                                           |
| #65 | `c65d74f` | `/api/checkout` rate limit + cancellation idempotency (VULN-006)                     |
| #66 | `c5dae9c` | Salvaged the `HeroPhoneFirst` dead-code item from stale PR #54                       |

Closed unmerged: **#54** (base 2 months stale — merging would have deleted 113/138/54 lines from
`CLAUDE.md`/`README.md`/`post-launch-todo.md`) and **#37** (adds a root-level session-snapshot
doc; superseded by `docs/history/`).

## Decisions locked

- **No custom pre-sale demos.** The 30 demos are a standing library. Pitch is "here's what a
  [trade] site looks like in our system" — never "I built this for you." Owner-stated 2026-07-29,
  enforced in the playbook with ❌/✅ examples.
- Prospecting is **demo-first + no-website wedge**: businesses with no site, social-only, or a
  dead domain.
- **The sales chat bubble is hidden on `/checkout`, not repositioned.** Owner-approved
  2026-07-29. The order-summary panel's height varies by theme/tier/promo, so no fixed offset
  reliably clears "Today's charge" — and covering the amount a buyer confirms before paying is
  worse than losing the chat entry point on that one route. Nothing else on `/checkout`
  dispatches `apex:open-chat`, so nothing else regresses. The bubble is repositioned (not
  hidden) on the legal pages.
- Referral attribution is **link-based, not discount-code-based** — Stripe rejects `discounts`
  together with `allow_promotion_codes`, so the promo funnel deliberately disables code entry.
  A code literally cannot work on `/start`.

## BLOCKERS

1. **The post-payment path has never been exercised against production.** Checkout is proven
   live; the welcome email (Resend), onboarding worksheet, and provisioning handoff are not.
   Now higher stakes — the `sites` insert writes two brand-new referral columns. **Do one real
   $99 checkout through `?ref=payton&src=tiktok`, confirm email + worksheet fire, confirm the row
   has `referral_code='payton'`, then refund.** One test covers promo, email, onboarding, and
   attribution together. **This gates outreach.**
2. **Legal pages publish AI-drafted copy as binding terms.** `REDESIGN-REPORT.md` §5.4 gated
   these behind `<LegalPage draft>`; no page passes `draft` any more (verified 2026-07-29 —
   `terms`, `privacy`, `refund-policy` all omit it), so the banner is gone. The `draft` prop
   itself still exists and works (`src/components/apex/legal-page.tsx:20`), so restoring the
   banner is a one-word change per page.

   **Partially resolved 2026-07-29:** the governing-law gap is closed. Owner named the state —
   `src/app/terms/page.tsx:65` now reads "governed by the laws of the State of Arizona, where
   Axon Labs LLC is registered. Disputes are resolved in the state or federal courts located in
   Maricopa County, Arizona." (Maricopa County confirmed by the owner 2026-07-29.) `lastUpdated` bumped
   `2026-05-04` → `2026-07-29` in the same commit, since the binding text changed.
   Shipped as **PR #68, merged `fc34319`**.

   **Still open:** the rest of the legal copy is unreviewed AI drafting with no draft banner.
   Decide whether it stays live as-is or gets the `draft` banner back until a human reviews it.

## Customer-side audit findings (2026-07-29)

> **Most of this is FIXED** — see "Audit fixes — MERGED" below for which PR closed what. Kept
> here because the reasoning and file:line evidence explain *why* each fix looks the way it does.
> Anything still open is marked inline.

- **P0 — `/access` recovery silently fails for any email with a capital letter.**
  `src/app/api/access/route.ts:69` lowercases the _input_, then `:77` does a case-**sensitive**
  `.eq("customers.email", normalizedEmail)`. `src/lib/checkout-schema.ts:26-29` has no
  `.toLowerCase()`/`.trim()` transform, so Stripe stores the address exactly as the customer
  typed it. `supabase/migrations/0009_auth_customer_link.sql:22` already solves this correctly
  (`where lower(email) = lower(p_email)`) and `requireAuth()` uses that RPC — `/access` was
  written as an inline query and skipped it. The endpoint returns an identical anti-enumeration
  body on hit and miss, so the failure is **invisible to both the customer and the operator**.
  Fix: match case-insensitively, and add email normalization at the checkout Zod boundary.
- **This makes Stage 4 Hook 3 a present-tense bug, not future work.** `CLAUDE.md` requires both
  repos to enforce the same email normalization (lowercase, trim) before bundling. Its absence is
  already breaking a live recovery path.
- **P0 — `/pricing` still advertises the pre-promo price.** `src/app/pricing/page.tsx` lines
  27, 31, 45, 46, 61, 105-106, 124 show `$299` / `$149/mo` / `$997` with **no mention of the $99
  launch promo**. It is linked from the global header nav on every page, from the homepage promo
  card via "See full pricing →" (`src/components/apex/home/pricing-teaser.tsx:81`), and it is the
  checkout's own error-recovery target (`src/app/checkout/page.tsx:41` redirects invalid `?tier=`
  to `/pricing`). The contradiction runs both ways: `/pricing`'s CTA sends no `promo` param, but
  `src/app/checkout/page.tsx:55-61` auto-applies the promo to any subscription checkout, so the
  buyer reads "$299 setup" and then sees "$99" at payment. `src/app/about/page.tsx:104` separately
  claims the price is identical "on the homepage, the pricing page, the checkout, the footer" —
  now false. **This is the CLAUDE.md hardcoded-`$99`gotcha coming true:**`/pricing`was not in
the list of 10 files, which is exactly why it drifted. Fix`/pricing`*and* extract`pricing-constants.ts` so an eleventh file cannot drift.
- **P1 — `/start` hard-attaches the wrong trade's demo to its primary CTAs.**
  `src/app/start/page.tsx:45` sets `PROMO_CHECKOUT_HREF` with `demo=premium-trade`, used at
  `:64`, `:90`, and `:371`. `premium-trade` is a plumbing/HVAC brand
  (`src/lib/themes/premium-trade.ts`), but `/start` is the shared promo landing for painters,
  electricians, and every other trade — so a painter clicking the main CTA reaches checkout
  showing another trade's business name and photo.
- **P1 — no social proof anywhere in the pre-purchase funnel.** No testimonials, review counts,
  or "N businesses live" on `/`, `/start`, or the demo pages. The traffic is cold DM and TikTok
  referral; nothing third-party validates the purchase before the card is entered.
- **P1 — `/checkout` overflows horizontally at 375px, clipping the hero text.** Confirmed
  2026-07-29 by screenshotting **production** at 375×812: the page renders **414px wide** and the
  order-summary hero card is cut off on the left edge — "Heritage Painters" renders as
  "itage Painters", "Premium design" as "mium design", "and restorers" as "l restorers". On the
  page where the customer enters card details. **No branch fixes this** — it is a follow-up, and
  it lives in `src/app/checkout/page.tsx`, which the pricing branch also touches, so sequence it
  after that merges. Evidence: `scratchpad/checkout-375-prod.png`.
- **P1 — the `/app` portal is undiscoverable.** Grep for `/login` and `/app/edit-requests` across
  `src/lib/email.ts`, `src/app/api/stripe/webhook/route.ts`, and
  `src/app/onboarding/provisioning-status.tsx` returns **zero** hits. The welcome email, goodbye
  email, and onboarding "Live" state never mention the portal; the Live state instead tells
  customers to "reply to any of our emails to push edits." The self-service edit-request feature
  cannot be found by a customer who was not told about it by hand.

## Demo catalog defects (2026-07-29) — FIXED

> All four closed by PRs #70/#71/#72. Retained as the record of what was wrong and how it was
> verified (every hero image was opened and viewed, not inferred).

The 30 demos **are** the product. All four defects below are in shared components or assets, so
each one fix repairs many themes at once.

- **P0 — three hero images are the wrong photo entirely.** Opened each `.jpg` directly:
  - `public/themes/summit-roofing/hero.jpg` is an indoor **billiards room** with soccer
    memorabilia and a football beanbag. Alt text claims "Roofer installing dark asphalt shingles."
    **`summit-roofing` is one of the 10 featured demos**, i.e. this runs against paid/referral
    traffic under the headline "STORM DAMAGE? WE INSPECT FREE."
  - `public/themes/aurora-pressure-wash/hero.jpg` is a **nighttime nightclub queue** (crowd,
    barrier rope, street number 764). Alt text claims a concrete surface being pressure-washed.
  - `public/themes/webgl-experimental/hero.jpg` is a **bakery bread case with € price tags**.
    Alt text claims an abstract generative gradient.
- **P0 — 23 of 30 themes render copy from the wrong industry**, because two shared hero
  components ignore the theme entirely:
  - `src/components/home/hero.tsx:373` — `HeroGallery` literally calls `void theme`, then
    hardcodes four tiles tagged "Restoration / Exterior / Cabinetry / Heritage" (painting-trade
    vocabulary). **16 of 30 themes use `hero: "gallery"`**, so a bookstore, a yoga studio, a
    florist, a wine bar, and an arborist all advertise "Cabinetry."
  - `src/components/home/hero.tsx:497,514` — the `form-card` hero hardcodes "Free inspection — no
    pressure" and "We'll walk your roof and email you a written quote within 24 hours."
    **7 themes use `hero: "form-card"`; only `summit-roofing` is a roofer**, so an electrician, a
    junk-removal firm, a plumbing/HVAC brand, and a devtools SaaS all offer to walk your roof.
  - Combined that is **23 of 30 themes (77%)** showing visibly templated, wrong-trade copy — the
    exact "template with the serial number filed off" impression the demos exist to dispel.
- **P1 — final-CTA headline is illegible on dark-`primary` themes.**
  `src/components/home/final-cta.tsx:68` always colors the highlight span
  `var(--apex-primary)` over a dark photo scrim. When a theme's `primary` is a dark ink
  (Heritage Painters `#1A1614`, Greenwise Lawn `#2D4A2F`), the text nearly vanishes. Confirmed by
  the auditors on 5+ themes, several of them featured.
- **P1 — the header wordmark is invisible on dark themes.**
  `src/components/apex/logo.tsx:37` hardcodes `text-apx-ink` even though `SiteHeader` theme-colors
  everything around it. Affects Cinematic Dark, Crystalline Window Co, Mara Lin.
- **P1 — trust-strip stats overlap/clip at 375px** when a stat value exceeds ~8 characters
  (`src/components/home/trust-strip.tsx`, fixed 40-48px display font in a 2-col mobile grid, no
  wrap or size-down). Seen on premium-trade, voltcraft-electric, sparkle-suds-laundromat.

**Not a defect:** large blank mid-page regions in static screenshots are scroll-reveal
(`FadeUp` / intersection observer) never firing in a headless capture. Both auditors verified the
content exists in the theme configs. Screenshot demo pages with a scroll-through step.

## Known open issues (not blocking, verified 2026-07-29)

- `.env.production.example` files five consumed vars (`CLOUDFLARE_*`, `VERCEL_*`,
  `ADMIN_PASSWORD`) under "not currently consumed", and names `VERCEL_TEMPLATE_PROJECT_ID`,
  which does not exist. Real var is `VERCEL_PROJECT_ID`. `LAUNCH-CHECKLIST.md` is authoritative.
- `STRIPE_PRICE_COPY_ADDON` is **mandatory, not optional** — `readPriceIds()` returns `null`
  without it, failing every checkout in every tier.
- `/api/provisioning/approve` has no rate limit despite gating `ADMIN_PASSWORD` (brute-forceable);
  no audit row written.
- `/api/onboarding/status` returns raw `failure_reason` unauthenticated, and reads `site_id` from
  `searchParams` with no Zod validation.
- Rate limiter is process-local in-memory, so limits don't hold across Vercel instances.
- No deny-all RLS policies on `sites`/`customers` (RLS on, no policies — service-role only).
- Stage 4 hooks 1–3 unimplemented while taking live money; every sale grows a future backfill.
  Hook 3 (email normalization) is no longer merely deferred — see the `/access` P0 above.
- `/demos` (index, no slug) → 404. Playbook links are full `/demos/<slug>` so outreach is fine.
- Deferred webhooks: `invoice.payment_failed`, `customer.subscription.updated`.
- Playbook PDF stale — `scripts/build-launch-playbook-pdf.py` writes to `C:/Users/admin/Desktop/`
  (dead Windows box) and the PDF is untracked, so PR #56's fix isn't in any circulating copy.
- Sentry not wired; Lighthouse never measured.

## Audit fixes — MERGED 2026-07-29

Five agent branches, each written in an isolated worktree with non-overlapping file ownership,
plus the legal fix. All six merged to `master` and deployed. Each branch was re-verified cold
before merge — typecheck run independently, diff read, scope confirmed — and the **combined**
state was test-merged locally and built (`pnpm build` clean, all 30 portfolio paths prerendered)
before anything touched `master`.

| PR  | Merge     | What                                                                             |
| --- | --------- | -------------------------------------------------------------------------------- |
| #68 | `fc34319` | Arizona/Maricopa County named as governing law + venue; `lastUpdated` bumped     |
| #69 | `731f4f4` | `/access` case-insensitive recovery + email normalization (Hook 3) + portal links |
| #70 | `d1a4d16` | the 3 mismatched hero photos replaced                                            |
| #71 | `17b4677` | hero gallery + form-card copy driven by theme config across 23 themes            |
| #72 | `7b88bc2` | final-CTA contrast, dark wordmark, trust-strip overflow, chat-bubble occlusion   |
| #73 | `d6a4f82` | `/pricing` shows the live promo; `pricing-constants.ts` extracted                |

**Rollback, per PR:** `git revert -m 1 <merge-sha>` on a branch, then a PR. Never force-push master.

**Scale correction found during review:** the final-CTA contrast bug was worse than the visual
audit reported. Recomputing WCAG contrast for every theme shows `primary` fails 4.5:1 against
`fg` on **17 of 30 themes**, not the 5-7 spotted by eye. The `primary -> accent -> bg` fallback
clears AA on all 30 (tightest: heritage-painters 4.57).

**Deliberately NOT done:**

- **Social proof.** The funnel still has no testimonials or customer counts. That cannot be fixed
  by writing some — fabricated reviews on a page taking payment is not an option. Needs real
  customers, i.e. BLOCKER 1 and the lead list.
- **The `lower(email)` unique index.** SQL is in PR #69's description as a recommendation. This
  repo has no migration ledger, so nothing prevents a double-apply — owner-run only, and audit
  for case-variant duplicates first or index creation fails.

**Unverified detail:** `aurora-pressure-wash/hero.jpg` is 1400x1400 (square) while every other
hero is landscape (summit 1400x933, ironside 1400x1050), so it crops harder in the hero slot.
The agent reported the render looks fine; that was never independently confirmed.

### Follow-ups queued behind these merges (in order)

1. **P1 — the welcome email quotes standard pricing to promo customers.**
   `src/app/api/stripe/webhook/route.ts:420` hardcodes
   `"Subscription ($299 + $149/mo)"`, so a customer who just paid **$99** is emailed that they
   are on $299 + $149/mo. **This fires on the very first real sale**, i.e. during the BLOCKER 1
   smoke test. The fix is available: `src/app/api/checkout/route.ts:164` already writes
   `metadata.promo = "launch"`, and the webhook never reads it (grep for `promo` there returns
   nothing). Deferred only because it needs `pricing-constants.ts` (pricing branch) _and_ edits
   `webhook/route.ts` (customer-backend branch) — do it after both merge, not before.
2. **`src/components/home/hero.tsx:161`** price strings — the pricing agent was barred from this
   file because the demo-copy agent owned it. Also missing `/mo` on the trailing `$149`.
3. **`/checkout` horizontal overflow at 375px** (see the P1 above) — same file the pricing
   branch touches.
4. **`$49` hosting addon is only half-migrated.** `HOSTING_ADDON` exists in `pricing-constants.ts`
   and is used in `src/app/checkout/page.tsx:260`, but ~8 other user-visible `$49` strings are
   still hardcoded (`pricing/page.tsx`, `components/home/pricing.tsx`, `apex/home/pricing-teaser.tsx`,
   `faq.tsx`, `refund-policy`, `terms`). The pricing agent's final audit grepped only
   `$299|$149|$997|$99` — `$49` was never in the pattern, which is why it was missed.

**Other standard-price-only surfaces found, not yet fixed:** `src/lib/seo.ts:50,58` (OG/meta
fallback), `src/components/home/faq.tsx:41` (refund FAQ says "$299 setup fee"),
`src/app/terms/page.tsx:26-27`, and `src/app/app/billing/page.tsx:57` (portal always labels the
plan `$149/mo` even inside the promo window — should probably read real Stripe price data).

**CLAUDE.md correction:** its gotcha claiming "the sales chatbot quotes standard pricing, not the
promo" is **stale**. `src/lib/chat/system-prompt.ts:31,35` already quotes the $99 promo and
explicitly instructs the model never to present $299 as the current price — fixed by PR #59.
Remove that gotcha from `CLAUDE.md`.

**Deliberately NOT delegated:**

- **Social proof.** The funnel has no testimonials or customer counts, and that cannot be fixed
  by writing some — fabricated reviews on a page taking payment is not an option. Needs real
  customers, i.e. BLOCKER 1 and the lead list.
- **The `lower(email)` index migration.** The backend agent was told to write the SQL into its
  report as a recommendation only. With no migration ledger (see Debt above), nothing prevents a
  double-apply — this stays an owner-run step.

## Next actions

1. The production smoke test in BLOCKER 1. **Before any outreach.**
2. ~~Decide the governing-law state~~ — **done, merged.** Still open under BLOCKER 2: decide
   whether the remaining unreviewed legal copy stays live or gets the `draft` banner back.
3. ~~Review and merge the five audit-fix branches~~ — **done, all merged 2026-07-29.** Next is
   the follow-up queue above, starting with the welcome-email pricing bug (it fires on the very
   first real sale).

4. Work the lead list: `~/leads/az-trade-leads-2026-07-29.csv` — 103 Phoenix-metro trade
   businesses, 102 with no real website, demo-matched and ranked. Scripts in
   `~/leads/outreach-scripts.md`. Warm-network text blast first, then cold DMs top-down.
   **Gated on the demo-catalog fixes above** — 23 of 30 demos currently show another trade's
   copy, and the featured roofing demo shows a billiards room.
5. Send Payton her three links; agree commission and disclosure.
6. Baseline the Supabase migration ledger before the next migration.
