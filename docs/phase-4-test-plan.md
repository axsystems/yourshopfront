# Phase 4 — End-to-End Test Plan

Manual runbook to verify the full payment flow in **Stripe test mode**. Designed to run
start-to-finish in **about 30 minutes** once setup is done.

**Reviewed and updated 2026-07-29.** Sections that had drifted from the shipped code are marked
inline. The three original checkout modes are unchanged and still correct; what changed since
this was first written is the **$199 copy add-on** (a fourth line-item variation plus a separate
upgrade endpoint), the **`/start` launch promo** path, and the **`charge.refunded`** webhook
handler.

> **This document does NOT cover the production gate.** Test mode proves the code; it does not
> prove that live-mode keys, the live webhook secret, the production Supabase schema, and a
> verified Resend sender are all wired correctly. That is `LAUNCH-CHECKLIST.md` **§0**, and it
> has not been run. Passing everything here still leaves that gap open.

Real money is never touched here. The Supabase project, Resend account, and Slack webhook can
be the same instances you'll use in production — all the test data is identifiable (cleanup
section at the bottom).

---

## What you're verifying

- [ ] `/api/checkout` creates a valid Stripe Checkout session for all 3 modes (subscription, one-time, one-time + hosting)
- [ ] The `/start` **launch-promo** path (`promo=launch`) swaps in the $99 setup price and applies the coupon
- [ ] The **$199 copy add-on** rides along as an extra line item in every mode, and parks the site in `awaiting_copy_draft`
- [ ] `/api/checkout/copy-upgrade` sells the add-on **after** the original purchase
- [ ] `/api/stripe/webhook` verifies signatures and rejects bad ones
- [ ] `checkout.session.completed` creates a customer + site row in Supabase
- [ ] Webhook is **idempotent** — replaying the same event creates exactly one site row
- [ ] Welcome email lands (Resend), Slack ping fires, operator SMS fires (Quo/OpenPhone)
- [ ] `/onboarding` finds the new site row and renders the checklist
- [ ] Completing the worksheet + assets + domain steps flips `sites.status` to `ready_to_build`
- [ ] Cancelling a subscription fires `customer.subscription.deleted` and flips status to `cancelled`
- [ ] Refunding a charge fires `charge.refunded` and flips status to `refunded`

---

## Prerequisites

You need:

- Node 20+, pnpm (`packageManager: pnpm@10.28.0` — do not override the version)
- A **Stripe test-mode** account (dashboard.stripe.com, toggled to "Test mode")
- The Stripe CLI installed: <https://docs.stripe.com/stripe-cli>
- A Supabase project with **all twelve migrations run** (`0001_initial.sql` → `0012_edit_request_append_comment.sql`).
  ⚠️ **Corrected 2026-07-29** — this used to say "both migrations (`0001`, `0002`)". Running
  fewer than twelve gives a schema where the copy-addon tests fail the `sites_status_check`
  constraint after the charge succeeds. The authoritative list and verification SQL live in
  `LAUNCH-CHECKLIST.md` §4.
- A Resend account with at least one verified sender — or skip Resend (welcome emails will `console.log` instead of send)
- Optional: a Slack incoming-webhook URL — or skip (Slack pings will silently no-op)
- Optional: Quo/OpenPhone credentials (`QUO_API_KEY`, `QUO_FROM_NUMBER`, `QUO_OPERATOR_PHONE`) — or skip (operator SMS silently no-ops)

---

## One-time setup

### 1. Set Stripe + Supabase env vars in `.env.local`

