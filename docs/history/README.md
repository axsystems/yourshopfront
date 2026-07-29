# docs/history — archived point-in-time documents

Everything in this folder was **true when it was written** and is kept as the audit trail.
**None of it is current state.** The canonical current-state doc is `PROJECT-STATE.md` at the
repo root (`CLAUDE.md` is the cold-start hub, `LAUNCH-CHECKLIST.md` is the go-live gate,
`docs/post-launch-todo.md` is the deferred-work list).

Archived 2026-07-29. Nothing here was rewritten: each file got a dated HISTORICAL banner at
the top and nothing else.

## Index

| Doc | What it was | Superseded by |
| --- | --- | --- |
| `APEX-AUDIT.md` | 2026-05-04 read-only discovery and baseline audit, taken before the redesign started. Inventories the codebase at 24 themes / 13 route files / 2 migrations / no tests / no CI. | `PROJECT-STATE.md` + `README.md` |
| `REDESIGN-PLAN.md` | 2026-05-04 plan for the 7-phase Apex Sites redesign, written before any of it shipped. | `REDESIGN-REPORT.md`, then `PROJECT-STATE.md` |
| `REDESIGN-LOG.md` | Append-only execution log of that redesign (phases 1-7 plus 6.5 and 6.6), finished 2026-05-05. | `PROJECT-STATE.md` |
| `REDESIGN-REPORT.md` | Final sign-off handoff for the redesign, 2026-05-05, including the 11-item pre-launch human-action list and the bundle-size table. | `PROJECT-STATE.md` + `LAUNCH-CHECKLIST.md` |
| `launch-audit-2026-05-21.md` | Top-level verdict of the four-part pre-launch audit: NO-GO until 4 blockers. All 4 were fixed before launch. | `PROJECT-STATE.md` |
| `launch-audit-2026-05-21-launch-readiness.md` | Sub-report: build gates, env hygiene, Stripe correctness, provisioning, customer surface, observability. | `PROJECT-STATE.md` |
| `launch-audit-2026-05-21-ai-automation.md` | Sub-report: chat agent, prompt cache, cost caps, background-automation idempotency. | `PROJECT-STATE.md` |
| `launch-audit-2026-05-21-security.md` | Sub-report: RLS, response headers, timing-safe compare, input validation (VULN-001 through VULN-015). | `PROJECT-STATE.md` |

Still-live reference docs that were deliberately **not** archived: `docs/axon-growth-restore.md`
(describes a currently-true un-mount and the exact edits to reverse it), `docs/BUNDLE-PLAN.md`,
`docs/phase-4-test-plan.md`, `docs/post-launch-todo.md`, `docs/marketing-launch-playbook.md`,
`docs/demos-photo-credits.md`.

## Findings from these audits that were STILL OPEN on 2026-07-29

Re-verified by reading current `master` source on 2026-07-29. These were raised in the archived
audits and have **not** been fixed, so they must not disappear with the archive. Their long-term
home is `docs/post-launch-todo.md` or `PROJECT-STATE.md`, not this folder.

### Correctness / data integrity

- **VULN-006 (security sub-report) — duplicate cancellation emails on Stripe retry.**
  `src/app/api/stripe/webhook/route.ts` `handleSubscriptionDeleted()` still has **no
  already-cancelled early return**, unlike `handleSessionCompleted()` which guards on
  `getSiteByStripeSessionId`. Any throw after `updateSiteStatus` (or a Stripe retry storm)
  re-sends `sendGoodbyeEmail` and re-posts the Slack ping. Now live-money code.
- **`.env.production.example` still mislabels the provisioning vars** (launch-readiness M3).
  Lines 80-92 sit under `# Future (Phase 5+ provisioning) — not currently consumed`, but
  `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`, `VERCEL_API_TOKEN`, `VERCEL_TEAM_ID` and
  `ADMIN_PASSWORD` **are** consumed today by `src/lib/provisioning/*` and the cron route. The
  same block still lists `VERCEL_TEMPLATE_PROJECT_ID`, which appears nowhere in the code
  (`VERCEL_PROJECT_ID` is the real name). An operator provisioning from this file leaves
  provisioning dead.

