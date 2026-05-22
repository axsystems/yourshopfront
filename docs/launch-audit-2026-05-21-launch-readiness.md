# Launch Readiness: Apex Sites (apexsites.com)

**Audit date:** 2026-05-21
**Branch:** `redesign` (HEAD `2f34b87`)
**Scope:** build gates, env hygiene, Stripe correctness, provisioning, customer surface, observability. Excludes RLS/webhook-sig deep-dive and chat/cron internals (delegated to other agents).

---

## Status: GO (conditional)

Code is production-ready. All build gates pass. The two real blockers are operational, not code: live-mode Stripe price IDs must be created and pasted into Vercel before the first paying customer, and Resend domain DNS must be verified. Both are documented checklist items, not engineering work. One MEDIUM cleanup recommended pre-merge to `master`.

---

## Build gates — PASS

- `pnpm install --frozen-lockfile`: clean (lockfile up to date, pnpm v10.28.0).
- `pnpm typecheck` (`tsc --noEmit`): zero errors.
- `pnpm lint` (`eslint src/`): zero warnings.
- `pnpm build` (Next 16.2.4 + Turbopack): green. Compiled in 15.8s, TS in 14.0s, 79/79 static pages generated. Per-route summary matches the master brief (32 sitemap-eligible URLs + the `/api/*` dynamic and `/_tenant`).
- One build warning, expected: `Using edge runtime on a page currently disables static generation for that page` — that's `/api/og/[slug]` at `src/app/api/og/[slug]/route.tsx:7` (`runtime = "edge"`), required for `@vercel/og`.

---

## Findings

### CRITICAL — 0

### HIGH — 2 (operator action, not code)

**H1. Stripe live-mode prices not provisioned.**
`src/app/api/checkout/route.ts:22-27` correctly refuses to mint a session if any of the four `STRIPE_PRICE_*` env vars is missing or still contains `"xxx"`. That's a launch guard, not a defect — but it means a paying customer who hits `/checkout` against production before `pnpm stripe:setup` is run against the live key will see a 500 with the message *"Checkout is not yet configured."*
Action: run `pnpm stripe:setup` with `STRIPE_SECRET_KEY=sk_live_*` set, paste the four emitted `price_*` IDs into Vercel prod env. Documented in `LAUNCH-CHECKLIST.md:33-36, 82`.

**H2. Resend sender domain unverified ⇒ welcome emails will land in spam.**
`src/lib/email.ts:17` falls back to `Apex Sites <onboarding@resend.dev>` if `RESEND_FROM_EMAIL` isn't set. The `.env.production.example:60` documents the live value as `hello@apexsites.com`, but that only routes if Resend's SPF + DKIM are validated on the apex zone. Until then mail will deliver, but cold-recipient inboxes will rate it low.
Action: complete checklist `LAUNCH-CHECKLIST.md:113` before flipping the env var.

### MEDIUM — 3

**M1. Stale `.env.example` lists `VERCEL_TEMPLATE_PROJECT_ID` semantics that no longer exist.**
`.env.local:38` (local-only, gitignored — not a commit) reads `VERCEL_TEMPLATE_PROJECT_ID=prj_xxx`. The orchestrator actually consumes `VERCEL_PROJECT_ID` (`src/lib/provisioning/vercel.ts:22`), which is what the canonical `.env.example:41` and `.env.production.example:86-89` (commented) use. Local-only confusion; not a launch blocker.

**M2. Orphan component file referencing the removed Axon Growth partner block.**
`src/components/apex/home/partner-axon-growth.tsx` still exists and exports `HomePartnerAxonGrowth`. Grep confirms zero imports anywhere in `src/`. Doesn't ship (tree-shaken), but it's dead code that contradicts the recent Axon-Growth removal commit. Recommend `git rm` before merging to `master`; restore guide in `docs/axon-growth-restore.md` already covers the four real files.

**M3. `.env.production.example` lists Cloudflare + Vercel API keys as "Future (Phase 5+ provisioning) — not currently consumed."**
Lines 80-91. Those env vars *are* now consumed (`src/lib/provisioning/cloudflare.ts:28-29`, `src/lib/provisioning/vercel.ts:20-22`, `src/app/api/cron/provision/route.ts`). The active `LAUNCH-CHECKLIST.md` documents them correctly, but the example file is out-of-date and will mislead anyone copying it line-by-line. Either update or rely solely on `LAUNCH-CHECKLIST.md` § 3.

