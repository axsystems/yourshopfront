# Launch audit — AI + automation surface

Branch: `redesign`. Date: 2026-05-21. Read-only audit, no code changes.

## 1. AI surface inventory

Only one LLM caller (grep `anthropic|openai|claude-|gpt-|streamText|generateText` → 3 files, all chat). No image/video/voice models.

| File | Model | Cache | max_tokens | Validation | Auth |
|---|---|---|---|---|---|
| `src/app/api/chat/route.ts:12` | `claude-haiku-4-5-20251001` | `cache_control: ephemeral` on system block (`:92`) | 800 (`:13`) | Zod `RequestSchema` (`:21`); 12-turn cap | IP rate-limit, no bearer |
| `src/app/api/chat/health/route.ts` | diag only | — | — | — | none |

**Cost.** Haiku 4.5 = $1/MTok input ($0.10 cached) / $5/MTok output. With max_tokens=800 and 12 turns × 4000 chars (~12k input tokens) + cached system prompt: ~$0.0055/turn cold, ~$0.001/turn warm. Matches `system-prompt.ts:6`. Cache wiring verified.

**System prompt post-Axon-removal:** grep for `axon|growth` in `system-prompt.ts` returns zero hits. Markdown sections intact (Who you talk to, What Apex sells, 30 designs, Color variants, Self-serve, How to respond, Tone). Dynamic catalog block at `:12-20` is the only template interpolation; sourced from typed theme registry. Safe.

**Tool use:** none. `messages.stream` at `route.ts:83-96` has no `tools` param.

## 2. Background automation inventory

| Endpoint | Trigger | Auth | Idempotent? | Failure mode | Alerting |
|---|---|---|---|---|---|
| `POST /api/stripe/webhook` (`src/app/api/stripe/webhook/route.ts:42`) | Stripe | HMAC via `constructEvent` (`:56`) | YES — `getSiteByStripeSessionId` guard (`:80`) + `sites.stripe_session_id` UNIQUE (`migrations/0001:38`) | 500 → Stripe retries | console only |
| `GET /api/cron/provision` (`src/app/api/cron/provision/route.ts:24`) | Vercel cron `* * * * *` (`vercel.json:4`) | `Bearer CRON_SECRET` (`:30-33`) | YES — `transitionStatus` CAS (`orchestrator.ts:68`); DNS/Vercel steps gated on `state.dns.complete` / `state.vercel.complete` (`orchestrator.ts:82,101`); Vercel 409 treated as success (`vercel.ts:62-63`) | `markFailed` + Slack ping (`orchestrator.ts:141-148`); no retry for `failed` sites | Slack on every failure |
| `POST /api/upload/sign` (`src/app/api/upload/sign/route.ts:33`) | Browser | Stripe session_id as bearer (`:53`); `status === "pending_content"` gate (`:64`) | Each call mints new path UUID (`storage.ts:87`); idempotent in the sense of "no collisions" | 400/500 JSON; no retry | console only |
| `POST /api/contact` (`src/app/api/contact/route.ts:19`) | Browser | none | N/A (best-effort fan-out) | `Promise.allSettled` swallows | Slack on success only |
| `POST /api/checkout` (`src/app/api/checkout/route.ts:30`) | Browser | none | Pre-generates `site_id` UUID (`:62`); Stripe session created fresh on every retry → multiple unused sessions possible, but no duplicate row until webhook fires | 400/500 JSON | console only |
| `POST /api/provisioning/approve` (`src/app/api/provisioning/approve/route.ts:32`) | Admin | `Bearer ADMIN_PASSWORD` (`:40-43`) | YES — CAS `transitionStatus("awaiting_approval","live")` (`:69`) | 409 if state changed; ops re-runs | Slack |
| `GET /api/onboarding/status` (`src/app/api/onboarding/status/route.ts:21`) | Browser poll | none (UUID-keyed read) | read-only | 404/500 JSON | none |
| `GET /api/og/[slug]` (`src/app/api/og/[slug]/route.tsx:72`) | Browser | none | read-only; fetches Fontsource per call | falls back to system font | none |
| Server actions `src/app/onboarding/(worksheet/)actions.ts` | Browser | Stripe session_id bearer; `status==="pending_content"` gate (`actions.ts:85`, `worksheet/actions.ts:92`) | YES — patch-then-write JSONB; idempotent per section | returns `{ok:false,error}` | none |