```bash
# Real test-mode Stripe key (sk_test_*), NOT the placeholder
STRIPE_SECRET_KEY=sk_test_<paste-from-stripe-dashboard>
# NOTE (2026-07-29): NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is NOT needed. It appears
# in the .env examples but in no source file — checkout is entirely server-side.

# Real Supabase
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co   # browser-visible, needed for /login + /app/*
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Optional but recommended for the email/Slack verification steps
RESEND_API_KEY=re_<real-or-omit>
RESEND_FROM_EMAIL=Your Shopfront <onboarding@resend.dev>
CONTACT_INBOX_EMAIL=<your-test-email>
SLACK_WEBHOOK_URL=<your-slack-webhook-or-omit>

# Site base URL (matches what dev server prints)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Create the 6 Stripe products + prices

```bash
pnpm stripe:setup
```

**Corrected 2026-07-29 — this said "4 products".** `scripts/create-stripe-products.ts` defines
six: subscription setup ($299), subscription setup launch-promo ($99), subscription monthly
($149/mo), one-time build ($997), hosting add-on ($49/mo), and copy-writing service ($199).

The script is idempotent — safe to re-run if it half-ran. Copy **all six**
`STRIPE_PRICE_*=price_...` lines from stdout into `.env.local`.

⚠️ **`STRIPE_PRICE_COPY_ADDON` is mandatory even if you never test the add-on.**
`readPriceIds()` in `src/app/api/checkout/route.ts` returns `null` when any of the five core
price IDs (setup, monthly, onetime, hosting, copyAddon) is missing, which makes **every**
checkout 500 with "Checkout is not yet configured." `STRIPE_PRICE_SUBSCRIPTION_SETUP_PROMO` is
the one exception — it is optional, and the promo path silently falls back to the $299 setup
price when it is unset.

### 2b. Create the launch-promo coupon (only if testing the `/start` promo)

Stripe Dashboard (Test mode) → Coupons → New: **$50 off, repeating, 3 months**, and
**restrict it to the monthly subscription product** (`applies_to.products`). Put its
**Coupon ID** (not a promotion code) in `STRIPE_COUPON_LAUNCH_PROMO_MONTHLY`. If either the
promo price or the coupon is unset, `promo=launch` is ignored and you get standard pricing.

⚠️ The product restriction is load-bearing, and the variable name changed. An unrestricted
coupon in this slot discounts the one-time setup fee instead of the monthly — with the 30-day
trial the setup fee is the only line on the first invoice — so checkout charges **$49, not $99**.
`applies_to` cannot be added to a coupon after creation; make a new one instead.

### 3. Authenticate the Stripe CLI

```bash
stripe login
```

Opens a browser, links your CLI to your test-mode dashboard. Persists in your home dir, only do this once per machine.

---

## Per-session setup

Every time you sit down to test, run these in **3 separate terminals**:

### Terminal 1 — webhook listener

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

It will print:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxx (^C to quit)
```

**Copy that `whsec_*` value** into `.env.local` as `STRIPE_WEBHOOK_SECRET=whsec_...`. The secret rotates each time you start `stripe listen`, so you'll do this every session.

### Terminal 2 — Next.js dev server

```bash
pnpm dev
```

If you change `.env.local` after `pnpm dev` is running, restart it — Next.js doesn't hot-reload env.

### Terminal 3 — your shell

For `psql` queries, `curl` checks, or to run `stripe events resend` later.

---

## Test 1 — Subscription tier

**Setup verification** (run before Test 1 to baseline):

```sql
-- Run in Supabase SQL editor
select count(*) as customers from customers;
select count(*) as sites from sites;
-- Note these counts. You'll re-check after each test.
```

### 1.1 — Hit checkout in browser

Open: `http://localhost:3000/checkout?tier=subscription&demo=heritage-painters`

- [ ] Page loads themed in Heritage Painters style (warm-premium, terracotta accents, Fraunces serif)
- [ ] Order summary on the left shows iframe of `/demos/heritage-painters?embed=1`, "Subscription" label, "$448 today's charge" subtotal
- [ ] Form on the right has all fields, no hosting-addon checkbox

### 1.2 — Fill the form

| Field | Value |
|---|---|
| Business name | `Test Plumbing & HVAC` |
| Your name | `Sarah Whitman` |
| Email | (use a real inbox you can check) |
| Phone | `5551234567` |
| Industry | `Plumbing` |
| Current website URL | (leave blank) |
| Headline | `Plumbing & HVAC, properly engineered.` |

Click **Continue to payment**.

- [ ] Browser redirects to `checkout.stripe.com/c/pay/...`

### 1.3 — Pay with test card 4242

| Field | Value |
|---|---|
| Card number | `4242 4242 4242 4242` |
| Expiry | any future date, e.g. `12/30` |
| CVC | any 3 digits, e.g. `123` |
| Postal | any 5 digits, e.g. `12345` |
| Name on card | `Sarah Whitman` |

