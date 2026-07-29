# Your Shopfront — Launch Checklist

**Reconciled against verified reality on 2026-07-29.** The site is already LIVE and in Stripe
live mode, so this is no longer a pre-launch document — it is the gap list between what is
running and what has actually been proven.

Items marked `[x] — verified 2026-07-29` were confirmed by reading this repo or probing
production on that date; the evidence is stated inline. Items still `[ ]` are either genuinely
undone or could not be verified from the repo (dashboard-only settings). Where something could
not be checked, it says so rather than assuming.

Current status, blockers, and next actions live in **`PROJECT-STATE.md`** — that is the
canonical status doc. Do not duplicate it here; this file is the operator runbook.

Sister docs: `PROJECT-STATE.md` (current status) · `docs/phase-4-test-plan.md` (manual Stripe
runbook) · `docs/post-launch-todo.md` (deferred work) · `README.md` (architecture) ·
`docs/history/REDESIGN-PLAN.md` / `docs/history/REDESIGN-LOG.md` / `docs/history/REDESIGN-REPORT.md` (archived redesign record).

---

## 0. THE GATE — do this before any outreach

> **The post-payment path has NEVER been exercised against production.**
>
> Checkout is confirmed live-mode (`POST /api/checkout` returns a `cs_live_` session), but
> nothing downstream of the card being charged has been run once on prod. Every step below is
> unproven in production:
>
> 1. Stripe fires `checkout.session.completed` at the **live** webhook endpoint and the
>    signature verifies against the **live** `STRIPE_WEBHOOK_SECRET` (live and test secrets
>    differ — a test-mode secret in prod fails every event silently with a 400).
> 2. `customers` + `sites` rows are actually written to the production Supabase project.
> 3. The **welcome email** sends via Resend from a verified sender and lands in a real inbox.
> 4. The onboarding link in that email resolves and `/onboarding/worksheet` saves content.
> 5. The provisioning cron picks the site up and hands off.
>
> If any of these is broken, a paying customer sends money and gets **nothing** — no email, no
> onboarding link, no site. The webhook's own failure path only pings Slack, so if
> `SLACK_WEBHOOK_URL` is unset the failure is completely silent.

**The gate test (run once, on production, with a real card):**

- [ ] Buy one `$99` launch-promo subscription on `/start` with a real card.
- [ ] Stripe Dashboard (**live** mode) → Developers → Webhooks → the live endpoint shows the
      `checkout.session.completed` delivery as **200**, not 4xx/5xx.
- [ ] Production Supabase: one new `customers` row and one new `sites` row, with
      `stripe_session_id` matching the `cs_live_*` you just created.
- [ ] The welcome email arrives in a real inbox (check spam) with a working onboarding link.
- [ ] `/onboarding?session_id=cs_live_...` renders the checklist, not the "Processing your
      purchase" spinner.
- [ ] Complete the worksheet; confirm `sites.site_content` is populated and status advances.
- [ ] Refund the charge in the Stripe Dashboard, then confirm `charge.refunded` was delivered
      **200** and `sites.status` flipped to `'refunded'` (the handler exists — see §5).
- [ ] Sign-off: date + who ran it: ________________________

Until every box in §0 is checked, **do not run outreach.**

---

## 1. Repo state

- [x] `master` and `redesign` are reconciled — **verified 2026-07-29**: `master` is the default
      branch and carries all merged work through PR #58 (`9a8984b`).
