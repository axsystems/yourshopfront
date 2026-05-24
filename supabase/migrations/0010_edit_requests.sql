-- =============================================================================
-- 0010_edit_requests — customer-initiated change requests
-- =============================================================================
-- Threaded comments live inline in an append-only JSONB array (low write
-- contention, low row count per customer — JSONB beats a side table here).
-- Attachments live in the existing `site-assets` bucket under the namespace
--   {site_id}/edit-requests/{request_id}/
-- (or `{site_id}/edit-requests/_pending/...` for files uploaded before the
-- form is submitted — see src/lib/storage.ts for the path scheme).
--
-- RLS posture: locked-by-default. Customers can SELECT their own rows via
-- auth.uid() → customers.auth_user_id (added by Stream A). INSERT/UPDATE
-- happen exclusively via server actions using the service role. We still
-- do server-side authorization in the action (defense in depth) — never
-- trust RLS as the only gate.
--
-- The auth_user_id column on `customers` is owned by Stream A (auth). We
-- guard with `if not exists` so this migration is idempotent regardless
-- of merge order.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Stream A dependency: ensure customers.auth_user_id exists so the RLS
-- policy below can compile. Stream A's own migration may redefine this
-- column (add fk, default, etc.) — using `if not exists` keeps both
-- migrations idempotent regardless of merge order.
-- -----------------------------------------------------------------------------
alter table customers
  add column if not exists auth_user_id uuid;

create index if not exists customers_auth_user_id_idx
  on customers(auth_user_id) where auth_user_id is not null;

-- -----------------------------------------------------------------------------
-- edit_requests
-- -----------------------------------------------------------------------------
create table if not exists edit_requests (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  section text not null check (section in (
    'hero', 'contact', 'services', 'about',
    'service_area', 'reviews', 'media', 'other'
  )),
  description text not null,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'urgent')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'done')),
  attachments jsonb not null default '[]'::jsonb,
  comments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists edit_requests_site_id_idx on edit_requests(site_id);
create index if not exists edit_requests_customer_id_idx on edit_requests(customer_id);
-- Partial index — operator queue is "everything not yet done", which is the
-- only hot read path on status. Full index would mostly index historical rows.
create index if not exists edit_requests_status_idx
  on edit_requests(status) where status != 'done';

-- Reuse the shared updated_at trigger function defined in 0001_initial.sql.
drop trigger if exists edit_requests_updated_at on edit_requests;
create trigger edit_requests_updated_at
  before update on edit_requests
  for each row execute function update_updated_at();

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table edit_requests enable row level security;

-- Customers see their own edit requests via the customer ↔ auth user link.
-- INSERT/UPDATE/DELETE are not policied — those routes use the service role.
drop policy if exists "customers view own edit_requests" on edit_requests;
create policy "customers view own edit_requests" on edit_requests
  for select using (
    customer_id in (
      select id from customers where auth_user_id = auth.uid()
    )
  );