Click **Subscribe**.

- [ ] Stripe shows "Setting up your subscription…"
- [ ] Browser redirects to `http://localhost:3000/onboarding?session_id=cs_test_...`

### 1.4 — Verify Stripe Dashboard

In <https://dashboard.stripe.com/test/customers> (must be in Test mode):

- [ ] New customer appears at the top with the email you submitted
- [ ] Click into the customer — there's 1 invoice for `$448.00` (`$299.00` setup line + `$149.00` first month line)
- [ ] Customer has 1 active subscription, next billing in ~1 month at `$149.00`

### 1.5 — Verify Terminal 1 (webhook listener)

You should see:

```
... checkout.session.completed                          [200]
... customer.created                                    [...]
... customer.subscription.created                       [...]
... invoice.created                                     [...]
... invoice.payment_succeeded                           [...]
... charge.succeeded                                    [...]
```

The handler we care about — `checkout.session.completed` — must be `[200]`. Other events are informational; we don't handle them yet.

### 1.6 — Verify Supabase

```sql
-- Latest customer
select id, stripe_customer_id, email, name, phone, created_at
from customers
order by created_at desc
limit 1;
```

- [ ] One new row, email matches your form input

```sql
-- Latest site
select id, customer_id, tier, demo_slug, business_name, industry,
       headline_pref, hosting_addon, status, stripe_session_id,
       created_at, onboarding_state
from sites
order by created_at desc
limit 1;
```

- [ ] `tier = 'subscription'`
- [ ] `demo_slug = 'heritage-painters'`
- [ ] `business_name = 'Test Plumbing & HVAC'`
- [ ] `industry = 'Plumbing'`
- [ ] `headline_pref = 'Plumbing & HVAC, properly engineered.'`
- [ ] `hosting_addon = false`
- [ ] `copy_addon = false`
- [ ] `status = 'pending_content'` (with the copy add-on checked this would be
      `'awaiting_copy_draft'` instead — see Test 4)
- [ ] `stripe_session_id = 'cs_test_...'` matches the URL `?session_id=` on `/onboarding`
- [ ] `onboarding_state = {}`
- [ ] `customer_id` matches `customers.id` from the previous query

### 1.7 — Verify Resend (if configured)

- [ ] Email arrived at the address you used in the form
- [ ] Subject: `Welcome to Your Shopfront — let's build your site`
- [ ] Body mentions Heritage Painters and the Subscription tier
- [ ] Onboarding URL link works

If you skipped Resend setup, the dev server log shows `[email] skipped — RESEND_API_KEY not set: Welcome to Your Shopfront — let's build your site`. That's the expected fallback.

### 1.8 — Verify Slack (if configured)

- [ ] Slack channel got a message starting with `💸 New subscription sale`
- [ ] Includes business name, demo slug, customer email

If skipped: silent no-op, no log entry expected.

---

## Test 1b — Subscription via the `/start` launch promo

**Added 2026-07-29.** The `/start` landing page sells $99 setup + $99/mo for 3 months. This path
did not exist when the plan was written.

Open: `http://localhost:3000/checkout?tier=subscription&promo=launch&demo=premium-trade`

- [ ] Order summary shows the promo pricing, not $448

Fill the form with a fresh email, pay with `4242 4242 4242 4242`.

### Verify

> **Updated 2026-08-01.** This block described the pre-2026-07-31 offer ($198 today, coupon
> `launch_promo_3mo`). That ladder was retired by PR #89 and the figures below replace it.

- [ ] Stripe Checkout charges **$99.00 today** — the promo setup fee alone. The subscription
      starts on a 30-day trial, so no monthly invoice is issued today.
- [ ] Stripe Dashboard → the new subscription shows a **30-day trial** and the
      `launch_promo_3mo_monthly` coupon applied, **3 months, repeating**. The discount window
      runs 3 months past the *trial end*, not from today — the trial does not consume a
      discounted month, because no invoice is issued during it.
