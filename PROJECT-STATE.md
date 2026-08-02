# Project State — Your Shopfront

**Last updated:** 2026-08-01 (MST)
**Live:** https://yourshopfront.com · **Repo:** axsystems/yourshopfront · **Branch:** `master`
**Vercel project:** `yourshopfront` (axsystems-projects) · **Supabase ref:** `vszlrvczfpgwdenmsfvx`
(verified 2026-07-29 via `supabase projects list` — project `your-shop-front`, ACTIVE_HEALTHY, us-east-2)

Sister docs — do not duplicate these, update them:
`CLAUDE.md` (cold-start hub + hard rules) · `LAUNCH-CHECKLIST.md` (go-live gate) ·
`README.md` (architecture) · `docs/marketing-launch-playbook.md` (day-1 sales) ·
`docs/post-launch-todo.md` (deferred work) · `docs/history/` (archived records).

---

## Status table

| Area                | State          | Evidence (2026-07-30 unless noted)                                                                                                    |
| ------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Marketing site      | **LIVE**       | `/`, `/pricing`, `/start`, `/portfolio` all HTTP 200                                                                                  |
| Demos               | **LIVE**       | all 15 trade demo slugs HTTP 200; 30 registered themes                                                                                |
| Stripe checkout     | **LIVE MODE**  | `POST /api/checkout` returns a `cs_live_` session on the $99 promo path                                                               |
| $99-today offer     | **LIVE**       | live `POST /api/checkout` promo path returns `amount_total: 9900` (2026-07-31). Was $198 until PR #89                                 |
| Analytics integrity | **FIXED**      | PR #88 — 84% of all pageviews were the homepage's own preview iframes. Re-verified in production: 5 iframes mounted, 0 tracker calls  |
| Referral tracking   | **VERIFIED**   | full end-to-end re-verification 2026-07-30 — see "Referral attribution" below                                                         |
| Production schema   | **CURRENT**    | all 13 migrations (`0001`–`0013`) re-verified column-by-column against live schema 2026-07-30                                         |
| Provisioning cron   | **ARMED**      | `/api/cron/provision` returns 401 unauth → `CRON_SECRET` set                                                                          |
| Sales chat bubble   | **CONFIGURED** | `/api/chat` returns 400 on empty body (not 503) → `ANTHROPIC_API_KEY` set                                                             |
| SEO                 | **LIVE**       | `robots.txt` 200; `sitemap.xml` **39** `<loc>` entries incl. `/start` (was 38 and missing it until PR #100)                          |
| CI                  | **GREEN**      | `lint-and-typecheck` ~35s, `build-and-smoke` ~1m35s                                                                                   |
| OG preview image    | **FIXED**      | `og-v3.png` 200; every share previewed "Apex Sites / $499 setup" until 2026-07-30                                                     |
| Google Analytics    | **WORKING**    | collecting only since PR #84 (`f91ea8b`). #82 unblocked the CSP but the inline script still failed to parse — see below               |
| Vercel Analytics    | **WORKING**    | loads from an obfuscated same-origin path; `'self'` covers it. Was never broken                                                       |
| PostHog replay      | **ENABLED**    | project toggle switched on; `config.js` now returns a `sessionRecording` object (`recorderVersion: "v2"`), not `false`                |
| Transactional email | **PARTIAL**    | Resend delivers everywhere except `hello@` → `hello@`; see "Email deliverability"                                                     |
| Sales               | **ZERO**       | **1 paid Your Shopfront session ever** — a $10 self-test on 2026-05-22, now `cancelled`. See "Stripe account reality" below           |
| Real traffic        | **18 people**  | not 72. Every `/demos/*` view on record was an iframe embed — no human has opened a demo page. See "What the funnel data says"        |

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

**Re-verified end to end 2026-07-30** against current master, in a real browser (the cookie is
written client-side by `src/lib/referral.ts`, so a plain HTTP fetch shows no `Set-Cookie` — that
is expected, not a fault). Confirmed: `ysf_ref`/`ysf_src` set with 30-day expiry; first-touch
survives a second visit with a different `ref`; invalid `ref` rejected client-side _and_ by the
API (`400`); `ref`/`src` reach Stripe session metadata across **all four** checkout paths
(subscription+promo, one-time+hosting, one-time alone) and all three of Payton's channels.

Still unproven: the webhook's write of `sites.referral_code` has never executed, because no real
purchase has ever completed. Code path traced and correct, but unobserved — see BLOCKER 1.

P2 nit: `writeCookie()` in `src/lib/referral.ts:40` omits `Secure`. Minimal risk on an
HTTPS-only domain; worth adding.

## What shipped 2026-07-30

Nine PRs merged to production. Rollback for any: `git revert -m 1 <merge-sha>`.

| PR  | Merge     | What                                                                                                                |
| --- | --------- | ------------------------------------------------------------------------------------------------------------------- |
| #75 | `ce45a13` | OG preview image — showed "Apex Sites / $499 setup + $199/mo / $2,997 once" and a missing space in "book more jobs" |
| #76 | `c218f2d` | Welcome email hardcoded `$299 + $149/mo`, emailed to customers who paid **$99**                                     |
| #77 | `944596c` | `/checkout` order-summary cropped its own preview text on every viewport                                            |
| #79 | `f965176` | OG wordmark enlarged 32→52px; leftover Apex "A" mark removed                                                        |
| #80 | `f3a4662` | Privacy policy claimed no tracking cookies — false once GA4/replay went live                                        |
| #81 | `3b5e0de` | PostHog session replay, env-gated, inputs masked, disabled on `/app/*`                                              |
| #82 | `66ebda8` | CSP unblocked GA4 + credential-safe same-origin PostHog proxy                                                       |
| #78 | `1e8c648` | Price-string sweep — `seo.ts`, FAQ, `pricing`, `terms`, `refund-policy`, `app/billing`, `hero.tsx`                  |
| #84 | `f91ea8b` | `.trim()` on the GA4 / Google Ads env vars — the fix that actually made GA4 collect                                 |

**No open PRs remain.** #78 and #84 were test-merged together onto `master` before either landed:
`pnpm typecheck` and `pnpm build` both exit 0, 30 portfolio paths prerendered. Both verified live
after deploy — `/terms` and `/refund-policy` now state the standard _and_ promo figures, and the
production inline script reads `gtag('config', 'G-W1VNYD94V9')` with no trailing newline.

### The OG image was the highest-impact defect

`public/og-default.png` had not been regenerated since the phase-1 brand commit, so it diverged
from its own SVG source. **Every link shared to Facebook/TikTok/DM previewed dead pricing and the
retired brand name.** Output is now `og-v3.png` — the filename is rotated on every change because
Facebook caches OG images per URL and an in-place edit keeps serving the stale asset.

### The analytics finding

`script-src`/`connect-src` never allowed Google's origins, so **GA4 collected nothing for 66
days** despite being correctly configured. Verified by negative control against production.
Vercel Analytics was unaffected — it loads from an obfuscated same-origin path, so `'self'`
covered it, and it is the only source of visitor data for the period.

PostHog is proxied same-origin through `/ingest`. The obvious `rewrites()` implementation would
have forwarded `Cookie` and `Authorization` verbatim, and Supabase sets auth cookies at `path=/`
— every replay batch from a logged-in portal user would have carried their session tokens to a
third party. Caught with an echo server before deploy and replaced with a route handler that
rebuilds requests from a header allowlist.

**Session Replay is now ENABLED — resolved 2026-07-30.** For most of the day PostHog was deployed
but not recording: `/ingest` proxied correctly and `POST /ingest/flags/` returned a real 200, yet
no capture request was ever sent. The root cause was **a PostHog project setting, not code** —
`https://us.i.posthog.com/array/<token>/config.js` returned `"sessionRecording": false`, so
posthog-js took its discard path and never fetched `recorder.js`. No code change could start it
while that toggle was off.

The toggle has since been switched on. Re-verified against production: `config.js` now returns a
full `sessionRecording` object (`recorderVersion: "v2"`, endpoint `/s/`), and both
`/ingest/array/<token>/config.js` and `/ingest/static/recorder.js` return 200 through the
same-origin proxy. **Still unconfirmed:** that sessions actually land in the PostHog dashboard —
check there before treating replay as a working data source.

The `/ingest` proxy is _required_, not implicated: with `NEXT_PUBLIC_POSTHOG_HOST` pointed
directly at `us.i.posthog.com`, every `config.js` request is CSP-blocked, because
`us-assets.i.posthog.com` is deliberately absent from `script-src`.

### The `appendChild` SyntaxError was unrelated to PostHog

`NEXT_PUBLIC_GA4_ID` carries a **trailing newline** in Vercel. `src/lib/analytics-config.ts`
read it untrimmed and `src/components/google-tag.tsx` interpolates it into an _inline_ script,
producing `gtag('config', 'G-W1VNYD94V9\n');` — an unescaped line terminator inside a
single-quoted string, i.e. a parse error. Nothing in that inline script ran, which is also why
`window.gtag` was `undefined` while `dataLayer` still had entries (those come from the
separately-loaded external `gtag/js`, which is unaffected). Chromium surfaces it as
`Failed to execute 'appendChild'` because `next/script` sets the text and appends, and inline
scripts execute synchronously inside that native call.

The "six retries" were not retries: `src/components/apex/home/rotating-preview.tsx` mounts two
live `/demos/{slug}?embed=1` iframes at a time, each a full page load with its own analytics
components. Error and request counts multiply per iframe.

**Fixed and deployed as PR #84 (`f91ea8b`)** — `.trim()` on `GA4_ID`, `GOOGLE_ADS_ID`, and
`GOOGLE_ADS_CONVERSION_LABEL`. Confirmed against production after the deploy: all three GA4
references in the live HTML are clean (preload link, RSC payload, inline script), where before
the fix the loader URL read `gtag/js?id=G-W1VNYD94V9\n` and the inline call
`gtag('config', 'G-W1VNYD94V9\n')`.

**The important consequence: GA4 has collected nothing at all until now.** PR #82 unblocked the
CSP on 2026-07-30, but the inline script still failed to parse, so the measurement ID was never
registered. Collection starts from `f91ea8b`; the preceding ~66 days are permanently lost, and
**Vercel Analytics is the only visitor data that exists for that period.**

The stored Vercel value still carries the newline. `.trim()` covers every consumer in this app
(both the loader URL and the inline script read the same constant), so this is now hygiene rather
than a live bug — but any future consumer reading the raw env var would hit it again. Fixing it
needs an env edit plus a redeploy.

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
   live — the pay button was re-verified 2026-07-31 and `/api/checkout` returns a valid
   `cs_live_` session on every path — but the welcome email (Resend), onboarding worksheet, and
   provisioning handoff are not.

   **Note:** `docs/conversion-sprint-plan.md` opens by claiming this blocker was "closed
   2026-07-30". That is not supported by Stripe: of 26 lifetime Your Shopfront sessions,
   exactly one was ever paid (the $10 self-test in May). Treat this blocker as OPEN.
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

3. **SECURITY — rotate the Supabase JWT signing secret and the Resend SMTP password.**
   On 2026-07-30 an audit agent called the Supabase Management API config endpoints
   (`GET /v1/projects/{ref}/config/auth`), which **return both values in plaintext**. They were
   printed into a subagent transcript on the workstation. Not published externally, but the
   standing rule is that a secret read into a transcript needs rotating — and the JWT secret
   allows forging `authenticated`/`service_role` tokens.

   Rotation invalidates the anon + service_role keys, so it must be done as one change:
   Dashboard → Settings → API → JWT Settings → Generate new secret → copy new anon +
   service_role keys → update both in Vercel production → **redeploy** → update `.env.local`.
   With zero real customers the blast radius is nil; it will never be cheaper to do.

## Email deliverability (2026-07-30)

**Sending is healthy. Receiving at `hello@yourshopfront.com` is not.**

Established: Resend delivers from `hello@yourshopfront.com` to Gmail, to `admin@axsystems.io`,
and to `support@yourshopfront.com` — all confirmed received. The **only** failing case is
`hello@` → `hello@`, i.e. sender identical to recipient, which Google Workspace treats as
spoofing. Three contact-form submissions vanished for exactly this reason.

- `CONTACT_INBOX_EMAIL` moved to **`admin@axsystems.io`** (confirmed receiving). Live from the
  2026-07-30 deploy.
- The Resend account is registered under `admin@axsystems.io`.
- **DMARC added** via the Cloudflare API — `_dmarc.yourshopfront.com TXT "v=DMARC1; p=none;
rua=mailto:hello@yourshopfront.com"`, verified resolving on four resolvers. `p=none` is
  monitoring only. Repoint `rua` if `hello@` stays unreliable.
- SPF/DKIM align correctly. **Do not add `include:amazonses.com` to the root SPF** — Resend
  evaluates SPF against the `send.` subdomain, so it would be a no-op wasting one of ten lookups.
- Recommended, not applied: set `RESEND_FROM_EMAIL` to `notifications@yourshopfront.com` so
  sender never equals recipient on any path. `notifications@` is already proven to send.
- `src/lib/email.ts` is best-effort and **never throws**, so every delivery failure is invisible.
  The Resend key is send-only, so `GET /emails/{id}` returns 401 and status cannot be read from
  code. Worth a full-access key plus a `bounced`/`complained` webhook.

## Customer-side audit findings (2026-07-29)

> **Most of this is FIXED** — see "Audit fixes — MERGED" below for which PR closed what. Kept
> here because the reasoning and file:line evidence explain _why_ each fix looks the way it does.
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

| PR  | Merge     | What                                                                              |
| --- | --------- | --------------------------------------------------------------------------------- |
| #68 | `fc34319` | Arizona/Maricopa County named as governing law + venue; `lastUpdated` bumped      |
| #69 | `731f4f4` | `/access` case-insensitive recovery + email normalization (Hook 3) + portal links |
| #70 | `d1a4d16` | the 3 mismatched hero photos replaced                                             |
| #71 | `17b4677` | hero gallery + form-card copy driven by theme config across 23 themes             |
| #72 | `7b88bc2` | final-CTA contrast, dark wordmark, trust-strip overflow, chat-bubble occlusion    |
| #73 | `d6a4f82` | `/pricing` shows the live promo; `pricing-constants.ts` extracted                 |

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

### Follow-ups queued behind these merges (in order) — ALL RESOLVED 2026-07-30

> Items 1 and 3 shipped in PRs #76 and #77 (merged). Items 2 and 4, plus every "other
> standard-price-only surface" listed below, are in **PR #78** — CI green, awaiting the owner's
> review of the two legal files. Retained as the record of what was wrong.

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

Ordered for the next session. **Rewritten 2026-08-01** — items 1, 2, 3, 10, 13, 14, 15 and 16
from the previous list all shipped in PRs #95–#98 and were removed rather than left ticked, since
a next-actions list that accumulates done items stops being read. Renumbered again later the same
day when PR #100 merged, adding items 4 and 11.

1. **The production smoke test — BLOCKER 1.** Still the top item and still no real completed
   purchase. `LAUNCH-CHECKLIST.md` §0 is now a complete runbook: enter via
   `?ref=payton&src=tiktok` in a fresh incognito profile, assert **$99.00 before entering the
   card**, then refund **and cancel the subscription** (refunding does not cancel — the trial
   would invoice the operator's own card in 30 days). **Gates outreach.**
2. **Decide the coupon guard.** #97 widened the blast radius of a wrong coupon ID from
   promo-link traffic to **100% of subscription sales**, and the code cannot detect it. See the
   ⚠️ under "Four PRs MERGED" — a `stripe.coupons.retrieve` guard asserting
   `applies_to.products` is non-empty would close it. Deliberately not added; owner's call.
3. **Watch the funnel on clean data.** Analytics trustworthy since PR #88. Now also worth asking
   whether the real `/start` screenshots move `/start` → `/checkout` off 3/14.
4. **Create a Google Business Profile and a LinkedIn company page.** Highest-value action
   available that needs no code. `sameAs` in the `Organization` schema is empty because no real
   profile exists, and the 2026-08-01 research found the off-site citation layer — not on-page
   markup — is what AI answers draw on (91% cite third parties; branded mentions correlate
   r = 0.664 vs backlinks r = 0.218). Fill `sameAs` once the profiles are live.
5. **F1b — gallery-*tile* photography.** ⚠️ **The previous wording of this item was wrong.** It
   said "17 of 30 themes render CSS gradient placeholders instead of photos," which reads as those
   themes having no hero photo. They all do. Verified: `ls public/themes/*/hero.jpg | wc -l` → **30**,
   30 theme asset dirs, and `grep -c "heroImage:" src/lib/themes/*.ts` returns 1 for **all 30**
   theme configs (31 files match — `types.ts` is the interface, not a theme). `src/components/home/hero.tsx:115`
   renders `theme.heroImage.url` full-bleed for **every** hero variant, gallery included. The "17"
   looks like a transcription of the unrelated 17-of-30 WCAG contrast figure recorded above.

   **The real gap is the four gallery tiles, and it affects 16 of 30 themes, not 17.**
   `grep -l 'hero: "gallery"' src/lib/themes/*.ts` returns 17 paths, one of which is `types.ts`
   (matched by a doc comment) — so **16 themes** use `hero: "gallery"`, matching the figure already
   recorded under "Demo catalog defects". Root cause is the type, not the data:
   `ThemeHeroGalleryTile` (`src/lib/themes/types.ts:158-164`) is `{ tag, swatch: [string,string,string] }`
   with **no image field at all**, and `hero.tsx:463` paints each tile as a `linear-gradient`. No
   per-theme content override can fix it — closing F1b means adding an image field to the tile type,
   sourcing 64 photos, and updating the renderer.

   Still the **only** blocker on the 8th `/start` picker image: 7 WebPs exist in
   `public/start/previews/`, and `heritage-painters` (the `defaultThemeSlug`, and the one gallery
   hero among the 8 picker trades) falls back to its own `hero.jpg` via `fallbackImage` in
   `src/components/apex/start/trade-picker.tsx:49`. Remove that entry and re-run
   `scripts/generate-demo-previews.mjs` once tile photography lands.
6. **Rotate the Supabase JWT secret + Resend SMTP password** — BLOCKER 3. Unchanged.
7. **Confirm PostHog `$exception` events in a real browser.** #98 enabled exception capture and
   verified no CSP change is needed by reading the installed bundle's resolution path — but CSP
   has silently swallowed a tag in this repo before, so check the console after deploy. The
   Error Tracking *view* may also need enabling in the dashboard for events to group.
8. **WS1 for the remaining 22 themes**, once (3) shows whether demo traffic materialises.
9. Still open under BLOCKER 2: decide whether unreviewed legal copy keeps the `draft` banner.
10. Work the lead list: `~/leads/az-trade-leads-2026-07-29.csv`, 103 Phoenix-metro trades.
    _Note the ICP correction in `CLAUDE.md`: this list is trades-only, but the market is any
    small business that needs a website. Half the theme library targets segments this list has
    no rows for._
11. **Collapse the featured-vs-portfolio canonical rule to one source.** After PR #100 it lives
    in three places — `src/lib/seo.ts:29`, `src/components/apex/demo-card.tsx:45`, and
    `src/app/sitemap.ts`. `seo.ts`'s own comment warns that a third copy is how it drifts.
    Changing `featuredThemeSlugs` without updating all three re-orphans the demo pages.
12. Baseline the Supabase migration ledger before the next migration. _Now a concrete, gated
    step in `LAUNCH-CHECKLIST.md` §4 (`supabase migration repair --linked --status applied
    0001 … 0013`) — owner-run, and it asserts a history rather than verifying one, so
    re-confirm `sites_status_check` carries all 12 values first._
13. **`$250` SLA remedy in `src/app/terms/page.tsx:41`** is the last user-visible dollar figure
    outside `pricing-constants.ts`. Left deliberately — it is a contractual remedy, not a
    product price — but worth a constant if the SLA is ever revised.
14. **Unpushed commit in the Claude-managed marketplace clone.** `a894757 fix(orchestrator):
    require disjoint file sets and explicit output paths` exists only in
    `~/.claude/plugins/marketplaces/axon` and never reached origin. Not related to this repo,
    but it will be lost the next time that directory is refreshed.

### Promoter comms — done 2026-08-01

Payton was sent the corrected links (`?ref=payton&src=fb` / `&src=ig` / `&src=tiktok`) by email
via **Resend** from `hello@yourshopfront.com`, plus an SMS from the Quo wholesaling number. A
follow-up of each went out correcting the sign-off. Nothing outstanding.

## Stripe account reality — verified 2026-07-30

**This Stripe account is shared with axon-growth.** Of 102 lifetime Checkout sessions, only **26
belong to Your Shopfront**. The reliable discriminator is metadata shape: a Your Shopfront session
carries `site_id` + `tier` + `demo_slug`; axon-growth sessions carry a Clerk `userId` instead.
A glance at the Stripe dashboard therefore **overstates this product's revenue by a wide margin** —
always filter on `site_id` before drawing any conclusion about the funnel.

Of those 26, exactly **one was ever paid**: `test@axongrowth.ai`, $10.00, 2026-05-22,
`cs_live_b16FeTImNC8bX3t22tjFOwB4lVCy9th4wPwfhyzrnsJB9n7URLGc2cpQYS` — a self-test, and the
`sites` table's only row, now `status = cancelled`. **There has never been a real paying customer.**

Every session dated 2026-07-29 and 2026-07-30 was self-generated verification traffic
(`parkerhenkel@gmail.com` and `payton-verify-test@example.com`), all `unpaid`. This is why
BLOCKER 1 is unchanged: creating sessions proves checkout, not the post-payment path.

Reproduce with the live secret key:
`GET /v1/checkout/sessions?limit=100` (paginate), then keep only rows with `metadata.site_id`.

## What the funnel data says — corrected 2026-07-31

**The previously reported traffic numbers were wrong, and wrong in a way that mattered.**

`<PostHogAnalytics />` sits in the root layout, and `rotating-preview.tsx:69` mounts live
`/demos/{slug}?embed=1` iframes on the homepage. Each iframe is a full page load that renders
the root layout, so every tracker fired again inside the frame. Fixed in PR #88.

| | Previously reported | Actual |
| --- | --- | --- |
| Pageviews | 209 | **34** (175 were iframes) |
| Unique visitors | 72 (and "40+" earlier) | **18** |
| Human views of any `/demos/*` page | 46 on ironside alone | **0, across all 30 demos** |

Real entry pages: `/start` **14**, `/` **3**, `/checkout` **1**. That is the entire funnel.
74% of pageviews are mobile iOS. Traffic is **Facebook**, not TikTok — one `src=tiktok` hit all
week. GA4 and Vercel Analytics sit in the same layout and were inflated identically, so no
historical figure from either is trustworthy. Clean measurement starts 2026-07-31.

**Payton's links are partly malformed.** 6 of 16 referral hits arrive as
`?ref=payton&fb&fbclid=...` — `&fb` instead of `&src=fb`, so `src` is absent and those visits
carry no channel attribution. Send her the corrected `?ref=payton&src=fb` links.

**One visitor clicked "Pay securely with Stripe"** at `2026-07-30T09:08:33Z` and no Stripe
session exists at that timestamp. `/api/checkout` was re-tested 2026-07-31 and works on every
path, and that visitor's whole journey took 17 seconds, so a bot is the likely explanation —
but it was never positively identified. PostHog error tracking is not enabled, so there are no
`$exception` events to confirm either way.

## What shipped 2026-08-01

| PR | Merge | What |
| --- | --- | --- |
| #91 | merged | Demo/portfolio hero still quoted the pre-trial ladder ("$99 setup + $99/mo for 3 months") after #89 changed the offer |
| #92 | merged | WS1 for the 8 picker trades — real business headlines on `/demos/[slug]`, descriptive headline preserved on `/portfolio/[slug]` |
| #93 | merged | `<HideWhenEmbedded>` — our PortfolioBanner + themed SiteHeader no longer render inside preview iframes |
| #100 | `12e9d89` | SEO/crawlability sweep — see below. 10 files, +100/−26 |

### PR #100 — the site was hiding its own pages from crawlers

Merged as `12e9d89` (integration branch of three agent branches). Rollback:
`git revert -m 1 12e9d89`. What was broken:

- **9 of the 10 canonical `/demos/[slug]` pages were internally orphaned.**
  `src/components/apex/demo-card.tsx` linked every featured theme to `/portfolio/<slug>`, which
  canonicals away to `/demos/<slug>` — so the canonical URL had zero internal links pointing at it.
- **`/start` had no `<h1>`, was absent from the sitemap, and had zero inbound internal links.**
  This is the page **14 of 18 real visitors land on** (see "What the funnel data says").
- **`/api/og/` was robots-disallowed**, blocking the OG image on all 30 theme pages.
- **`demoSchema()` hardcoded `/demos/`**, so 30 `/portfolio/[slug]` pages emitted a
  `WebPage.url` contradicting their own canonical.
- Demo breadcrumbs pointed at `/#showcase`, an anchor that does not exist.
- Titles double-branded — "About — Your Shopfront — Your Shopfront" on `/about` and all 60
  theme URLs.
- `/app` inherited `index: true` from the root metadata.
- `Organization` gained `legalName` / `email` / `hasMerchantReturnPolicy`.

**Verified live after deploy** (not inferred): `robots.txt` allows `/api/og/`; `/api/og/<slug>`
returns 200 `image/png`; `sitemap.xml` has 39 `<loc>` including `/start` (48 after the `/for` family landed); `/start` has exactly
1 `<h1>`; `/portfolio` emits 10 `/demos/*` + 20 `/portfolio/*` anchors; and on a non-featured
theme the `WebPage.url`, the breadcrumb leaf, and the canonical all agree.

**Known remaining P2s — not fixed, do not lose these:**

- The featured-vs-portfolio canonical rule is now encoded in **three** places —
  `src/lib/seo.ts:29` (`canonicalThemeUrl`), `src/components/apex/demo-card.tsx:45`, and
  `src/app/sitemap.ts`. `seo.ts`'s own comment warns that "duplicating this rule a third time is
  how it drifts"; it has been. Changing `featuredThemeSlugs` without touching all three
  reintroduces the orphaning bug.
- `hasMerchantReturnPolicy` lacks `applicableCountry` / `returnPolicyCountry` /
  `returnPolicyCategory`. Google may ignore or flag the property. No data-integrity issue.
- The 10 featured demo titles no longer contain the theme name — a side effect of the
  de-duplication pass, and a small loss of long-tail keyword surface.

### SEO / GEO strategy — researched 2026-08-01

Recording the reasoning so it is not re-litigated.

- **`llms.txt` is deliberately NOT being built.** No major vendor reads it: Ahrefs' crawl logs
  across ~137,000 domains found **97% received zero `llms.txt` requests** in May 2026, and
  Google's May-2026 documentation states explicitly that no AI-specific files are needed —
  normal crawlable HTML plus `robots.txt` is the interface. Building one is busywork that looks
  like progress. Revisit only if a named vendor publishes a fetcher for it.
- **The bottleneck is off-site, not on-page.** 91% of AI answers cite third parties rather than
  the brand's own site, and branded web mentions correlate with AI citation at **r = 0.664**
  versus **r = 0.218** for backlinks. More on-page work has a low ceiling from here.
- **Vertical language is absent from the funnel HTML.** Verified: `grep -roi "every small
  business" src/` → 6 hits, one of them in `site-footer.tsx` so it renders on every page;
  `grep -rniE "plumber|electrician|hvac|roofer|painter|salon|restaurant|dentist"` across
  `src/app/page.tsx`, `/start`, `/pricing`, `/about`, and `src/components/apex/home/` finds
  **no vertical prose at all** outside one sentence on `/about:78` — every other hit is a slug,
  a code comment, or a theme-gallery filter label. All 14 `plumber` occurrences in `src/` sit
  inside theme configs, `portfolio-copy.ts`, or a form placeholder, i.e. on `/demos/*` and
  `/portfolio/*` only. Planned fix is `/for/<vertical>` pages (batch 1 in progress).
- **`sameAs` is empty because no real social profiles exist.** Creating a Google Business Profile
  and a LinkedIn company page is the highest-value action available that requires no code.

### Four PRs MERGED and deployed — 2026-08-01

Merged in the order below (docs first, then the money bug). Every branch was written in an
isolated worktree and verified **cold** by a fresh-context reviewer before opening; the combined
state of all four was test-merged and built locally before any merge — `pnpm typecheck` exit 0,
`pnpm build` succeeded, **30 `/demos` + 30 `/portfolio` paths still prerendered**, `pnpm lint` 0
errors (2 pre-existing warnings).

| PR  | Merge     | What                                                                                  |
| --- | --------- | ------------------------------------------------------------------------------------- |
| #95 | `b587d4f` | doc corrections — §0 gate test, the twelve-vs-thirteen migration list, coupon setup   |
| #97 | `2649b9d` | **server is now the authority on the promo** — a dropped param charged $448 vs a $99 quote |
| #96 | `ab350c9` | hero meta-copy suppressed in preview iframes; 7 real screenshots on `/start`          |
| #98 | `1819adb` | copy add-on via constants; schema.org Offer; conversion value $299 → real charge; PostHog `$exception` |

**Verified against production after deploy** (not inferred): `/`, `/start`, `/pricing`,
`/demos/[slug]`, `/portfolio/[slug]`, `/onboarding` all 200 · `/checkout?tier=subscription`
quotes **$99** with no 503, proving the coupon env is present · `/checkout?…&promo=none` quotes
**$448**, proving #97's opt-out is reachable · `/start` serves all 7 preview WebPs plus the
`heritage-painters` hero fallback.

⚠️ #97's CI run shows **cancelled** in the Actions list — #98's merge superseded it mid-run.
#98's run covers the final `master` state and passed. Nothing is unverified.

**#97 is the load-bearing one.** `/checkout` renders promo pricing for every subscription visit,
but `/api/checkout` only applied the promo when the client sent `promo=launch` — so losing the
query param quoted **$99** and charged **$448**. It now fails closed. The cold review also caught
that the first implementation left the `?promo=none` opt-out unreachable from the client, which
would have made pulling the coupon env var (the obvious first move when retiring the promo) 503
every subscription checkout with no code-side kill switch. Fixed before the PR opened.

⚠️ **#97 widens a blast radius and this is an open decision.** A wrong coupon ID used to affect
only `promo=launch` traffic; it now affects **100% of subscription sales**, and the code cannot
detect it. The retired unrestricted `launch_promo_3mo` still exists in the production coupon list,
and putting it in `STRIPE_COUPON_LAUNCH_PROMO_MONTHLY` charges $49 instead of $99. A
`stripe.coupons.retrieve` guard asserting `applies_to.products` is non-empty would close it —
deliberately not added, owner's call.

Post-merge: remove the three agent worktrees under `.claude/worktrees/` (branches are pushed, so
the working copies are disposable).

### `LAUNCH-CHECKLIST.md` corrections — shipped in PR #95

Two defects found by reading §0 and §4 against the current code. Both are the kind that only
surface when someone actually follows the doc, which is why neither had been caught.

- **§4 listed twelve migrations and omitted `0013_referral_tracking`.** This is the identical
  failure mode to the ⚠️ warning already at the top of that section (which was itself added
  2026-07-29 after the list stopped at `0005`). A fresh project provisioned from the twelve-file
  list has no `referral_code` / `referral_source` columns, so every `checkout.session.completed`
  insert fails — the customer pays and gets nothing. Row added, counts corrected, and an
  amendment note explains the repeat so the pattern is visible rather than quietly fixed.
- **§0's gate test said to refund the charge but never to cancel the subscription.** Refunding
  does not cancel: the promo path creates a subscription on a 30-day trial, so the operator's own
  card would be invoiced ~30 days after the test, and `customer.subscription.deleted` would never
  fire. Cancelling is now a step, which also exercises that third webhook event and the goodbye
  email — previously untested. (Trial/discount windows confirmed against the live subscription
  recorded under "What shipped 2026-07-31".)

§0 was also rewritten to enter through `?ref=payton&src=tiktok` in a **fresh incognito profile**
(first-touch means a stale `ysf_ref` would silently win and prove nothing), so one purchase covers
promo + email + onboarding + attribution together. It now asserts **$99.00 before the card is
entered**, and names what each wrong amount means: **$49** = unscoped `launch_promo_3mo` applied
instead of `launch_promo_3mo_monthly`; **$198** = pre-trial ladder is back; **$448** = promo not
applied at all.

Next-action 12 (baseline the migration ledger) is now a concrete step in §4, using
`supabase migration repair --linked --status applied 0001 … 0013` rather than hand-written
`INSERT`s — the CLI creates the schema and owns the version format. It **asserts** a history
rather than verifying one, so §4 gates it behind re-confirming all 12 values on
`sites_status_check` first.

### WS1 is done for 8 of 30 themes

`content.hero { headline, sub }` on the Theme type, filled for the trades the `/start` picker
links to. The other 22 fall back to `previewHeadline()` and are unchanged.

| Theme | H1 |
| --- | --- |
| ironside-plumbing | Burst pipe? We're there today. |
| voltcraft-electric | Licensed electricians, same day. |
| mesa-hvac | AC out? We'll be there today. |
| summit-roofing | Storm damage? Free inspection today. |
| heritage-painters | Paint that still looks new in ten years. |
| brightside-cleaning | Come home to spotless. |
| greenwise-lawn | A lawn worth coming home to. |
| bellhorn-movers | Moving day, handled. |

**The sprint plan was wrong about the flag.** It claimed the demo/portfolio split "already
exists — `isDemoPreview` in `themed-home.tsx`". It does not: **both** routes pass
`isDemoPreview`, so keying the headline on it would have stripped `/portfolio`'s descriptive H1,
a real SEO surface. A separate `isDemoRoute` prop, set only by `/demos/[slug]`, was added.

### `/start` preview imagery — generated, evaluated, NOT shipped

The pipeline works. All 8 captured with chrome absent and real headlines. Script kept at
`scratchpad/KEEP-gen-previews.mjs`; regenerating takes about two minutes.

They were not shipped because **the hero itself still contains Your Shopfront meta-copy**:

- CTA buttons read "PICK A STYLE" / "SEE PRICING" rather than the business's own call to action
- the promo price strip ("$99 TODAY · FIRST MONTH FREE · ...") renders inside the hero
- an annotation: "← This is a live preview. The actual quote form on YOUR live site can route
  leads to your CRM..."
- the sales chat bubble

#93 suppressed the header and banner; these live inside the hero component and survived.

Consequence: at **thumbnail** size (~150px on a picker tile) the text is illegible and the
images are honest and usable. At **hero** size above the fold, which is what the audit finding
actually asked for, the meta-copy is readable and undercuts the page.

`heritage-painters` is separately unusable at any size — it is the one `gallery` hero in the 8,
and while its own hero photo renders fine, the four gallery *tiles* over it are CSS gradient
rectangles labelled "Interiors"/"Cabinetry". That is **F1b**, still open, affecting **16** of 30
themes — not 17, and not "instead of photos"; see next-action 4 for the corrected scope.

**Owner decision pending:** ship the 7 non-gallery images as picker thumbnails now, or hold all
imagery until the hero meta-copy pass is done.

## What shipped 2026-07-31

| PR | Merge | What |
| --- | --- | --- |
| #88 | `1f8b4e7` | Analytics gated on a top-level browsing context — stops the preview iframes firing phantom pageviews |
| #89 | `f59b816` | $99 today via a 30-day trial, trade picker on `/start`, `/checkout` header overflow |

**The offer changed.** Today's charge on the promo path was $198 ($99 setup + $99 first month
billed together). It is now **$99 today, first month free, then $99/mo for 3 months, then
$149/mo**.

| | Today | M1 | M2 | M3 | M4 | M5+ |
| --- | --- | --- | --- | --- | --- | --- |
| Before | $198 | $99 | $99 | $149 | $149 | $149 |
| After | $99 | free | $99 | $99 | $99 | $149 |

Mechanism, verified against live Stripe rather than inferred:

- `trial_period_days` alone gives **$49**, not $99. `launch_promo_3mo` is a flat $50 off with no
  product restriction, so on a trial subscription the only line on the first invoice is the
  one-time setup fee and the coupon discounts *that*.
- New coupon **`launch_promo_3mo_monthly`** (`applies_to.products = prod_UYpp8k2bCOJSHX`) plus
  `trial_period_days: 30` yields `amount_total: 9900`. `applies_to` cannot be added to an
  existing coupon, which is why a new one was required.
- The trial does **not** consume a discounted month: a real subscription showed trial
  `07-31 -> 08-30` and discount `07-31 -> 10-31`, and no invoice is issued during a trial, so
  three discounted invoices still land.
- New env var **`STRIPE_COUPON_LAUNCH_PROMO_MONTHLY`** is set in Vercel production. If it is
  ever missing, `/api/checkout` returns 503 on the promo path rather than silently billing the
  standard $448 — `/checkout` renders promo pricing for every subscription visit, so a missing
  coupon would otherwise quote $99 and charge $448.

`/start` now carries a trade picker linking straight to
`/checkout?tier=subscription&promo=launch&demo=<slug>`, cutting the path to payment from four
steps to two. The `/checkout` header overflow that PR #77 missed is fixed: `MinimalNav`'s mailto
was 186px of non-wrapping text forcing the page to 418px on a 375px viewport. Now 375/375.

**Still not done on `/start`: there is no image of an actual website anywhere on the page**,
which was the strongest appearance finding of the 2026-07-31 audit. 14 of 18 real visitors land
here and see no product.
