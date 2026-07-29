# Project State — Your Shopfront

**Last updated:** 2026-07-29 (MST)
**Live:** https://yourshopfront.com · **Repo:** axsystems/yourshopfront · **Branch:** `master`
**Vercel project:** `yourshopfront` (axsystems-projects) · **Supabase ref:** `vszlrvczfpgwdenmsfvx`
(ref is memory-sourced — it appears nowhere in this repo; confirm in the Supabase dashboard
before acting on it)

Sister docs — do not duplicate these, update them:
`CLAUDE.md` (cold-start hub + hard rules) · `LAUNCH-CHECKLIST.md` (go-live gate) ·
`README.md` (architecture) · `docs/marketing-launch-playbook.md` (day-1 sales) ·
`docs/post-launch-todo.md` (deferred work).

---

## Status table

| Area                | State          | Evidence (2026-07-29)                                                         |
| ------------------- | -------------- | ----------------------------------------------------------------------------- |
| Marketing site      | **LIVE**       | `/`, `/pricing`, `/start`, `/portfolio` all HTTP 200                          |
| Demos               | **LIVE**       | all 15 trade demo slugs HTTP 200; 30 themes total                             |
| Stripe checkout     | **LIVE MODE**  | `POST /api/checkout` returns a `cs_live_` session on the $99 promo path       |
| `/start` promo page | **LIVE**       | renders $99 pricing                                                           |
| Provisioning cron   | **ARMED**      | `/api/cron/provision` returns 401 unauth → `CRON_SECRET` is set               |
| Sales chat bubble   | **CONFIGURED** | `/api/chat` returns 400 on empty body (not 503) → `ANTHROPIC_API_KEY` present |
| SEO                 | **LIVE**       | `robots.txt` 200; `sitemap.xml` 38 `<loc>` entries                            |
| CI                  | **GREEN**      | `lint-and-typecheck` 44s pass, `build-and-smoke` 1m40s pass                   |

## What shipped this session (2026-07-29)

- **PR #57** (`13b37a9`) — CI fix. `pnpm/action-setup@v4` had `version: 10` in both jobs
  while `package.json` pinned `packageManager: pnpm@10.28.0`. The action hard-errors on two
  sources of truth, so **every PR had failed `lint-and-typecheck` in ~5s since PR #55 merged**,
  and `build-and-smoke` never ran at all (`needs:` blocked it). Removed the 4 hardcoded lines.
- **PR #56** (`ecd07de`) — playbook copy. Removed all "I built a demo of YOUR business" /
  "custom demo for your specific trade" framing and added an explicit framing rule.

## Decisions locked

- **No custom pre-sale demos.** The 30 demos are a standing library. Pitch is
  "here's what a [trade] site looks like in our system" — never "I built this for you."
  Owner-stated 2026-07-29. Costs zero labor per prospect and nothing to walk back.
- Prospecting is **demo-first + no-website wedge**: target businesses with no site,
  social-only, or a dead domain.

## Blockers / unverified

- **Post-payment path never exercised against production.** Checkout is confirmed live-mode,
  but the welcome email (Resend), onboarding worksheet, and provisioning handoff have NOT been
  run end to end on prod. **Do this before any outreach**: one real $99 checkout on `/start`
  with a real card, confirm email + worksheet fire, then refund in Stripe.
- **`LAUNCH-CHECKLIST.md` §4 lists the wrong migrations.** It instructs the operator to run
  `0001_initial` → `0005_storage_bucket`. `supabase/migrations/` actually holds **12** files
  (`0001`–`0012`), and `0006`–`0012` are not cosmetic: `0007_copy_addon`, `0008_ai_copy_state`,
  `0009_auth_customer_link`, `0010_edit_requests`, `0012_edit_request_append_comment`. Anyone
  provisioning a fresh Supabase project from that checklist gets a **broken schema**.
  Verified 2026-07-29 by `ls supabase/migrations/`.
- `LAUNCH-CHECKLIST.md` also has most boxes unchecked while several are demonstrably done
  (Stripe live, cron armed, sitemap) — never reconciled against reality.
- Playbook PDF is **stale**. `scripts/build-launch-playbook-pdf.py` writes to
  `C:/Users/admin/Desktop/` (dead Windows box) and the PDF is untracked, so the #56 copy fix
  is not reflected in any PDF still in circulation. Needs a corrected output path.
- **`/demos` (index, no slug) returns 404 — CONFIRMED 2026-07-29**, both live (`curl` → 404)
  and structurally (`src/app/demos/` contains only `[slug]/`, no `page.tsx`). Every demo link
  in the playbook is a full `/demos/<slug>` URL so outreach is unaffected, but a prospect who
  truncates the URL hits a dead page. Needs a listing page or a 308 to `/portfolio`.
- Deferred Stripe webhooks (`invoice.payment_failed`, `customer.subscription.updated`,
  `charge.refunded`) — see `docs/post-launch-todo.md`. Matters past ~50 subscriptions.

## Next actions

1. Run the real-card checkout smoke test described above. **Gates outreach.**
2. Work the lead list: `~/leads/az-trade-leads-2026-07-29.csv` — 103 Phoenix-metro trade
   businesses, 102 with no real website, demo-matched and ranked. Scripts in
   `~/leads/outreach-scripts.md`. Warm-network text blast first, then cold DMs top-down.
3. Reconcile `LAUNCH-CHECKLIST.md` against verified live state — **starting with §4's
   migration list (`0001`–`0005` → `0001`–`0012`)**, which is a correctness bug, not tidying.
4. Fix the PDF generator output path, or drop the PDF and treat the `.md` as canonical.
5. Add `/demos` index (listing page or 308 to `/portfolio`).