- [ ] Upcoming invoices: first month **free** (trial), then 3 at `$99.00`, then `$149.00/mo`
- [ ] Supabase `sites`: `tier = 'subscription'`; session metadata carries `promo = 'launch'`
- [ ] ⚠️ **If the charge is $49**, the unrestricted coupon `launch_promo_3mo` is in
      `STRIPE_COUPON_LAUNCH_PROMO_MONTHLY` instead of the product-scoped
      `launch_promo_3mo_monthly`. With a trial, the setup fee is the only line on the first
      invoice, so an unrestricted coupon discounts *that*. Fix the env var, not the code.
- [ ] ⚠️ **If the charge is $198**, the trial is not being applied — the pre-2026-07-31 ladder.
- [ ] ⚠️ **If the charge is $448**, `STRIPE_PRICE_SUBSCRIPTION_SETUP_PROMO` or
      `STRIPE_COUPON_LAUNCH_PROMO_MONTHLY` is unset and `/api/checkout` fell back to standard
      pricing **silently**, with no error. Check both env vars, not the code.

> Implementation note: Stripe rejects a Checkout session that specifies both `discounts` and
> `allow_promotion_codes` (even when the latter is `false`). On the promo path the code sends
> `discounts` and omits `allow_promotion_codes`; on every other path it sends
> `allow_promotion_codes: true`. If you see "you may only specify one of these parameters",
> that mutual exclusion has been broken.

---

## Test 2 — One-time tier (no hosting addon)

Open: `http://localhost:3000/checkout?tier=onetime&demo=brutalist`

- [ ] Page renders themed in Neo-Brutalist (yellow + black + pink, Bricolage Grotesque, hard-shadow buttons)
- [ ] Order summary shows "$997 today's charge"
- [ ] Hosting-addon checkbox is visible **and unchecked** for this test

Fill the form (different email this time so you can distinguish customers):

| Field | Value |
|---|---|
| Business name | `Loud Agency LLC` |
| Email | (different from Test 1) |
| Industry | `Creative Agency` |
| Headline | `A LOUD agency for LOUD brands.` |
| **Hosting addon** | **uncheck it** |

Submit → pay with `4242 4242 4242 4242`. **No subscription** is created in this mode.

### Verify

- [ ] Stripe dashboard: new customer with **1 charge of $997.00**, no subscription
- [ ] Terminal 1: `checkout.session.completed [200]`, no `subscription.created` events
- [ ] Supabase `sites`: new row with `tier = 'onetime'`, `demo_slug = 'brutalist'`, `hosting_addon = false`, `status = 'pending_content'`
- [ ] Resend welcome email arrived (different subject body — mentions "One-time build")
- [ ] Slack: `💸 New onetime sale: Loud Agency LLC (brutalist)`

---

## Test 3 — One-time tier WITH hosting addon

Open: `http://localhost:3000/checkout?tier=onetime&demo=brutalist`

This time **leave the hosting checkbox checked** (it defaults checked per the Phase 4c spec).

| Field | Value |
|---|---|
| Business name | `Loud Agency LLC v2` |
| Email | (third unique address) |
| Industry | `Creative Agency` |
| **Hosting addon** | **leave checked** |

Submit → pay with `4242 4242 4242 4242`.

### Verify

- [ ] Stripe dashboard: new customer with `1 invoice for $1,046.00` (`$997 build + $49 first-month hosting`)
- [ ] Active subscription scheduled at `$49/month`
- [ ] Supabase `sites`: `tier = 'onetime'`, `hosting_addon = true`, `status = 'pending_content'`
- [ ] Welcome email arrived

This is the trickiest mode — both a one-time charge and a recurring subscription in a single Checkout session. The dollar amounts are the proof it worked.

---

## Test 4 — Copy add-on ($199) attached at checkout

**Added 2026-07-29.** The copy-writing add-on is a `copy_addon: boolean` on the checkout request
(`src/lib/checkout-schema.ts`) and rides along as an extra `line_items` entry in **all three**
modes.

Run any of Tests 1–3 again with the copy add-on selected.

### Verify

- [ ] Stripe charge is the base amount **+ $199.00**
- [ ] Supabase `sites`: `copy_addon = true`
- [ ] Supabase `sites`: `status = 'awaiting_copy_draft'` — **not** `pending_content`. This is
      deliberate: the site must not reach the provisioning cron until copy exists.
