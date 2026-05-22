# Apex Sites — Launch Readiness Audit

**Date:** 2026-05-21
**Branch:** `redesign` (head 2f34b87 + Axon Growth removal)
**Target:** apexsites.com production launch on Vercel
**Audit scope:** build gates, env hygiene, Stripe, Supabase RLS, provisioning, AI surface, security headers, observability

Three specialist agents ran in parallel. Sub-reports:
- `docs/launch-audit-2026-05-21-launch-readiness.md` — build, env, Stripe, provisioning, customer surface
- `docs/launch-audit-2026-05-21-ai-automation.md` — chat agent, prompt cache, cost caps, automation idempotency
- `docs/launch-audit-2026-05-21-security.md` — RLS, headers, timing-safe compare, input validation

---

## Verdict: **NO-GO until 4 BLOCKERS resolved.** All are small, scoped code fixes.

After blockers land: GO. The codebase is structurally sound, build/lint/typecheck/build all pass, Stripe flow is correct, webhook is signature-verified + idempotent, RLS is enabled, provisioning is atomic and idempotent.

**Build state (verified):** `pnpm install --frozen-lockfile` clean · `pnpm typecheck` 0 errors · `pnpm lint` 0 warnings · `pnpm build` 79/79 static pages in 15.8s (note: actual route count is 79, not the 68 in the older snapshot — Phase 8 added more).

---

## BLOCKERS (must fix before deploy)

### 1. CRITICAL — Zero security response headers
**Evidence:** `next.config.ts` and `src/proxy.ts` — no `headers()` function defined anywhere.
**Risk:** Customer-content tenant subdomains have no clickjacking, framing, mixed-content, or referrer protection. CSP completely absent.
**Fix:** Add a `headers()` export in `next.config.ts` with at minimum: CSP (script-src self + vercel.live for analytics), HSTS (max-age=31536000; includeSubDomains; preload), X-Frame-Options DENY (or CSP frame-ancestors), Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy disabling unneeded features.
**Effort:** ~30 min including a CSP smoke pass.

### 2. HIGH — Timing-unsafe secret comparison
**Evidence:**
- `src/app/api/provisioning/approve/route.ts:41` — `ADMIN_PASSWORD` compared with `!==`
- `src/app/api/cron/provision/route.ts:31` — `CRON_SECRET` header compared with `!==`

**Risk:** Side-channel disclosure of admin password / cron secret to a remote attacker over time.
**Fix:** Replace with `crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected))` after length check.
**Effort:** ~10 min.

### 3. HIGH — `MediaSchema` accepts any URL host (image pinning vector)
**Evidence:** `src/lib/site-content/schema.ts:98-102` defines `MediaSchema` with `url: z.string().url()` only. `customer-gallery.tsx` and `customer-hero.tsx` render with `<Image unoptimized>`, so a tenant could pin off-domain images on their live subdomain — phishing, NSFW, tracking pixels, etc.
**Risk:** Hostile or compromised worksheet input renders arbitrary URLs on a live customer site under our domain.
**Fix:** Tighten `MediaSchema.url` to a Supabase Storage host allowlist (`refine` checking the hostname matches `<SUPABASE_PROJECT_REF>.supabase.co` or signed-URL prefix).
**Effort:** ~20 min.

### 4. HIGH — Markdown link renderer accepts unrestricted schemes
**Evidence:** `src/components/apex/sales-agent.tsx:31,49` renders LLM-generated markdown links. React blocks `javascript:` at runtime, but `data:`, legacy `vbscript:`, and arbitrary `https://` phishing URLs render unchallenged.
**Risk:** Prompt-injected chat response can place a "click here" link pointing at attacker-controlled or data-URI payload directly in the storefront.
**Fix:** Add scheme + host allowlist in the link renderer — allow `/` (internal), `mailto:`, and `https://` to a known-good host list.
**Effort:** ~20 min.

---

## HIGH — Operator action required (not code blockers, but cannot launch without)

### 5. Live Stripe price IDs not provisioned
**Evidence:** `src/app/api/checkout/route.ts:22-27` refuses sessions with placeholder values.
**Action:** Run `pnpm stripe:setup` against a `sk_live_*` key. Copy emitted price IDs into Vercel project env. Configure `/api/stripe/webhook` endpoint in Stripe dashboard with the live `whsec_*`.