### Security

- **VULN-005 — no deny-all RLS policies on `sites` / `customers`.** RLS is enabled with zero
  policies on those tables (only `0005_storage_bucket.sql` and `0010_edit_requests.sql` declare
  any policy). Correct today because every path uses the service-role client, but one anon-key
  regression exposes both tables whole. The audit called this hardening, not a blocker.
- **VULN-003 (partial) — the onboarding session-id bearer path is still unrate-limited.**
  `src/app/api/upload/sign/route.ts` rate-limits only the `kind: "edit-request"` branch
  (per authed customer). The `logo | hero | gallery` branch, keyed on a Stripe `session_id`,
  has no limiter, and neither do `/api/onboarding/status` nor the worksheet server actions.
- **VULN-007 — `/api/onboarding/status` still returns `failure_reason` unauthenticated.**
  That field is written by `markFailed()` from a raw `err.message`, so Cloudflare/Vercel API
  error bodies can reach anyone holding a site UUID.
- **AI M2 — `/api/checkout` has no rate limit.** It is the only unauthenticated POST that mints
  real Stripe sessions and it is now on a live-mode key. `/api/contact`, `/api/access`,
  `/api/chat`, `/api/refund-request`, `/api/billing-portal*` and `/api/checkout/copy-upgrade`
  all gained `checkRateLimit`; checkout did not.
- **AI H3 — `/api/provisioning/approve` has no rate limit and writes no audit row.** It is
  timing-safe now, but a single shared `ADMIN_PASSWORD` bearer flips a site to `live`, and the
  only trace is a Slack message.
- **AI H1 / M5 — the rate limiter is still process-local in-memory** (`src/lib/chat/rate-limit.ts`),
  so the effective ceiling is `limit x instance count`. Whether the Anthropic monthly hard cap
  was ever set on the dashboard cannot be verified from this repo. Confirm it.
- **VULN-009 — the webhook catch block still logs the whole error object**
  (`console.error("[webhook] handler threw", err)`), and the handler scope holds
  `session.metadata` (customer email, phone, business name). That is PII at rest in Vercel logs.
- **VULN-014 — rotate `ANTHROPIC_API_KEY` if `.env.local` was ever shared.** The key was never
  in git history; the advice was precautionary and was never confirmed done.

### Launch / content

- **Sentry is still not wired** (launch-readiness L1). `src/app/api/refund-request/route.ts` and
  `src/app/api/billing-portal/route.ts` both carry `// Sentry is not yet installed in this repo`
  comments. The audit put the threshold at roughly 50 active sites.
- **Legal copy was never lawyer-reviewed, but the draft banner is gone.** `REDESIGN-REPORT.md`
  §5.4 item 1 said the AI-drafted privacy/terms/refund copy must not ship as final and gated it
  behind `<LegalPage draft>`. The `draft` prop is no longer passed by
  `src/app/{privacy,terms,refund-policy}/page.tsx`, so that copy is now published as final terms
  on a site taking live payments. The governing-law clause reads "the state in which Axon Labs
  LLC is registered" rather than naming one.
- **Lighthouse was never measured** (`REDESIGN-REPORT.md` §5.5). Targets were 90 mobile on every
  page except `/portfolio` at 85. No measurement exists anywhere in the repo, and the site is
  now live.
- **No real customer testimonials or case studies** (§5.4 item 4). Verified 2026-07-29: there is
  no testimonial surface anywhere in `src/`. The home stat strip is truthful-by-construction
  (it replaced the invented "4.9 / 47 Google reviews" metrics), so this is a conversion gap, not
  a truthfulness problem. §5.4 item 3 (placeholder `/about` copy) is **done** and item 2
  (`[TBD]` governing-law clause) is **partly done** (see the legal item above).
