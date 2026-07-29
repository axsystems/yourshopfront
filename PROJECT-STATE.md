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
   these behind `<LegalPage draft>`; no page passes `draft` any more, so the banner is gone.
   `src/app/terms/page.tsx:65` reads "governed by the laws of the state in which Axon Labs LLC is
   registered" — **no state named**. Needs an owner decision: name the state and keep the copy, or
   restore the draft banner until reviewed.

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
- `/demos` (index, no slug) → 404. Playbook links are full `/demos/<slug>` so outreach is fine.
- Deferred webhooks: `invoice.payment_failed`, `customer.subscription.updated`.
- Playbook PDF stale — `scripts/build-launch-playbook-pdf.py` writes to `C:/Users/admin/Desktop/`
  (dead Windows box) and the PDF is untracked, so PR #56's fix isn't in any circulating copy.
- Sentry not wired; Lighthouse never measured.

## Next actions

1. The production smoke test in BLOCKER 1. **Before any outreach.**
2. Decide the governing-law state (BLOCKER 2).
3. Work the lead list: `~/leads/az-trade-leads-2026-07-29.csv` — 103 Phoenix-metro trade
   businesses, 102 with no real website, demo-matched and ranked. Scripts in
   `~/leads/outreach-scripts.md`. Warm-network text blast first, then cold DMs top-down.
4. Send Payton her three links; agree commission and disclosure.
5. Baseline the Supabase migration ledger before the next migration.
