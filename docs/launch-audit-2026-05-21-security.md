# Security Audit — apex-sites (branch: redesign)

Date: 2026-05-21 · Scope: production launch on apexsites.com · Read-only

Legend: **[P]** = proven (rule violation, contradiction, verifiable vuln). **[I]** = inferred (best-practice / defense-in-depth).

---

## CRITICAL

### VULN-001 [P] — Missing security response headers (CSP, HSTS, X-Frame-Options, Referrer-Policy)
`next.config.ts:7-11` defines no `headers()` function. `src/proxy.ts:22-53` returns `NextResponse.next()` / `rewrite()` without setting any headers. `vercel.json` has only the cron entry.

Impact: tenant subdomains render customer-supplied copy and image URLs with no CSP, no HSTS, no `X-Frame-Options`. A fraudulent customer who completes a worksheet can frame their tenant site, set up clickjacking against `apexsites.com`, or use the path as a phishing landing page that doesn't get downgrade-blocked by HSTS.

Fix: add `async headers()` to `next.config.ts` returning at minimum `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `X-Frame-Options: SAMEORIGIN` (or CSP `frame-ancestors 'self'`), `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`. Add a CSP that allows `'self'`, `https://*.supabase.co` (images), Stripe origins for `/checkout`, and Anthropic for the chat stream.

---

## HIGH

### VULN-002 [P] — `ADMIN_PASSWORD` bearer compared with `!==` (timing leak)
`src/app/api/provisioning/approve/route.ts:41` — `if (auth !== \`Bearer ${expected}\`)`. Direct string equality is not constant-time. The endpoint flips a site to `live` (irreversible state + customer email + Slack); an attacker who can measure latency across thousands of requests can recover the password byte-by-byte.

Same issue at `src/app/api/cron/provision/route.ts:31` for `CRON_SECRET`.

Impact: with weak/rotated-once secrets, this is the difference between “unguessable” and “discoverable in minutes against a poorly defended endpoint.” The approve endpoint is the most sensitive non-Stripe surface in the app.

Fix: use `crypto.timingSafeEqual` on equal-length `Buffer`s after a length check. Reject early when lengths differ (without short-circuit).

### VULN-003 [P] — Stripe-session bearer `getSiteByStripeSessionId` does direct equality, no rate limit
`src/lib/supabase.ts:213-223` filters `sites` by `eq("stripe_session_id", …)`. The session_id acts as a bearer token across `/api/upload/sign`, `/api/onboarding/status`, the worksheet server action, and `setDomain`. None of these endpoints rate-limit (chat does, this surface does not). Brute-forcing a Stripe session id is impractical due to entropy, but enumeration of leaked ids from referrer headers or shared support tickets gives the holder full write access to a customer's worksheet + uploads until status leaves `pending_content`.

Impact: anyone with a leaked `session_id` URL (e.g. forwarded onboarding email, screenshot in a Slack thread, browser history on a shared computer) can overwrite hero copy, services, gallery URLs on that customer's site before launch.