- [ ] `git status` is clean. No untracked secrets in repo (run `git ls-files | xargs grep -l 'sk_live\|sk_test\|whsec_\|service_role'` — should return nothing). Re-run per release.
- [x] `pnpm install --frozen-lockfile` succeeds on CI — **verified 2026-07-29**: both CI jobs
      run it and pass.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test:e2e` pass on `master` —
      **verified 2026-07-29** via CI: `lint-and-typecheck` (~44s) runs lint + typecheck,
      `build-and-smoke` (~1m40s) runs `pnpm build` + Playwright `pnpm test:e2e`. Both green.
- [x] CI workflow (`.github/workflows/ci.yml`) is green — **verified 2026-07-29**. Note: it was
      red on *every* PR from #55 until PR #57 (`13b37a9`) removed the hardcoded
      `version:` from `pnpm/action-setup`. **Do not re-add a `version:` key** — `package.json`
      pins `packageManager: pnpm@10.28.0` and the action hard-errors on two sources of truth.

## 2. Vercel project

⚠️ **Not verifiable from this repo** — these are Vercel dashboard settings. The site is live at
https://yourshopfront.com, so the project is obviously connected and building; the individual
settings below still need eyes-on confirmation in the dashboard.

- [x] Vercel project is connected to this repo — **verified 2026-07-29** by inference: the
      production domain serves current code.
- [ ] Production branch is set to `master`. (Dashboard-only — confirm.)
- [ ] Build command: `pnpm build` (default for Next 16). (Dashboard-only — confirm.)
- [ ] Install command: `pnpm install --frozen-lockfile`. (Dashboard-only — confirm.)
- [ ] Node version: `20.x` (matches `.github/workflows/ci.yml`, which pins `node-version: 20`
      in both jobs). (Dashboard-only — confirm.)
- [x] Cron is declared — **verified 2026-07-29**: `vercel.json` registers
      `/api/cron/provision` on `* * * * *`.

## 3. Environment variables (Vercel → Production scope)

**Corrected 2026-07-29.** The previous version of this list was missing 10 variables that the
code actually reads and listed one that the code never reads. The list below was regenerated by
grepping every `process.env.*` reference under `src/`, `scripts/`, `tests/`, `next.config.ts`,
and `playwright.config.ts`.

⚠️ **`.env.production.example` is itself stale** — it omits the Quo/SMS, analytics, admin,
copy-addon, and promo variables, still contains `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and
comments out `CLOUDFLARE_*` / `VERCEL_*` / `ADMIN_PASSWORD` as "not currently consumed" when
they now are. It also names `VERCEL_TEMPLATE_PROJECT_ID`, which does not exist in the code (the
real variable is `VERCEL_PROJECT_ID`). **This checklist is the authoritative list, not that
file**, until the example file is regenerated.

❌ **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is NOT required.** Verified 2026-07-29: it appears
only in `.env.example`, `.env.production.example`, and docs — **never in any `.ts`/`.tsx`
source file**. Checkout is fully server-side (`/api/checkout` creates the session and returns a
redirect URL); the browser never instantiates Stripe.js. Setting it is harmless but pointless.

### Site

- [ ] `NEXT_PUBLIC_SITE_URL=https://yourshopfront.com` — no trailing slash. Used for
      `success_url`, the welcome-email onboarding link, SEO canonicals, and OG fallbacks.
- [ ] `APEX_DOMAIN=yourshopfront.com` — defaults to this if unset. Used by the provisioning
      orchestrator to build customer subdomains.

### Stripe (all live-mode)

- [x] `STRIPE_SECRET_KEY` — **live mode** (`sk_live_*`). **Verified 2026-07-29**: a
      `POST /api/checkout` on the promo path returned a **`cs_live_`** session, which is only
      possible with a live secret key.
- [ ] `STRIPE_WEBHOOK_SECRET` — from the **live** endpoint (see §5). ⚠️ The live secret is
      different from the `whsec_*` that `stripe listen` prints in test mode. A test secret in
      production makes every webhook fail signature verification with a 400 — money in, no site
      row, no email, and no alert. **Unverified: cannot be checked without a real live event.**
- [ ] `STRIPE_PRICE_SUBSCRIPTION_SETUP` — live price ID, $299 setup.
- [ ] `STRIPE_PRICE_SUBSCRIPTION_SETUP_PROMO` — live price ID, $99 launch-promo setup. Required
      for the `/start` promo flow; without it `/api/checkout` silently falls back to the $299
      setup price.
- [ ] `STRIPE_PRICE_SUBSCRIPTION_MONTHLY` — live, $149/mo.
- [ ] `STRIPE_PRICE_ONETIME` — live, $997.
- [ ] `STRIPE_PRICE_HOSTING_ADDON` — live, $49/mo.
- [ ] `STRIPE_PRICE_COPY_ADDON` — live, **$199 one-time** copy-writing service. **Required, not
      optional**: `readPriceIds()` in `src/app/api/checkout/route.ts:31` returns `null` if this
      is missing, which makes **every** checkout 500 with "Checkout is not yet configured."
- [ ] `STRIPE_COUPON_LAUNCH_PROMO=launch_promo_3mo` — Stripe **Coupon ID** (not a promotion
      code). Create via Stripe Dashboard → Coupons → New: $50 off, repeating, 3 months. Required
      for the `/start` promo path.

