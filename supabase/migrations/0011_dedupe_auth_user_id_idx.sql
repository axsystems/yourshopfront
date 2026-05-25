-- =============================================================================
-- 0011_dedupe_auth_user_id_idx — collapse customers_auth_user_id_idx
-- =============================================================================
-- Migration 0009 created `customers_auth_user_id_idx` as a full b-tree on
-- customers.auth_user_id. Migration 0010 declared the same NAME with a
-- partial predicate (`where auth_user_id is not null`). Postgres ignores
-- the second CREATE INDEX IF NOT EXISTS because the name already exists,
-- so the partial predicate from 0010 silently never took effect — whichever
-- migration ran first won.
--
-- Drop and recreate as the partial form. Partial is strictly more selective
-- for our usage:
--   - Pre-auth customers have auth_user_id IS NULL (vast majority before
--     dashboard adoption).
--   - The only query path is `where auth_user_id = $1`, which is never
--     satisfied by NULL rows, so indexing NULLs only wastes space.
--
-- Idempotent: DROP IF EXISTS + CREATE IF NOT EXISTS.
-- =============================================================================

drop index if exists customers_auth_user_id_idx;

create index if not exists customers_auth_user_id_idx
  on customers(auth_user_id)
  where auth_user_id is not null;