Fix: rate-limit per-IP on these 4 routes (chat's `rate-limit.ts` is a fine pattern), and shorten the write window — auto-promote `pending_content → ready_to_build` 24h after the last save, not just on “all-complete.”

### VULN-004 [P] — Public Storage bucket + `unoptimized` Image + no host allowlist on customer media URLs
`supabase/migrations/0005_storage_bucket.sql:23-39` makes `site-assets` public. `MediaSchema` (`src/lib/site-content/schema.ts:98-102`) accepts any `z.string().url()` — there is no constraint that `logoUrl` / `heroUrl` / `gallery[]` resolve to the Supabase bucket. `customer-gallery.tsx:32-40` and `customer-hero.tsx:123-131` render with `<Image unoptimized src={url} />`, so arbitrary off-domain URLs are loaded into the tenant page.

Impact: a customer (or anyone holding a session_id, see VULN-003) can pin a tracking pixel / off-domain image to a live tenant subdomain. Combined with missing CSP (VULN-001), this is also a stored-content-injection vector — `<img src>` exfiltrates referrer/cookies via headers (request smuggling against a malicious origin).

Fix: in `saveWorksheetSection` (or `MediaSchema`), reject any URL whose host is not the Supabase project's public-storage host. Reject `data:` / `blob:` / `javascript:` schemes explicitly. Alternatively, store only the bucket-relative path and reconstruct on render.

### VULN-005 [P] — Service-role Supabase client used everywhere; no defence-in-depth RLS policies on `customers`/`sites`
Migrations 0001-0004: `alter table … enable row level security;` is declared but no policies are added. The comment in 0001 (lines 11-15, 71-77) treats “service-role bypass + no policies” as the security posture. That works only as long as every server path uses the service-role client correctly.

`src/lib/supabase.ts:157-170` is the only client — service-role, server-only. Good.

But there is no `WITH CHECK` ownership policy that would catch a future code path mistakenly using the anon key, or a future cross-tenant data leak. A single regression that exposes the service-role client (or swaps to anon) yields full table access.

Impact: blast radius of any future misuse is the whole `customers`/`sites` table.

Fix [I]: keep service-role bypass, but add `create policy "deny all" on sites for all to anon, authenticated using (false) with check (false);` (same on customers). The current "no policies" posture is functionally identical for RLS, but explicit-deny makes intent unmistakable and audit-friendly. **Not blocking launch** — current setup is correct, this is hardening.

---

## MEDIUM

### VULN-006 [P] — Stripe webhook handler returns 500 on DB errors, which Stripe retries — but `idempotency` only protects `checkout.session.completed`
`src/app/api/stripe/webhook/route.ts:165-190` (`handleSubscriptionDeleted`) calls `updateSiteStatus(siteId, "cancelled")` then `sendGoodbyeEmail`. If the email send transient-fails inside `Promise.allSettled` it won't throw, good — but if `updateSiteStatus` throws (e.g. site already cancelled by ops), the outer `catch` returns 500 and Stripe retries, causing duplicate goodbye emails on the next attempt (the status check is not gated by an "if already cancelled, return" guard like `handleSessionCompleted` has at lines 80-86).

Impact: customers receive duplicate "cancelled" emails on Stripe retry storms.

Fix: read the site first, return early if `site.status === 'cancelled'`. Mirror the idempotency-guard pattern from `handleSessionCompleted`.

### VULN-007 [P] — `/api/onboarding/status` leaks `failure_reason` to any session_id holder
`src/app/api/onboarding/status/route.ts:39-43` returns `failure_reason` keyed by `site_id` (a UUID, not a session_id) with no auth. The comment at lines 14-20 argues UUIDs are unguessable. True for random discovery; but `failure_reason` is a free-text field written by `markFailed` in `provisioning/orchestrator.ts:138-141` with `err.message`. That can include Cloudflare/Vercel API error bodies, which may include internal hostnames, partial tokens, or path information useful to attackers who already hold the site_id.

Impact: information disclosure to anyone who knows a site UUID.

Fix: strip `failure_reason` from this endpoint's response, or replace with a fixed "We had a hiccup — ops notified" string. Keep the detail in Supabase / Slack for ops eyes only.

### VULN-008 [P] — Chat rate limiter trusts raw `x-forwarded-for` first hop
`src/app/api/chat/route.ts:25-31` reads `x-forwarded-for` and uses `.split(",")[0]`. Behind Vercel this is correct (Vercel strips client-supplied XFF). But the comment at `rate-limit.ts:7-11` notes "process-local" buckets — an attacker can spoof XFF in dev/staging and the rate limit ignores them in dev. Low risk in production on Vercel; verify the deployment platform actually strips client-supplied XFF.

Fix [I]: in production read `req.headers.get("x-vercel-forwarded-for")` (Vercel-trusted), or import `ipAddress` from `@vercel/functions`.

### VULN-009 [I] — `console.log` of full Stripe event body on every webhook
`src/app/api/stripe/webhook/route.ts:62` logs `event.type` + `event.id`. Fine. But `route.ts:73` logs the whole `err` on handler failure, and the handler holds `session.metadata` (customer email, phone, business name). In Vercel logs these become PII at rest. Confirm log retention complies with whatever privacy policy `apexsites.com/privacy` advertises.

Fix: scrub email/phone before logging, or restrict log retention.

### VULN-010 [I] — `current_website_url` accepted with no host validation; not yet fetched server-side
`src/lib/checkout-schema.ts:36-41` accepts any URL up to 500 chars. Currently stored only — never fetched server-side (verified via grep across `/src`). Pre-emptive note: if anyone adds a server-side `fetch(site.current_website_url)` for screenshotting / preview, that becomes an SSRF surface (no host allowlist, no protocol restriction beyond `z.url()`). Add a checklist item to require host validation before any such fetch lands.

---

## LOW

### VULN-011 [P] — `/dev/themes` gate uses `notFound()` at render time
`src/app/dev/themes/page.tsx:16` — `if (process.env.NODE_ENV === "production") notFound()`. Correct, but `force-static` at line 7 means the gate runs at build time. On a Vercel production build `NODE_ENV` is `"production"` so the page is built as a static 404. Confirmed safe — flagging only because the same pattern in a `force-dynamic` page would re-evaluate per-request, which is the more conservative choice for future copy-paste.

### VULN-012 [I] — `sanitizeFilename` clamps to 80 chars but doesn't enforce a max post-`replace` length when input is all-stripped chars
`src/lib/storage.ts:108-116`. After stripping path-traversal chars an attacker-controlled `filename` like `"...../../../"` becomes `""` then falls back to `"file"`. Safe. Worth noting that path traversal is fully blocked because the `path` is built as `${siteId}/${kind}/${randomUUID()}-${safe}` and Supabase Storage rejects `..` in object paths server-side regardless.

### VULN-013 [I] — Approve endpoint logs `site.business_name` in Slack on flip
`src/app/api/provisioning/approve/route.ts:84-91`. Fine for Slack (private channel), but `notifySlack` would also leak this to anyone with the webhook URL. Confirm `SLACK_WEBHOOK_URL` is in a private channel and rotated.

### VULN-014 [I] — `.env.local` contains a live-looking `ANTHROPIC_API_KEY`
`/.env.local:49` — `sk-ant-api03-…`. Verified: `.gitignore:34` covers `.env*` and `git ls-files` returns only `.env.example` + `.env.production.example`. **Key is not in git history.** Rotate anyway if `.env.local` was ever shared (Slack DM, screenshare, email) before launch — assume compromised if uncertain.

### VULN-015 [I] — Public Resend `RESEND_FROM_EMAIL=Apex Sites <onboarding@resend.dev>` in `.env.local`
That's a Resend dev/sandbox sender. Replace with a verified `apexsites.com` sender before launch or transactional mail will land in spam (and SPF/DKIM/DMARC won't pass on the apex).