- [ ] Slack ping includes `+ Copy service`; operator SMS includes `+ Copy`
- [ ] ⚠️ If the insert fails with a check-constraint violation on `sites_status_check`, the
      Supabase project is missing migration `0008_ai_copy_state.sql`. **The customer has
      already been charged at this point** — fix the schema, then create the site row by hand.

---

## Test 5 — Copy add-on upgrade after purchase

**Added 2026-07-29.** `/api/checkout/copy-upgrade` sells the add-on to a customer who already
bought. It creates a `mode: 'payment'` session for the $199 price with
`metadata.upgrade = 'copy_addon'` and `metadata.site_id`.

Using a `site_id` from any earlier test, drive the upgrade endpoint and pay with `4242`.

### Verify

- [ ] `checkout.session.completed` arrives `[200]`
- [ ] Dev log shows the copy-addon-upgrade branch, **not** new-site creation
- [ ] Supabase: **no new `sites` row** — the existing row is updated in place
- [ ] `sites.copy_addon` flips to `true`
- [ ] If the site was `pending_content` or `ready_to_build`, `status` becomes
      `awaiting_copy_draft`; any other status is left alone
- [ ] Replaying the same event is a no-op (the handler returns early when `copy_addon` is
      already true)

---

## Idempotency test (the locked-in requirement)

Stripe retries webhooks aggressively. If our handler creates duplicate site rows on retry, the production database will fill with garbage. The webhook is guarded two ways: an app-level `getSiteByStripeSessionId` check at the top of the handler, plus the unique constraint on `sites.stripe_session_id` as a backstop.

### Test the app-level guard by replaying

In Stripe dashboard → Test mode → Developers → Events. Find a recent `checkout.session.completed` (e.g. from Test 1). Click into it, then click **Resend** in the top-right corner.

Or via CLI:

```bash
# List recent events
stripe events list --type checkout.session.completed --limit 3

# Replay one
stripe events resend evt_<id>
```

### Verify

- [ ] Terminal 1 shows the replayed event arriving with `[200]`
- [ ] Dev server log shows: `[webhook] checkout.session.completed already processed: cs_test_... (site <uuid>)`
- [ ] Supabase row count for `sites` is **unchanged**:

```sql
select count(*) as sites_after_replay from sites;
```

That count should equal the count from after Test 3 — three sites total, not four.

If the count went up, the idempotency guard is broken. Stop and check the handler logic in `src/app/api/stripe/webhook/route.ts`.

---

## Cancellation test

```bash
# Get the most recent test subscription
stripe subscriptions list --limit 1

# Cancel it (replace with your sub ID)
stripe subscriptions cancel sub_<id>
```

### Verify

- [ ] Terminal 1: `customer.subscription.deleted` arrives with `[200]`
- [ ] Supabase: the matching `sites.status` flipped from `pending_content` (or `ready_to_build`) to `cancelled`:

```sql
select id, status, updated_at
from sites
where stripe_session_id = 'cs_test_...'  -- whichever session you cancelled
order by updated_at desc;
```

- [ ] Resend goodbye email arrived (subject: "Your Shopfront subscription has been cancelled")
- [ ] Slack ping: `🚪 Subscription cancelled — <email> · sub <id>`

---

## Refund test

**Added 2026-07-29 — `charge.refunded` shipped and was never in this plan.**

```bash
stripe charges list --limit 1
stripe refunds create --charge ch_<id>
```

### Verify

- [ ] Terminal 1: `charge.refunded` arrives `[200]`
- [ ] Supabase: the customer's **most recent** `sites` row flips to `status = 'refunded'`
- [ ] If that site was `live`, DNS + the Vercel domain attach are torn down
- [ ] Slack ping: `💸 Refund processed` with business name, email, and refunded amount
- [ ] Replaying the event is a no-op (guard: already `refunded`)
- [ ] ⚠️ Known behaviour, not a bug to chase here: the handler resolves the site by "most
      recent site for this Stripe customer" because `charge.refunded` carries no `session_id`.
      A customer with two sites refunded on the older one would have the **newer** site marked.
      Also, a **partial** refund is treated as a full refund. Both are logged in
      `docs/post-launch-todo.md`.

---

## Onboarding flow test

