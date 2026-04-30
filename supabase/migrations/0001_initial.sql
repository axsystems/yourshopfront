-- =============================================================================
-- Apex Sites — initial schema
-- =============================================================================
-- Run once in the Supabase dashboard SQL editor (Project → SQL Editor → New
-- query → paste → Run). Subsequent migration files in this folder layer on
-- top of this one.
--
-- Tables:
--   customers — one row per Stripe customer
--   sites     — one row per purchased site (FK to customers)
--
-- The service-role key bypasses RLS, so the Next.js server uses these
-- tables freely. RLS is enabled with no policies so anon/authenticated
-- clients are denied by default — preventing accidental exposure if you
-- ever pass the anon key to a browser context.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- customers: one row per Stripe customer
-- -----------------------------------------------------------------------------
create table customers (
  id uuid primary key default gen_random_uuid(),
  stripe_customer_id text unique not null,
  email text not null,
  name text not null,
  phone text,
  created_at timestamptz default now() not null
);

create index customers_email_idx on customers(email);

-- -----------------------------------------------------------------------------
-- sites: one row per purchased site
-- -----------------------------------------------------------------------------
create table sites (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade not null,
  stripe_session_id text unique not null,
  tier text not null check (tier in ('subscription', 'onetime')),
  demo_slug text not null,
  business_name text not null,
  industry text,
  headline_pref text,
  current_website_url text,
  hosting_addon boolean default false not null,
  status text default 'pending_content' not null check (
    status in ('pending_content', 'ready_to_build', 'awaiting_approval', 'live', 'cancelled', 'refunded')
  ),
  live_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index sites_customer_idx on sites(customer_id);
create index sites_status_idx on sites(status);

-- -----------------------------------------------------------------------------
-- Auto-update updated_at on sites row updates
-- -----------------------------------------------------------------------------
create or replace function update_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger sites_updated_at
  before update on sites
  for each row execute function update_updated_at();

-- -----------------------------------------------------------------------------
-- RLS: enable on both tables. No policies = anon/authenticated denied;
-- the service-role key (used by the Next.js server) bypasses RLS, so
-- everything keeps working. This is the locked-by-default posture.
-- -----------------------------------------------------------------------------
alter table customers enable row level security;
alter table sites enable row level security;