All six `STRIPE_PRICE_*` values are emitted by one `pnpm stripe:setup` run against a live key —
see §5.

### Supabase

- [ ] `SUPABASE_URL` — production project URL (server-side).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — production service-role key. Server-only; **never** give it
      a `NEXT_PUBLIC_` prefix.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` — same project URL, browser-visible. **Was missing from this
      list.** Read by `src/lib/supabase-server.ts` / the SSR auth client; without it the
      customer portal (`/login`, `/app/*`) and the `proxy.ts` auth-cookie refresh cannot work.
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — production anon key, pairs with the above.

### Email + notifications

- [ ] `RESEND_API_KEY` — production Resend key. If unset, emails are **skipped and logged**, not
      queued. A missing key means paying customers get no welcome email.
- [ ] `RESEND_FROM_EMAIL` — `Your Shopfront <hello@yourshopfront.com>` once DNS is verified
      (see §6); `Your Shopfront <onboarding@resend.dev>` works unverified as a fallback.
- [ ] `CONTACT_INBOX_EMAIL` — `hello@yourshopfront.com`. Destination for `/contact` submissions.
- [ ] `SLACK_WEBHOOK_URL` — **strongly recommended, not optional in practice.** The webhook's
      "customer paid but we could not create their site" alarm (`route.ts` in
      `src/app/api/stripe/webhook/`) is a Slack ping and nothing else. With this unset, that
      failure is completely silent.
- [ ] `QUO_API_KEY` — OpenPhone API key for operator SMS on new sales
      (`src/lib/sms-quo.ts`). **Was missing from this list.** No-ops if unset.
- [ ] `QUO_FROM_NUMBER` — sender in E.164 (e.g. `+16234398208`). **Was missing.**
- [ ] `QUO_OPERATOR_PHONE` — operator's number in E.164, where sale alerts land. **Was
      missing.**

### AI

- [x] `ANTHROPIC_API_KEY` — powers the SalesAgent chat bubble and the AI copy-draft flow.
      **Verified 2026-07-29**: `POST /api/chat` with an empty body returns **400** (validation),
      not 503 (unconfigured), so the key is set. Without it `/api/chat` 503s and the bubble
      shows "offline."

### Admin

- [ ] `ADMIN_PASSWORD` — bearer token for `/api/provisioning/approve` and the
      `/admin/copy-review/[siteId]` console. **Was missing from this list.** Without it the
      approve endpoint cannot authorize anyone and **no site can be flipped to `live`.**
      Treat it as a secret and rotate it like one.

### Provisioning (Cloudflare + Vercel)

- [ ] `CLOUDFLARE_API_TOKEN` — Zone:DNS:Edit, scoped to the yourshopfront.com zone only.
- [ ] `CLOUDFLARE_ZONE_ID` — Cloudflare → yourshopfront.com → Overview → Zone ID.
- [ ] `VERCEL_API_TOKEN` — account-scoped token used to attach/detach customer subdomains.
- [ ] `VERCEL_TEAM_ID` — `team_*` containing this project.
- [ ] `VERCEL_PROJECT_ID` — `prj_*` of THIS project (multi-tenant single project).
- [x] `CRON_SECRET` — random token. Vercel auto-injects `Authorization: Bearer $CRON_SECRET` on
      cron-triggered requests; the route 401s anything else. **Verified 2026-07-29**:
      unauthenticated `GET /api/cron/provision` returns **401**, so the secret is set.

### Analytics (all optional — each no-ops cleanly when unset)

- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourshopfront.com` — leave empty to disable Plausible.
- [ ] `NEXT_PUBLIC_PLAUSIBLE_HOST` — defaults to `https://plausible.io`; set only for
      self-hosted Plausible. **Was missing from this list.**
- [ ] `NEXT_PUBLIC_GA4_ID` — GA4 measurement ID. **Was missing from this list.**
- [ ] `NEXT_PUBLIC_GOOGLE_ADS_ID` — Google Ads conversion account ID. **Was missing.**
- [ ] `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` — must be set **together with**
      `NEXT_PUBLIC_GOOGLE_ADS_ID` or the Ads conversion event does not fire. **Was missing.**

`NODE_ENV`, `CI`, and `ANALYZE` are also referenced in code but are set by the platform or by a
local command — do not add them to Vercel by hand.

## 4. Supabase

> ⚠️ **CORRECTED 2026-07-29 — this section previously caused a broken schema.** It instructed
> the operator to run only `0001_initial` → `0005_storage_bucket`. `supabase/migrations/` holds
> **twelve** files. Anyone who provisioned a fresh project from the old list got a schema with
> no `copy_addon`, no AI-copy statuses, no auth link, and no `edit_requests` table — meaning
> checkout would write rows that violate the `sites_status_check` constraint, and the customer
> portal would 500. Verified 2026-07-29 by reading all twelve `.sql` files.

- [ ] Production project exists in Supabase.
- [ ] **All twelve migrations have been run, in strict numeric order**, in the SQL editor:

  | #    | File                               | What it adds                                                             |
  | ---- | ---------------------------------- | ------------------------------------------------------------------------ |
  | 0001 | `0001_initial.sql`                 | `customers` + `sites` tables, `update_updated_at()` trigger, RLS enabled  |
  | 0002 | `0002_onboarding.sql`              | `sites.onboarding_state` jsonb                                            |
  | 0003 | `0003_provisioning.sql`            | `provision_slug`, `provisioning_state`, `failure_reason`; adds `provisioning` + `failed` statuses |
  | 0004 | `0004_site_content.sql`            | `sites.site_content` jsonb                                                |
  | 0005 | `0005_storage_bucket.sql`          | `site-assets` public-read Storage bucket + read policy                    |
  | 0006 | `0006_drop_svg_mime.sql`           | **Security fix** — removes `image/svg+xml` from the bucket MIME allowlist (stored-XSS vector) |
  | 0007 | `0007_copy_addon.sql`              | `sites.copy_addon` + `awaiting_copy` status + copy-queue partial index    |
  | 0008 | `0008_ai_copy_state.sql`           | `discovery_answers`, `ai_copy_draft`; the three `awaiting_copy_*` statuses |
  | 0009 | `0009_auth_customer_link.sql`      | `customers.auth_user_id` → `auth.users`; `get_customer_by_email()` RPC    |
  | 0010 | `0010_edit_requests.sql`           | `edit_requests` table + RLS select policy for the customer portal         |
  | 0011 | `0011_dedupe_auth_user_id_idx.sql` | Rebuilds `customers_auth_user_id_idx` as the partial form 0010 intended   |
  | 0012 | `0012_edit_request_append_comment.sql` | `append_edit_request_comment()` RPC — row-locked atomic comment append |

  **Order is load-bearing.** 0009 and 0010 both declare `customers_auth_user_id_idx`; 0011 only
  produces the correct partial index if it runs after both. 0003, 0007, and 0008 each drop and
  re-add `sites_status_check` — running them out of order leaves the wrong status set.

- [ ] Verify with this SQL (rewritten 2026-07-29 to match what the twelve migrations actually
      create — the old block only checked through 0005):

  ```sql
  -- 1. Tables exist; empty on a fresh project.
  select count(*) from customers;      -- 0 expected
  select count(*) from sites;          -- 0 expected
  select count(*) from edit_requests;  -- 0 expected (table created by 0010)

  -- 2. Every column the app writes to `sites` (0002, 0003, 0004, 0007, 0008).
  select column_name from information_schema.columns
    where table_name = 'sites'
      and column_name in ('onboarding_state', 'provision_slug', 'provisioning_state',
                          'failure_reason', 'site_content', 'copy_addon',
                          'discovery_answers', 'ai_copy_draft');
  -- expected: 8 rows

  -- 3. Auth link on customers (0009).
  select column_name from information_schema.columns
    where table_name = 'customers' and column_name = 'auth_user_id';
  -- expected: 1 row

  -- 4. Status constraint must be the FINAL 12-state form from 0008.
  select pg_get_constraintdef(oid) from pg_constraint
    where conname = 'sites_status_check';
  -- expected: 1 row containing all of:
  --   pending_content, awaiting_copy, awaiting_copy_draft, awaiting_copy_review,
  --   awaiting_copy_approval, ready_to_build, provisioning, awaiting_approval,
  --   live, cancelled, refunded, failed
  -- If 'awaiting_copy_draft' is absent, 0008 did not run and every copy-addon
  -- checkout will fail the constraint AFTER the customer has been charged.

  -- 5. Storage bucket (0005) with the 0006 security fix applied.
  select id, public, file_size_limit, allowed_mime_types
    from storage.buckets where id = 'site-assets';
  -- expected: 1 row · public = true · file_size_limit = 10485760
  --   · allowed_mime_types = {image/jpeg,image/png,image/webp}
  -- image/svg+xml MUST NOT be present — 0006 removed it as a stored-XSS vector.

  select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'site-assets public read';
  -- expected: 1 row

  -- 6. RPCs (0009, 0012).
  select proname from pg_proc
    where proname in ('get_customer_by_email', 'append_edit_request_comment');
  -- expected: 2 rows

  -- 7. 0011 collapsed the duplicate index into the partial form.
  select indexdef from pg_indexes where indexname = 'customers_auth_user_id_idx';
  -- expected: 1 row whose definition ends with WHERE (auth_user_id IS NOT NULL)
  ```

- [ ] ⚠️ **Unverified: whether the LIVE production project actually has 0006–0012 applied.**
      Nobody can answer this from the repo. Run the SQL above against the production project
      before the §0 gate test — if the live project was provisioned from the old five-migration
      instruction, the first copy-addon sale will take the customer's money and then fail the
      status constraint.
- [ ] RLS is enabled on `customers`, `sites`, and `edit_requests`. Verify in Supabase dashboard
      → Authentication → Policies.
- [ ] No policies for anon/authenticated on `sites` or `customers` (locked-by-default;
      service-role bypasses). `edit_requests` intentionally has exactly one policy — the
      `"customers view own edit_requests"` SELECT policy from 0010. Writes still go through
      service-role server actions.
- [ ] **`site-assets` bucket** has only the public-read policy on `storage.objects`. No
      INSERT/UPDATE/DELETE policies for anon/auth — writes go through service-role-issued signed
      upload URLs.

## 5. Stripe

- [x] Stripe account is in **live mode** — **verified 2026-07-29**: `POST /api/checkout` with
      the `promo=launch` subscription payload returned a **`cs_live_`** Checkout session. The
      real-money path is armed.
- [ ] Run `pnpm stripe:setup` against the live key to idempotently create the **six** products.
      (Corrected 2026-07-29 — this said "4 products"; `scripts/create-stripe-products.ts`
      defines six.) Capture all six emitted `STRIPE_PRICE_*=price_*` lines and paste into
      Vercel (§3):

  | Product                          | Env var                                  | Amount        |
  | -------------------------------- | ---------------------------------------- | ------------- |
  | Subscription Setup               | `STRIPE_PRICE_SUBSCRIPTION_SETUP`        | $299 one-time |
  | Subscription Setup (Launch Promo)| `STRIPE_PRICE_SUBSCRIPTION_SETUP_PROMO`  | $99 one-time  |
  | Subscription Monthly             | `STRIPE_PRICE_SUBSCRIPTION_MONTHLY`      | $149 / month  |
  | One-time Build                   | `STRIPE_PRICE_ONETIME`                   | $997 one-time |
  | Hosting Addon                    | `STRIPE_PRICE_HOSTING_ADDON`             | $49 / month   |
  | Copy Writing Service             | `STRIPE_PRICE_COPY_ADDON`                | $199 one-time |

- [ ] Create the launch-promo **Coupon** (Dashboard → Coupons → New): $50 off, repeating,
      3 months. Its ID goes in `STRIPE_COUPON_LAUNCH_PROMO`. The promo path applies the $99
      setup price **plus** this coupon against the $149/mo — $198 due today, then $99/mo for
      two more months, then $149/mo.
- [ ] In Stripe Dashboard → Developers → Webhooks → Add endpoint:
  - URL: `https://yourshopfront.com/api/stripe/webhook`
  - Events to send — **three**, corrected 2026-07-29 (this previously said two and omitted
    `charge.refunded`, which shipped):
    - `checkout.session.completed`
    - `customer.subscription.deleted`
    - `charge.refunded`
  - Any other event type is received and ignored by the handler.
  - Click "Reveal signing secret" → copy `whsec_*` → set `STRIPE_WEBHOOK_SECRET` in Vercel.
- [ ] **API version pin**: `src/lib/stripe.ts:15` pins to `2024-11-20.acacia`. The webhook
      endpoint Stripe creates defaults to the account's current API version — verify it matches
      `2024-11-20.acacia` in the dashboard, or events arrive in a different schema and the
      handler silently misreads them.
- [ ] Run the manual end-to-end test plan in `docs/phase-4-test-plan.md` (Stripe **test** mode).
      Sign off below:
  - [ ] Test 1 — Subscription tier (4242 card, $448 today). Site row, customer row, welcome
        email, Slack ping, operator SMS.
  - [ ] Test 1b — Subscription via `/start` promo
        (`/checkout?tier=subscription&promo=launch&demo=premium-trade`, 4242 card, **$198
        today**). Confirm the coupon is applied to the subscription; next 2 monthly invoices
        $99, then $149/mo.
  - [ ] Test 2 — One-time tier without addon ($997). Site row, no subscription created.
  - [ ] Test 3 — One-time tier WITH hosting addon ($1,046 today, $49/mo recurring).
  - [ ] Test 4 — Any tier **with the $199 copy add-on** checked. Site row lands in
        `status='awaiting_copy_draft'`, not `pending_content`.
  - [ ] Test 5 — Copy add-on **upgrade** after purchase via `/api/checkout/copy-upgrade`.
        Webhook flips `sites.copy_addon` to true and nudges status to `awaiting_copy_draft`.
  - [ ] Idempotency replay — `stripe events resend evt_*` does not create duplicate site rows.
  - [ ] Cancellation — `stripe subscriptions cancel sub_*` flips `sites.status` to
        `'cancelled'`, unprovisions, and sends the goodbye email.
  - [ ] **Refund** — refund a test charge; `charge.refunded` flips `sites.status` to
        `'refunded'`, unprovisions if the site was `live`, and pings Slack.
  - [ ] Onboarding flow — worksheet/assets/domain steps flip status to `'ready_to_build'`.

## 5b. Provisioning pipeline (Phase 5)

The cron job at `/api/cron/provision` runs every minute (configured in `vercel.json`). It picks up sites in status `ready_to_build` or `provisioning`, attaches a customer subdomain to this Vercel project, and flips status to `awaiting_approval`.

- [ ] **Cloudflare API token**: Cloudflare dashboard → My Profile → API Tokens → Create Token. Template "Edit zone DNS" → restrict to `yourshopfront.com` zone only. Paste into `CLOUDFLARE_API_TOKEN`.
- [ ] **Cloudflare zone id**: Cloudflare → yourshopfront.com Overview → API section (right sidebar) → Zone ID. Paste into `CLOUDFLARE_ZONE_ID`.
- [ ] **Vercel API token**: Vercel → Settings → Tokens → Create. Account-scoped. Paste into `VERCEL_API_TOKEN`.
- [ ] **Vercel team + project ids**: from this project's settings page. Paste into `VERCEL_TEAM_ID` and `VERCEL_PROJECT_ID`. (Note: `VERCEL_PROJECT_ID` is THIS project — the orchestrator attaches each customer subdomain to the same multi-tenant project.)
- [x] **CRON_SECRET**: generate a random token (`openssl rand -hex 32`). Set on Vercel. Vercel auto-injects it on cron requests as `Authorization: Bearer <CRON_SECRET>`. **Verified 2026-07-29**: unauthenticated `GET https://yourshopfront.com/api/cron/provision` returns **401**, so the route is armed and the secret is set.
- [ ] **Smoke test the cron** — after deploy, manually trigger via Vercel dashboard → Settings → Cron Jobs → Run. Should return `{ ok: true, processed: 0 }` if no sites are pending.
- [ ] **End-to-end provisioning test**: complete a Stripe test checkout, finish all 3 onboarding steps, watch the onboarding page show "Provisioning" → "Awaiting approval" within 60s. Verify the subdomain resolves: `dig <slug>.yourshopfront.com CNAME` should return `cname.vercel-dns.com`.
- [ ] **Admin approve**: with `Authorization: Bearer $ADMIN_PASSWORD`, POST `{ "site_id": "..." }` to `/api/provisioning/approve`. Confirms status flips to `live` and a customer email goes out.
- [ ] **Failure path**: with bad Cloudflare credentials, force a provisioning failure. Verify `sites.status='failed'`, `failure_reason` populated, Slack pinged, onboarding page shows the "We hit a snag" state.

## 5c. Stripe Customer Portal config (one-time, before /api/billing-portal works)

The Customer Portal must be configured ONCE in the Stripe Dashboard:

1. Stripe Dashboard → Settings → Billing → Customer portal
2. Enable the portal
3. Configure allowed actions:
   - [x] Update payment method
   - [x] Cancel subscriptions — recommend "Cancel at end of period" so the 30-day grace period in refund-policy is respected
   - [x] View invoice history + download receipts
   - [ ] Disable "Switch plans" — we don't support self-serve plan changes yet
4. Set redirect URL whitelist to include `https://yourshopfront.com/*`
5. Save

Without this, `POST /api/billing-portal` returns a Stripe error and the "Manage billing" button on the onboarding page errors out.

- [ ] Operator confirms portal configured

## 6. Email / Resend

- [ ] Production Resend account exists.
- [ ] **Domain verification**: in Resend → Domains → Add `yourshopfront.com`. Add the SPF + DKIM DNS records to Cloudflare (or your DNS host). Wait for both to validate (usually <10 min). Once green, switch `RESEND_FROM_EMAIL` from `onboarding@resend.dev` to `hello@yourshopfront.com`.
- [ ] Send a test welcome email by running Test 1 from `docs/phase-4-test-plan.md` **locally**
      (test-mode keys + `stripe listen`) and confirming delivery to a real inbox.
      ⚠️ **You cannot run a `4242` test card against production** — production holds live keys,
      and a test-mode event would fail live signature verification. The production equivalent is
      the §0 gate test with a real card.
- [ ] ⚠️ **Unverified: whether the production Resend domain is actually verified.** Not checkable
      from the repo. If `RESEND_FROM_EMAIL` is still `onboarding@resend.dev`, mail routes through
      Resend's shared subdomain and is more likely to be filtered as spam.
- [ ] Reply path works: replies to the welcome email land in `hello@yourshopfront.com` (forwards configured in your email host).

## 7. DNS

- [ ] `yourshopfront.com` A/AAAA records point to Vercel.
- [ ] `www.yourshopfront.com` redirects to `yourshopfront.com` (Vercel domain settings).
- [ ] Resend SPF + DKIM records present (see step 6).
- [ ] (If using Cloudflare for DNS) proxy is set to **DNS-only** for the apex; Vercel handles SSL.

## 8. SEO

- [x] `robots.txt` resolves at `https://yourshopfront.com/robots.txt` — **verified 2026-07-29**: HTTP 200.
- [x] `sitemap.xml` resolves and contains all **38** canonical URLs — **verified 2026-07-29**: live `sitemap.xml` returns exactly 38 `<loc>` entries, matching `src/app/sitemap.ts` (1 home + 10 featured demos + 1 portfolio index + **20** non-featured portfolio details + 6 static pages). *Corrected from "32 … + 14 portfolio details": there are 30 themes, 10 featured, so 20 are canonical at `/portfolio/[slug]`. (The docstring in `src/app/sitemap.ts` still says "non-featured 14" — code comment only, does not affect output; reported, not changed.)*
- [ ] Submit sitemap to Google Search Console: `search.google.com/search-console` → add `https://yourshopfront.com` as a property → verify (DNS or HTML file) → Submit sitemap.
- [ ] Verify rich-results test on these URLs: `search.google.com/test/rich-results`
  - [ ] `https://yourshopfront.com/`
  - [ ] `https://yourshopfront.com/pricing`
  - [ ] `https://yourshopfront.com/portfolio`
  - [ ] `https://yourshopfront.com/portfolio/heritage-painters`
- [ ] OG image fallback `/og-default.png` resolves and renders.
- [ ] OG image dynamic route `/api/og/heritage-painters` returns image/png.
- [ ] Pre-warm the **30** dynamic OG images (one per registered theme — corrected 2026-07-29 from "24") by curling each one once after deploy:
  ```
  for slug in ironside-plumbing greenwise-lawn bellhorn-movers ... ; do
    curl -sI "https://yourshopfront.com/api/og/$slug" >/dev/null
  done
  ```
  (Master brief noted this as a perf concern — `next/og` cold-fetches Fontsource on each cold edge invocation; CDN caches subsequent.)

## 9. Performance

- [ ] Run Lighthouse mobile against the production URL — 3 runs per page, take the median:
  - [ ] `/` Performance ≥ 90
  - [ ] `/pricing` Performance ≥ 90
  - [ ] `/portfolio` Performance ≥ 85 (iframe gallery, brief §9 budget)
  - [ ] `/contact` Performance ≥ 90
  - [ ] `/about` Performance ≥ 90
  - [ ] `/demos/heritage-painters` Performance ≥ 90
- [ ] Accessibility score = 100 on every page above.
- [ ] If any page misses, the master brief §6.5 escalation applies (more aggressive lazy-load on `/portfolio`, etc.) — don't silently relax the budget.

## 10. Final smoke

- [ ] Click every link in the SiteHeader and SiteFooter — none should 404.
- [ ] ⚠️ **Known 404: `/demos` (index, no slug).** Verified 2026-07-29 both live (HTTP 404) and structurally (`src/app/demos/` contains only `[slug]/`, no `page.tsx`). Outreach links are full `/demos/<slug>` URLs so it does not break campaigns, but a prospect who truncates the URL hits a dead page. Tracked in `PROJECT-STATE.md`.
- [ ] Submit the contact form on `/contact` with a test email — confirm it lands in `hello@yourshopfront.com` and Slack pings.
- [ ] Click "Pick a style →" on the home, complete a checkout with `4242 4242 4242 4242`
      **against a local dev server in Stripe test mode** (see `docs/phase-4-test-plan.md`) —
      confirm the onboarding page renders and the **4-step** checklist works (purchase → content
      worksheet → assets → domain). *Corrected 2026-07-29 from "3-step checklist" and "staging
      deploy": the checklist has four steps and there is no staging environment — production
      runs live keys, so test cards are a local-only exercise.*
- [ ] DemoSwitcher chips on `/demos/heritage-painters` navigate without flicker.
- [ ] PortfolioBanner on `/portfolio/heritage-painters` prev/next arrows work; "I want this look" links to checkout.
- [ ] Onboarding processing state polls every 5s when no `site` row exists yet (test by hitting `/onboarding?session_id=cs_test_invalid`).
- [ ] **Worksheet end-to-end** at `/onboarding/worksheet?session_id=...` — fill all 5 required sections, save each, watch ContentStep on the checklist auto-flip. Reviews + media sections optional.
- [ ] **Upload end-to-end** on AssetsStep — upload a logo (any image ≤10MB) + 3 photos. Watch AssetsStep auto-flip to complete. Confirm the URLs land in `site_content.media` (`select site_content from sites where id='...'`).
- [ ] **Tenant page renders content** — once onboarding flips to `awaiting_approval` (cron picked up + provisioned), visit `https://<provision_slug>.yourshopfront.com` and confirm the customer's hero/services/about/contact render. Logo shows in the header if uploaded; gallery section appears if ≥1 photo uploaded.

## 11. Sign-off

- [ ] **§0 gate test passed on production with a real card.** Nothing else in this list
      substitutes for it.
- [ ] All boxes above checked or explicitly waived (with reason).
- [ ] Manual Stripe test plan signed off (`docs/phase-4-test-plan.md`).
- [ ] DNS propagation confirmed on at least 3 different networks.
- [ ] At least one human (you) has spent 10 minutes clicking around production as a real user.

The marketing site is already live and serving traffic. What §0–§11 gate is **taking money from
a stranger**: until §0 passes, a real customer can pay and receive nothing.

---

## Items intentionally deferred from launch

These are flagged in the redesign loop and the final report. They are not launch-blockers — they're follow-ups.

- **Real legal copy.** `/privacy`, `/terms`, `/refund-policy` ship with the coral "Drafting in progress" warn banner and plain-English boilerplate. Replace with reviewed copy when convenient.
- **`[TBD]` governing-law clause** in `/terms` (state of incorporation).
- **Real founder/team copy** in `/about`.
- **Real customer testimonials / case-study photography.** None exist today; the trust strip metrics are truthful deliverables only.
- **`@next/bundle-analyzer`** for precise per-route gzipped first-load JS measurement. Approximate measurement only today.
- **`invoice.payment_failed` + `customer.subscription.updated` webhook handlers.** Per `docs/post-launch-todo.md` — add before scaling past ~50 active subscriptions. These two are the only Stripe events still genuinely deferred. **`charge.refunded` SHIPPED** and is handled in `src/app/api/stripe/webhook/route.ts` — do not re-list it as deferred.
- **Image optimization for tenant pages.** Tenant `<Image>` calls use `unoptimized` because Supabase Storage URLs aren't whitelisted. Add `*.supabase.co` to `next.config.ts` `images.remotePatterns` and drop `unoptimized` once a real customer needs the LCP gain.
- **Brand assets** (logos, OG images, favicon) still render the old Your Shopfront SVG mark. Update `public/brand/` SVG sources and re-run `pnpm brand:export` when new Your Shopfront brand assets are ready.
- **Worksheet + upload smoke automation.** Manual gates only today; needs a Supabase test fixture or mocked client to run in CI.