### 6. Resend SPF/DKIM unverified
**Evidence:** `src/lib/email.ts:17` falls back to `onboarding@resend.dev`.
**Action:** Verify `apexsites.com` in Resend dashboard, add SPF + DKIM DNS records, switch `RESEND_FROM_EMAIL` to `hello@apexsites.com`.

### 7. No global Anthropic cost cap
**Evidence:** `src/lib/chat/rate-limit.ts:13` is a process-local in-memory limiter — scaled-out Vercel functions multiply the effective ceiling. No spend alarm wired.
**Action:** Set a monthly hard cap on the Anthropic console for the production key. Swap rate-limiter to Upstash Redis when traffic warrants (post-launch acceptable if cap is set).

---

## MEDIUM (deploy OK, fix within a week)

- **No rate-limit on session-bearer endpoints** (`/api/upload/sign`, `/api/onboarding/status`, onboarding server actions). A leaked Stripe session_id = full worksheet write access. Mitigation: the leak window is short and inboxes are owner-only, but worth hardening.
- **RLS is "enabled, no policies"** — works today because every server path uses the service-role key, but a single regression (accidentally importing the anon client server-side, or a new public route) reads the whole `sites`/`customers` table. Add explicit `using (false)` deny-all policies as defence-in-depth.
- **`.env.production.example:80-91`** labels Cloudflare/Vercel/Admin vars as "Future — not currently consumed" — they ARE consumed by `src/lib/provisioning/{cloudflare,vercel}.ts`. Misleading for the operator filling in env.
- **`.env.local:38` lists stale `VERCEL_TEMPLATE_PROJECT_ID`** (orchestrator uses `VERCEL_PROJECT_ID`). Local-only confusion.
- **Client-forged chat history** — the chat endpoint trusts the conversation array from the client. A long forged history can balloon prompt size / cost. Cap conversation length server-side.

---

## LOW (post-launch, see `docs/post-launch-todo.md`)

- No Sentry wired (acceptable for launch; recommended before ~50 active sites).
- `invoice.payment_failed` + `charge.refunded` Stripe handlers not implemented (documented).
- `/api/onboarding/status` is unauthenticated by design — documented at the route.
- Health check key prefix, Resend default sender, in-memory Map leak (rate limiter) — all in AI sub-report.

---

## Explicitly REJECTED finding

The launch-readiness agent recommended `git rm src/components/apex/home/partner-axon-growth.tsx`. **Override: keep it.** Per operator decision 2026-05-21, the component is intentionally preserved (tree-shaken since it has no imports) so the Axon Growth cross-sell can be re-mounted later. Restore steps in `docs/axon-growth-restore.md`.

---

## Minimal commit set to ship

1. **`feat(security): production response headers`** — add `headers()` to `next.config.ts` (BLOCKER 1)
2. **`fix(security): timing-safe secret comparison`** — `crypto.timingSafeEqual` in 2 routes (BLOCKER 2)
3. **`fix(content): restrict media URLs to Supabase host`** — tighten `MediaSchema` (BLOCKER 3)
4. **`fix(chat): allowlist link schemes in sales-agent renderer`** — scheme + host allowlist (BLOCKER 4)
5. *(optional)* `chore(env): correct .env.production.example labels` (MEDIUM)

Estimated total dev time: **~1.5 hours** including testing.

After commits land, operator runs the LAUNCH-CHECKLIST.md sections that require human credentials (Stripe live, Resend DNS, Anthropic cost cap), then deploys to Vercel.

---

## Day-1 monitoring punch list

Watch for the first 48 hours after deploy:
- Stripe Dashboard → Events → look for `signature_verification_failure` (would indicate webhook secret drift)
- Vercel function logs → search `provisioning_failed` (orchestrator alerts via Slack already, but eyeball too)
- Anthropic console → daily spend (the rate-limit is process-local, real cap is the dashboard limit)
- Slack #alerts → checkout success, provisioning failures, webhook failures
- Resend dashboard → bounce + spam rate on first transactional emails
- Manual smoke: complete one real subscription checkout end-to-end on day 1 with a test domain
