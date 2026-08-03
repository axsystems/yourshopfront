-- =============================================================================
-- 0014_leads — visitor lead capture on delivered customer sites
-- =============================================================================
-- Delivered tenant sites (*.yourshopfront.com → /tenant) currently expose only
-- `tel:` / `mailto:` links, so a visitor who won't call is lost. This table is
-- the persistence side of a real lead form: one row per submission, owned by
-- the `sites` row it was submitted on.
--
-- The DB write is authoritative — if the insert fails the visitor is told, so
-- a lead is never silently dropped. The owner-notification email is
-- best-effort on top of it (same posture as every other sendEmail caller).
--
-- Calculator fields are here from day one on purpose. An instant-quote
-- calculator is the next thing to land on these forms, and backfilling a
-- column onto a table that already has production rows is strictly worse than
-- shipping it nullable now. `calculator_input` is JSONB because the input
-- shape is per-vertical (rooms/sqft/loads/...) and must not require a
-- migration to change; `calculator_estimate` is numeric, not JSONB, because
-- it is money that will be summed and sorted.
--
-- Purely additive: new table only. No existing table, column, index, policy,
-- or row is touched, so current behavior is unaffected.
--
-- Idempotent by construction (`if not exists` / `drop ... if exists`). This
-- project has no supabase_migrations ledger — every migration has been applied
-- by hand and nothing prevents a double-apply — so re-running this file must
-- be a no-op. It is.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- leads
-- -----------------------------------------------------------------------------
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  -- Cascade matches edit_requests: a deleted site takes its leads with it.
  site_id uuid not null references sites(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  message text,
  -- Where the form was submitted from — pathname or named form, e.g. '/' or
  -- 'calculator'. Free text: the tenant page is a single route today, but the
  -- value is for the business owner to read, not for us to branch on.
  source_page text,
  -- Structured calculator answers, e.g. {"rooms": 3, "sqft": 1800}. Defaults
  -- to '{}' rather than null so readers never have to null-check before
  -- indexing into it.
  calculator_input jsonb not null default '{}'::jsonb,
  -- Computed quote in dollars. Null when the form had no calculator.
  calculator_estimate numeric(12, 2),
  created_at timestamptz not null default now(),
  -- A lead nobody can reply to is not a lead. The form requires one contact
  -- method; this is the backstop so a future caller can't write an
  -- unreachable row.
  constraint leads_contact_method_present
    check (email is not null or phone is not null)
);

-- The only read path: "show me this site's leads, newest first" (owner inbox
-- / portal list). Composite so the sort is satisfied by the index rather than
-- re-sorting a site's whole history. No index on email/phone — nothing
-- queries by them, and a speculative index is write cost for no read.
create index if not exists leads_site_id_created_at_idx
  on leads(site_id, created_at desc);

-- No updated_at column and no trigger: leads are append-only from the
-- visitor's side. Nothing in the app updates a lead row.

-- -----------------------------------------------------------------------------
-- RLS: enabled with no policies — the locked-by-default posture from
-- 0001_initial.sql and 0013_referral_tracking. anon/authenticated are denied
-- outright; the Next.js server reads and writes with the service-role key,
-- which bypasses RLS. Leads are visitor PII, so this table stays
-- service-role-only until a portal view needs it, at which point it gets an
-- explicit customer-scoped SELECT policy like edit_requests has.
-- -----------------------------------------------------------------------------
alter table leads enable row level security;