### LOW — 3

**L1. No Sentry / structured error reporter wired.** Zero matches for `Sentry|sentry` under `src/`. The codebase uses `console.error` / `console.warn` throughout (`src/app/api/stripe/webhook/route.ts:49,58,73,95,109,124`, etc.), which surfaces in Vercel function logs but isn't searchable across deploys. Acceptable for a marketing-site launch; add before scaling past ~50 customers.

**L2. `invoice.payment_failed` / `charge.refunded` not handled.** Confirmed — `src/app/api/stripe/webhook/route.ts:64-69` only branches on `checkout.session.completed` and `customer.subscription.deleted`. Already tracked in `docs/post-launch-todo.md:7,23` with the "before 50 subscribers / 5 refunds-per-month" threshold. Flagged as WARNING per scope, not a blocker.

**L3. `/api/onboarding/status` is unauthenticated.** `src/app/api/onboarding/status/route.ts:11-20` returns site status by UUID with no bearer check. The route's docstring justifies the choice (UUIDs are non-enumerable, only status/live_url/failure_reason leaked, mirrors SSR'd onboarding page). Defensible — flagging only because someone reading the diff cold might be surprised.

---

## Customer surface — VERIFIED

- **Route count**: 79 generated pages. Build output enumerates all expected routes; `/dev/themes` is statically rendered but gated at runtime via `process.env.NODE_ENV === "production" → notFound()` (`src/app/dev/themes/page.tsx:16`). Confirmed safe — will 404 in prod.
- **sitemap.xml**: present at `src/app/sitemap.ts`. Emits 32 URLs: 1 home + 10 featured demos + 1 portfolio index + 14 non-featured portfolio + 6 static pages. Matches the checklist.
- **robots.txt**: present at `src/app/robots.ts:7`, disallows `/api/, /dev/, /tenant, /onboarding`. Correct.
- **OG images**: dynamic per-slug at `src/app/api/og/[slug]/route.tsx` (edge runtime, Fontsource TTF fetch). Static fallback `/og-default.png` ships in `public/`. Cold-fetch perf concern documented in `docs/post-launch-todo.md:42` — pre-warm via curl post-deploy.
- **Tenant subdomain rewrite**: `src/proxy.ts:22-53` correctly rewrites `<slug>.apexsites.com/` → `/tenant?slug=<slug>` only for the root path. Apex and `www` pass through. Matcher correctly excludes API + static.
- **Secrets in repo**: zero `sk_live_/sk_test_*/whsec_/eyJ*` matches across `src/`. The only files with those substrings are `.env.example`, `.env.production.example`, README, and the launch checklist — all placeholders. `.env.local` contains a real `ANTHROPIC_API_KEY` but is properly gitignored (`.gitignore:34`) and confirmed not tracked (`git ls-files --error-unmatch` errors out).

---

## Stripe flow — VERIFIED

Read full `src/app/api/checkout/route.ts` (160 lines) and `src/app/api/stripe/webhook/route.ts` (246 lines).

- **All 3 modes wired correctly**:
  - `tier=subscription`: `mode: "subscription"` with monthly + setup as line_items (checkout/route.ts:113-125). One-time setup auto-becomes an invoice item on first invoice — the cleaner pattern.
  - `tier=onetime` + `hosting_addon=true`: `mode: "subscription"` with hosting + onetime as line_items (133-144). $997 + $49 today, then $49/mo.
  - `tier=onetime` no addon: `mode: "payment"` with onetime only (148-158). `customer_creation: "always"` set explicitly so the customer record exists for downstream lookup.
- **Metadata propagation**: `site_id`, `tier`, `demo_slug`, `business_name`, `email`, `phone`, `industry`, `hosting_addon` all stamped on `session.metadata` AND `subscription_data.metadata` where applicable (64-76, 119, 138). Correct — guarantees `customer.subscription.deleted` events 6 months from now can still find the site.
- **Idempotency**: webhook checks `getSiteByStripeSessionId(session.id)` at line 80 *before* writing anything. Belt-and-suspenders via the `sites.stripe_session_id` unique constraint (documented at lines 30-34). Correct.
- **Signature verification**: `stripe().webhooks.constructEvent(payload, sig, secret)` (line 56), raw body via `req.text()` (line 53) — not parsed JSON, so HMAC is preserved. Correct.
- **API version pin**: `2024-11-20.acacia` at `src/lib/stripe.ts:15`. Dashboard webhook endpoint must match — flagged in `LAUNCH-CHECKLIST.md:87`.
- **Subscription cancellation**: handled at webhook/route.ts:165-190. Pulls `site_id` from `sub.metadata.site_id`, flips status to `'cancelled'`, sends goodbye email. Correct.

