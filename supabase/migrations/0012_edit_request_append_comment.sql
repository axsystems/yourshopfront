-- =============================================================================
-- 0012_edit_request_append_comment — atomic comment append
-- =============================================================================
-- The original 0010 implementation used read-modify-write through supabase-js
-- to append comments to edit_requests.comments (a jsonb array). Under
-- concurrent writes (operator + customer hit submit at the same time) the
-- second writer could clobber the first — both read the same snapshot and
-- both write back nextComments = previous + theirOwn.
--
-- This RPC takes a row-level lock (SELECT ... FOR UPDATE) inside a single
-- transaction, then appends with the jsonb || operator. Concurrent calls
-- serialize on the lock so every comment is preserved.
--
-- Idempotent: CREATE OR REPLACE.
-- =============================================================================

create or replace function append_edit_request_comment(
  p_edit_request_id uuid,
  p_comment jsonb
)
returns edit_requests
language plpgsql
security definer
as $$
declare
  v_row edit_requests;
begin
  -- Row-level lock prevents lost updates under concurrent appends.
  select * into v_row
  from edit_requests
  where id = p_edit_request_id
  for update;

  if not found then
    raise exception 'edit_request % not found', p_edit_request_id;
  end if;

  update edit_requests
  set comments = comments || p_comment
  where id = p_edit_request_id
  returning * into v_row;

  return v_row;
end;
$$;

-- Lock down: only the service role should be able to call this. The customer
-- and operator pathways both go through server actions that use the service
-- role; the RPC must never be reachable from the anon / authenticated PostgREST
-- surface (it bypasses the customer-id ownership check intentionally — that
-- check happens in the server action before calling the RPC).
revoke all on function append_edit_request_comment(uuid, jsonb) from public;
revoke all on function append_edit_request_comment(uuid, jsonb) from anon;
revoke all on function append_edit_request_comment(uuid, jsonb) from authenticated;