Open `/onboarding?session_id=cs_test_...` (use the session_id from any of the above tests where the subscription is **still active**, so status is `pending_content`).

- [ ] Page renders themed in the chosen demo style
- [ ] H1: "Hi <FirstName> — let's build your site."
- [ ] 4-step checklist visible
- [ ] Step 1 (purchase confirmed) shows green check
- [ ] Steps 2, 3, 4 show numbered circles

### Step 2 — content (worksheet)

⚠️ **Corrected 2026-07-29 — this step no longer has a "Mark as sent" button.** The manual
self-attestation was replaced by a real worksheet. `ContentStep` renders an **Open worksheet**
link to `/onboarding/worksheet?session_id=...`, and completion is derived from the content the
customer actually saved, not from a toggle.

Click **Open worksheet**, then fill and save all **five required** sections: hero, contact,
services, about, and service area. (Reviews and media are optional.)

```sql
select site_content, onboarding_state from sites where stripe_session_id = 'cs_test_...';
-- Expect site_content populated with hero/contact/services/about/serviceArea
-- and the content step showing complete on the checklist.
```

- [ ] The checklist's content step auto-flips to complete once the fifth required section saves

### Step 3 — assets (upload)

Upload a logo (any image ≤ 10 MB) plus a few photos on the assets step.

```sql
select site_content -> 'media' from sites where stripe_session_id = 'cs_test_...';
-- Expect logoUrl and a gallery array of Supabase Storage URLs.
```

- [ ] ⚠️ SVG uploads must be **rejected**. Migration `0006_drop_svg_mime.sql` removed
      `image/svg+xml` from the bucket allowlist because a public-read SVG is a stored-XSS
      vector. If an SVG uploads successfully, 0006 was not applied to this project.

### Step 4 — domain

Pick **Use my own domain** radio, type `example.com`, click **Save my choice**.

```sql
-- Expect domain.complete = true, domain.type = 'custom', domain.custom_domain = 'example.com'
-- AND status flipped to ready_to_build
select status, onboarding_state from sites where stripe_session_id = 'cs_test_...';
```

- [ ] `status = 'ready_to_build'`
- [ ] Page reloads and now shows the **ReadyToBuild celebration** — green checkmark, "We've got everything", 24h ETA, order summary card

### Lock test

Try clicking any step button or radio after status is `ready_to_build`:

- [ ] Buttons are disabled (or show a "locked" pill — depends on the implementation)
- [ ] Server action returns `{ ok: false, error: "Onboarding is locked..." }` if you try to bypass via devtools

---

## Test cards reference

| Card | Behavior | Use for |
|---|---|---|
| `4242 4242 4242 4242` | Always succeeds | Happy path tests above |
| `4000 0000 0000 0002` | Always declined | Verify cancel_url redirect with `cancelled=1` |
| `4000 0027 6000 3184` | Requires 3DS auth | (Optional) verify the SCA path renders |
| `4000 0000 0000 9995` | Insufficient funds | (Optional) verify graceful payment-fails UI |

For the declined card test:

- [ ] Stripe shows "Your card was declined"
- [ ] Click "Try again" — Stripe lets you retry
- [ ] Click cancel/back — browser returns to `/checkout?tier=...&demo=...&cancelled=1`
- [ ] Cancellation banner ("Payment cancelled — no charge was made") renders above the form
- [ ] No customer or site row created in Supabase

---

## Cleanup after testing

Test data piles up. Periodic cleanup keeps the dashboards readable.

### Stripe

In dashboard → Test mode → Customers, you can bulk-delete test customers. Their subscriptions, invoices, and charges go with them. **Test mode only** — never run cleanup in live mode.

### Supabase

```sql
-- CORRECTED 2026-07-29. The previous query was
--   delete from customers where stripe_customer_id like 'cus_test_%';
-- which matched NOTHING: Stripe test-mode CUSTOMER ids are plain `cus_*` with no
-- `test` marker. Only sessions (`cs_test_*`) and API keys (`sk_test_*`) carry one.
-- Key the cleanup off the session id instead, which is unambiguous.
delete from customers
where id in (
  select customer_id from sites where stripe_session_id like 'cs_test_%'
);
-- sites cascade-delete via the FK.

-- Sanity-check FIRST, before deleting anything:
select c.id, c.email, s.stripe_session_id
from customers c join sites s on s.customer_id = c.id
where s.stripe_session_id like 'cs_test_%';
```

