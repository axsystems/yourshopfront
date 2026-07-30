# Project State — Your Shopfront

**Last updated:** 2026-07-30 (MST)
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
| $99 promo           | **CONFIGURED** | `STRIPE_PRICE_SUBSCRIPTION_SETUP_PROMO` + `STRIPE_COUPON_LAUNCH_PROMO` both present in Vercel production (the two `isPromo` requires) |
| Referral tracking   | **VERIFIED**   | full end-to-end re-verification 2026-07-30 — see "Referral attribution" below                                                         |
| Production schema   | **CURRENT**    | all 13 migrations (`0001`–`0013`) re-verified column-by-column against live schema 2026-07-30                                         |
| Provisioning cron   | **ARMED**      | `/api/cron/provision` returns 401 unauth → `CRON_SECRET` set                                                                          |
| Sales chat bubble   | **CONFIGURED** | `/api/chat` returns 400 on empty body (not 503) → `ANTHROPIC_API_KEY` set                                                             |
| SEO                 | **LIVE**       | `robots.txt` 200; `sitemap.xml` 38 `<loc>` entries                                                                                    |
| CI                  | **GREEN**      | `lint-and-typecheck` ~35s, `build-and-smoke` ~1m35s                                                                                   |
| OG preview image    | **FIXED**      | `og-v3.png` 200; every share previewed "Apex Sites / $499 setup" until 2026-07-30                                                     |
| Google Analytics    | **WORKING**    | collecting only since PR #84 (`f91ea8b`). #82 unblocked the CSP but the inline script still failed to parse — see below               |
| Vercel Analytics    | **WORKING**    | loads from an obfuscated same-origin path; `'self'` covers it. Was never broken                                                       |
| PostHog replay      | **ENABLED**    | project toggle switched on; `config.js` now returns a `sessionRecording` object (`recorderVersion: "v2"`), not `false`                |
| Transactional email | **PARTIAL**    | Resend delivers everywhere except `hello@` → `hello@`; see "Email deliverability"                                                     |
| Sales               | **ZERO**       | **1 paid Your Shopfront session ever** — a $10 self-test on 2026-05-22, now `cancelled`. See "Stripe account reality" below           |

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
   live; the welcome email (Resend), onboarding worksheet, and provisioning handoff are not.
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

Ordered for the next session (2026-07-31).

1. **The production smoke test — BLOCKER 1. Still the single most valuable action.** 40+ real
   visitors have now arrived and nobody has completed a purchase, so the entire post-payment
   path remains unexercised. If someone buys tomorrow it is unknown whether they receive a
   welcome email, an onboarding worksheet, or a provisioned site.
   Two routes: a real $99 checkout through `?ref=payton&src=tiktok` then refund; **or** test
   mode with no card — get the `sk_test_` key from Dashboard → Developers → API keys (test mode
   toggle on), then `stripe listen --api-key ... --forward-to localhost:3000/api/stripe/webhook`
   and pay with `4242 4242 4242 4242`. Test mode proves the code, not the live Stripe wiring.
   (`stripe login`'s browser flow was attempted four times on 2026-07-30 and never completed.)
2. **Rotate the Supabase JWT secret + Resend SMTP password** — BLOCKER 3.
3. Still open under BLOCKER 2: decide whether unreviewed legal copy keeps the `draft` banner.
4. **Confirm PostHog sessions actually land in the dashboard.** The project toggle is on and the
   proxy is verified serving `recorder.js`, but no recorded session has been observed yet.
5. Work the lead list: `~/leads/az-trade-leads-2026-07-29.csv` — 103 Phoenix-metro trade
   businesses, 102 with no real website, demo-matched and ranked. Scripts in
   `~/leads/outreach-scripts.md`. Warm-network text blast first, then cold DMs top-down.
   The demo-catalog defects that previously gated this are fixed.
6. Send Payton her three links; agree commission and disclosure. Tracking is verified.
7. Baseline the Supabase migration ledger before the next migration. Safe command:
   `supabase migration repair --status applied 0001 … 0013 --linked` (writes ledger rows without
   re-running SQL). Note `0001`–`0004` are non-idempotent and would hard-fail on a re-run.
8. Before the `lower(email)` unique index can be created, delete the orphan duplicate
   `test@axongrowth.ai` customer row (two exist, one with no site and no `auth_user_id`).
9. **`$199` (copy add-on) is still hardcoded** in `checkout/page.tsx`, `checkout-form.tsx`,
   `worksheet-form.tsx`, and the webhook's Slack alert — the same class of drift as `$49`, which
   PR #78 closed. Route it through `pricing-constants.ts`.
10. **`src/lib/seo.ts` now publishes the promo price** (`price: "99"`) in the schema.org Offer.
    Accurate today, silently wrong the day the promo ends — structured data is the one surface
    that won't visibly look stale.

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

## What the funnel data says (2026-07-30)

40+ visitors, **2 reached `/checkout`**, 0 payments. Nobody abandoned at payment — they left
before submitting the form. Production logs show only 200s, so this is a conversion problem, not
a technical one. (An earlier revision of this doc said "0 checkout sessions created"; 26 Your
Shopfront sessions exist lifetime, but every one is self-generated test traffic — see above.)

Two contributing factors were live for most of that traffic and are now fixed: every shared link
previewed "Apex Sites — $499 setup", and the checkout order-summary rendered its own text
garbled. The remaining known gap is **zero social proof** anywhere in the funnel — no
testimonials, no customer count. That cannot be fixed by writing some; it needs a real customer,
i.e. BLOCKER 1.