---

## Confirmed safe / no finding

- Stripe webhook signature is verified BEFORE any work (`route.ts:53-60`), uses raw `req.text()` (not `req.json()`) so HMAC isn't mutated, returns 400 on bad sig with generic "Invalid signature" message (no detail leak), and idempotency guard via `getSiteByStripeSessionId` at lines 80-86 plus the `stripe_session_id unique` constraint at `0001_initial.sql:38`. **Solid.**
- Service-role key (`SUPABASE_SERVICE_ROLE_KEY`) is referenced only at `src/lib/supabase.ts:160`. The file declares `import "server-only"` at line 1. `next.config.ts` has no `env`/`publicRuntimeConfig` exposure. No `NEXT_PUBLIC_` prefix anywhere on the service role. Zero client-bundle exposure.
- JSON-LD rendering at `src/components/json-ld.tsx:14-49` properly escapes `<`, `>`, `&`, U+2028, U+2029.
- `sanitizeHref` (`customer-hero.tsx:240-252`) blocks `javascript:`, `data:`, `vbscript:` schemes on CTA hrefs. Good.
- Supabase Storage upload signing (`src/lib/storage.ts:66-102`) enforces MIME allowlist, 10MB cap, UUID-prefixed paths, filename sanitization. Service-role client never reaches the browser.
- All API routes that accept POST bodies use Zod `safeParse` at the entry: checkout, contact, chat, upload/sign, provisioning/approve. Worksheet + onboarding server actions do the same. No raw-body trust paths found.
- Cron + admin endpoints check their bearer secret before any work (just not timing-safe — see VULN-002).
- `proxy.ts` host parsing safely lower-cases and splits on `:`; no host-header injection into rewritten URLs.

---

## Summary

- Critical: 1 · High: 4 · Medium: 5 · Low: 5
- Overall Risk: **HIGH** (driven by missing security headers + customer-content open-redirect-style URL acceptance + bearer-token timing)
- Deploy Ready: **CONDITIONAL** — fix VULN-001 (headers), VULN-002 (timing-safe compare), VULN-003 (rate-limit session-bearer endpoints), VULN-004 (MediaSchema host allowlist) before exposing apexsites.com publicly. Everything else can ship and be patched within a week.