⚠️ **Never run this against the production project without the sanity-check select first.** A
customer whose row predates their session id, or any hand-created row, will not be matched —
and a broadened `like` pattern would delete live data.

### Stripe products

You don't need to delete the test products and prices — they're harmless and `pnpm stripe:setup` finds and reuses them on the next run.

---

## Troubleshooting

### `/api/checkout` returns 500 with "Checkout is not yet configured"

Your `STRIPE_PRICE_*` env vars are unset or contain `xxx`. Run `pnpm stripe:setup` and copy the output into `.env.local`. Restart `pnpm dev`.

### Webhook returns 400 "Invalid signature"

Your `STRIPE_WEBHOOK_SECRET` doesn't match what `stripe listen` is using. Restart `stripe listen`, copy the new `whsec_*`, paste into `.env.local`, restart `pnpm dev`.

### `checkout.session.completed` arrived but no site row appeared

Check the dev server log for `[webhook] handler threw`. Most likely:

- **Supabase env wrong**: `[webhook] Error: Invalid API key` → check `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- **Missing customer fields**: `[webhook] missing customer email/name on session ...` → the test card flow should always populate these; double-check you typed an email in the Checkout form
- **Bad metadata**: `[webhook] invalid tier in metadata: ...` → sanity-check `/api/checkout` is including `tier` in `session.metadata`

### Welcome email skipped

Look for `[email] skipped — RESEND_API_KEY not set` in dev log. Set `RESEND_API_KEY` and `CONTACT_INBOX_EMAIL` in `.env.local` and restart `pnpm dev`.

If both are set but emails still aren't arriving:

- Is `RESEND_FROM_EMAIL` a verified sender on your Resend account? (Or use the default `onboarding@resend.dev` which works without verification.)
- Check Resend dashboard → Logs for delivery failures
- Spam folder

### Onboarding page stuck on "Processing your purchase"

The webhook hasn't created the row yet. Check Terminal 1 — did `checkout.session.completed` fire? If yes but row is missing, see the "no site row appeared" entry above.

If `stripe listen` isn't running at all, no webhooks fire. Start it.

### Idempotency replay creates a second row

Bug. The `getSiteByStripeSessionId` guard at the top of `handleSessionCompleted` (in `src/app/api/stripe/webhook/route.ts`) isn't doing its job. Verify the function is being called — add a `console.log` before the guard, replay, see if it logs.

### Subscription cancellation doesn't flip status

Check the `sub.metadata.site_id` is being set when we create the Checkout session. In `src/app/api/checkout/route.ts`, both `subscription_data.metadata` and `payment_intent_data.metadata` should include `site_id`. The cancellation handler reads `sub.metadata.site_id`.

If `site_id` is missing from `sub.metadata`, Stripe didn't propagate it — likely because we only set it on `session.metadata` and not on `subscription_data.metadata`.

---

## Done — sign-off checklist

When all of the above passes, Phase 4 is verified end-to-end. Sign off:

- [ ] All 3 checkout modes (subscription, onetime, onetime+hosting) create correct Stripe charges + Supabase rows
- [ ] `/start` launch promo charges $198 today with a 3-month coupon (Test 1b)
- [ ] Copy add-on at checkout adds $199 and parks the site in `awaiting_copy_draft` (Test 4)
- [ ] Copy add-on upgrade updates the existing site row without creating a new one (Test 5)
- [ ] Webhook idempotency confirmed via replay
- [ ] Cancellation flow flips status to `cancelled` and sends goodbye email
- [ ] Refund flow flips status to `refunded` and unprovisions a live site
- [ ] Onboarding worksheet + uploads + domain flip status to `ready_to_build`
- [ ] Resend + Slack + operator SMS side effects fire (or skip cleanly if unconfigured)
- [ ] Test data cleaned up

Passing all of the above verifies the code in **test mode only**. It does **not** clear the
production gate — see `LAUNCH-CHECKLIST.md` §0, which requires one real-card purchase against
production before any outreach.
