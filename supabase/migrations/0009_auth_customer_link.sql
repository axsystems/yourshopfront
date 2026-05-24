-- Link Supabase auth.users to our existing customers table.
-- Existing customers (pre-dashboard) match on email at first sign-in.
-- New customers get auth_user_id set at first dashboard sign-in.
--
-- Idempotent: all statements use IF NOT EXISTS or CREATE OR REPLACE.

alter table customers
  add column if not exists auth_user_id uuid references auth.users(id);

create index if not exists customers_auth_user_id_idx
  on customers(auth_user_id);

-- Helper RPC: case-insensitive email lookup for first-sign-in linking.
-- SECURITY DEFINER so it can read customers without requiring caller to
-- have SELECT on the table. Access is restricted to service-role only
-- (all other roles are explicitly revoked below).
create or replace function get_customer_by_email(p_email text)
returns customers
language sql
security definer
as $$
  select * from customers where lower(email) = lower(p_email) limit 1;
$$;

revoke all on function get_customer_by_email(text) from public;
revoke all on function get_customer_by_email(text) from anon;
revoke all on function get_customer_by_email(text) from authenticated;