---

## Provisioning pipeline — VERIFIED

Read `src/app/api/cron/provision/route.ts` (62 lines), `src/lib/provisioning/orchestrator.ts` (176 lines), `cloudflare.ts` (112 lines), `vercel.ts` (107 lines).

- **CRON_SECRET auth**: route.ts:25-33 — refuses to run if env unset, 401s any mismatched `Authorization: Bearer` header. Correct.
- **Batch cap**: 5 sites per tick (`getSitesByStatus([…], 5)` at line 37). 60s Vercel function timeout has headroom.
- **State machine**: `ready_to_build → provisioning → awaiting_approval → live`. Atomic claim via `transitionStatus()` (orchestrator.ts:68-77) prevents two ticks racing. DNS step idempotent (cloudflare.ts:90 returns existing record if it already points at `cname.vercel-dns.com`). Vercel attach idempotent (vercel.ts:62-63 treats 409 as success).
- **Failure path**: `markFailed()` on any throw (orchestrator.ts:138-148), Slack ping, sets `failure_reason`. Failed sites are NOT retried — manual intervention required (documented at orchestrator.ts:46-47). Correct.
- **Approval endpoint**: `src/app/api/provisioning/approve/route.ts:32-43` — `ADMIN_PASSWORD` bearer check, Zod-validated body, optimistic status guard (`transitionStatus(awaiting_approval → live)` returns false if a race won, 409s back). Correct shortcut for launch; the inline comment explicitly flags it as not a long-term pattern.

---

## Observability — PARTIAL

- **Sentry**: not wired. Acceptable for launch; recommended before ~50 subs (see L1).
- **Slack**: `src/lib/notify.ts:8-27` — silent skip if `SLACK_WEBHOOK_URL` unset; never throws. Fired on new sale (webhook/route.ts:153), provisioning success (orchestrator.ts:127), provisioning failure (orchestrator.ts:141), site-live (approve/route.ts:84), inbound contact (contact/route.ts:90). Coverage is good.
- **Structured logs**: `console.log/error/warn` with bracket-prefixed module tags (`[webhook]`, `[provision <site.id>]`, `[checkout]`). Vercel surfaces these in function logs. Good enough for launch.

---

## DAY-1 monitoring punch list (first 24h post-deploy)

1. **Vercel function logs**: watch `/api/stripe/webhook` for `signature verification failed` (mismatched API version or wrong `whsec`) and `[webhook] checkout.session.completed already processed` (proves idempotency working).
2. **Slack #sales channel**: every paid checkout should ping within ~30s. If a payment lands in Stripe dashboard with no Slack ping, the webhook didn't fire.
3. **Cron logs**: `[cron/provision]` should return `{ok:true, processed:0}` every minute on a quiet day. After first onboarding completes, watch for `awaiting_approval` ping within 60s.
4. **Resend dashboard**: bounce rate <2%, no SPF/DKIM failures.
5. **Stripe dashboard → Events**: 100% delivery, no 5xx on webhook endpoint.
6. **Cloudflare DNS**: `dig <provision_slug>.apexsites.com CNAME` returns `cname.vercel-dns.com.` for any newly-provisioned customer.
7. **Pre-warm OG images post-deploy**: curl each `/api/og/<slug>` once (script in `LAUNCH-CHECKLIST.md:136-141`) to avoid 24 cold edge invocations slowing the first real social-share preview.
8. **Lighthouse spot-check** the canonical 6 URLs after DNS propagation — `LAUNCH-CHECKLIST.md:146-153`.

---

## GO / NO-GO

**GO**, conditional on operator completing checklist items § 3 (live env), § 5 (Stripe live products + webhook), § 6 (Resend domain verification). Code is launch-ready.

### Minimal commit set required to ship

Single small commit recommended on `redesign` before merge to `master`:

1. `git rm src/components/apex/home/partner-axon-growth.tsx` (M2)
2. Update `.env.production.example` lines 80-91 to move Cloudflare/Vercel/Admin vars out of the "Future" section into a live "Provisioning" section, matching `.env.example` and `LAUNCH-CHECKLIST.md` (M3). Optional — not a blocker.

Nothing else needs to change in the code to launch.
