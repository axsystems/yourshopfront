-- 0008_ai_copy_state.sql
-- Replaces single 'awaiting_copy' status with finer-grained sub-states
-- so the AI drafting + operator review + customer approval cycle can
-- be tracked. Old 'awaiting_copy' remains for backward compat with the
-- pre-AI manual path (sites already in that state keep flowing).
--
-- New status flow when copy_addon = true:
--   awaiting_copy_draft   -- AI hasn't drafted yet (post-discovery submit)
--   awaiting_copy_review  -- operator reviewing AI draft
--   awaiting_copy_approval-- customer reviewing operator-approved draft
--   ready_to_build        -- approved, provisioning can start
--
-- New columns:
--   discovery_answers  -- raw 5-fact customer answers (audit trail)
--   ai_copy_draft      -- drafted content + meta (attempt count, edits, etc.)
--
-- Idempotent: re-applying is a no-op.

alter table sites
  drop constraint if exists sites_status_check;

alter table sites
  add constraint sites_status_check check (
    status in (
      'pending_content',
      'awaiting_copy',           -- legacy: pre-AI manual path
      'awaiting_copy_draft',     -- new: AI hasn't drafted yet
      'awaiting_copy_review',    -- new: operator reviewing AI draft
      'awaiting_copy_approval',  -- new: customer reviewing operator-approved draft
      'ready_to_build',
      'provisioning',
      'awaiting_approval',
      'live',
      'cancelled',
      'refunded',
      'failed'
    )
  );

-- Discovery answers stored separately from site_content so we keep an
-- audit trail of what the customer told us vs what got drafted.
alter table sites
  add column if not exists discovery_answers jsonb;

-- AI draft text stored alongside site_content; allows comparison/redo.
alter table sites
  add column if not exists ai_copy_draft jsonb;

-- Widen the copy-pending partial index from 0007 to cover the new
-- statuses, so operator-queue lookups like
--   where copy_addon = true and status = 'awaiting_copy_draft'
-- stay index-only instead of falling back to a sequential scan once
-- Stream B's queue view starts running.
drop index if exists sites_copy_addon_pending_idx;
create index sites_copy_addon_pending_idx
  on sites(status)
  where copy_addon = true
    and status in (
      'pending_content',
      'awaiting_copy',
      'awaiting_copy_draft',
      'awaiting_copy_review',
      'awaiting_copy_approval'
    );