## 3. Findings (severity-ranked)

### CRITICAL — none

### HIGH

**H1. Chat has no global cost cap; rate limit is process-local in-memory.**
`route.ts:18` allows 4000 chars/msg; `:22` caps at 12 turns. The IP limiter at `src/lib/chat/rate-limit.ts:13` admits in its own comment (`:8-10`) that *each lambda has its own counter* — on a scaled-out fleet, effective limit is 10 × N instances per IP per minute. No daily kill switch, no global token meter, no per-session cost cap. **Set an Anthropic monthly hard limit on the dashboard before launch; swap to `@upstash/ratelimit` for cross-instance enforcement.**

**H2. Chat output renders any URL scheme in Markdown links.**
`src/components/apex/sales-agent.tsx:31` regex `/\[([^\]]+)\]\(([^)]+)\)/g`. The only protocol check is `href.startsWith("/")` (`:49`); everything else becomes `<a href={href} target="_blank">`. React blocks `javascript:` at runtime since 16.9, so direct XSS is unlikely, but `data:text/html`, legacy `vbscript:`, and arbitrary `https://` phishing URLs render unchallenged. A prompt-injected or jailbroken model response can plant clickable malicious links. **Add an allowlist: accept `/...` or `https://apexsites.com/...`; for anything else, render the label as plain text.**

**H3. `ADMIN_PASSWORD` is a single shared bearer with no audit log.**
`src/app/api/provisioning/approve/route.ts:33-43`. Comment (`:30`) calls it "a launch shortcut." Fine, but: no rate-limit, no DB audit row (only Slack ping), no rotation policy. Before launch: write a `provisioning_audit` row on every approve, queue rotation in post-launch TODO.

### MEDIUM

**M1. `/api/contact` has no rate-limit or captcha** (`src/app/api/contact/route.ts:19`). Fans out to Resend + Slack on every POST. Both are best-effort so no crash, but the ops channel can be flooded. Add IP rate-limit or Turnstile.

**M2. `/api/checkout` is unauthenticated and unrate-limited** (`src/app/api/checkout/route.ts:30`). Stripe sessions are free, but a scraper can burn the 100/sec `checkout.sessions.create` ceiling. Low pre-launch risk; cap once live.

**M3. `/api/upload/sign` Stripe session_id validation is loose.** `route.ts:26` accepts any length-20–200 string. Tighten to `^cs_(test|live)_[A-Za-z0-9]+$` to stop timing-based enumeration.

**M4. Chat history is client-supplied verbatim.** `sales-agent.tsx:184-188` POSTs the localStorage-stored history. A hostile client can forge `assistant`-role turns to anchor the model ("Previously you offered 100% off…"). System prompt rules at `system-prompt.ts:53-55` cover pricing/disclosure loosely. Known limitation; flag as non-binding in support.

**M5. No Anthropic spend alarm.** Nothing wires usage callbacks or daily limits. Set a hard monthly cap on the Anthropic dashboard before launch.

### LOW

**L1.** `pruneExpired()` runs on 5% of chat requests (`route.ts:58`). Map leak negligible; resolves with Upstash migration.
**L2.** `/api/onboarding/status` is `force-dynamic`, unauthenticated. UUID enumeration impractical, but polling burns Supabase RPCs. Add `s-maxage=10` or move to Realtime post-launch.
**L3.** `/api/chat/health:17` returns `key.slice(0,10)` — leaks the stable `sk-ant-api03-` prefix (~0 bits). Either gate behind admin auth or drop `keyPrefix`.
**L4.** Resend `from` defaults to `onboarding@resend.dev` (`src/lib/email.ts:17`). Hurts deliverability. Set `RESEND_FROM_EMAIL` once `apexsites.com` DNS is verified.

## 4. Bottom line

System prompt cleanly re-loads after Axon Growth removal. Prompt cache is correctly wired. Webhook + cron idempotency is solid (CAS guard + UNIQUE constraint + Vercel-409-as-success). The two real launch blockers are **H1 (no global cost cap on the public chat)** and **H2 (chat link renderer accepts any URL scheme)**. Everything else is queued for the post-launch hardening pass.
