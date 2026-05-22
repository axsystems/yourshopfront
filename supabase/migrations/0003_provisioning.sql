-- =============================================================================
-- Apex Sites — provisioning state
-- =============================================================================
-- Run after 0002_onboarding.sql in the Supabase SQL editor (Project → SQL
-- Editor → New query → paste → Run).
--
-- Adds the columns the Phase 5 provisioning pipeline needs:
--
--   provision_slug TEXT UNIQUE — the host segment used for the site's
--     subdomain on apexsites.com (e.g. "northridge-plumbing" produces
--     northridge-plumbing.apexsites.com). Derived from business_name on
--     first run, deduped with a numeric suffix if collision occurs.
--     Nullable until provisioning starts.
--
--   provisioning_state JSONB — per-step record of what the orchestrator
--     has done. Lets the cron be idempotent: re-running on a half-done
--     site picks up where it left off. Shape (TS-mirrored as
--     ProvisioningState in src/lib/provisioning/types.ts):
--
--       {
--         "dns":   { "complete": true, "completed_at": "...", "record_id": "..." },
--         "vercel":{ "complete": true, "completed_at": "...", "domain": "..." },
--         "approval_pending_at": "...",
--         "live_at": "..."
--       }
--
--   failure_reason TEXT — populated when status flips to 'failed'. Plain
--     human-readable string for ops to read in Slack/admin UI.
--
-- Status enum gains 'provisioning' (orchestrator running) and 'failed'
-- (orchestrator gave up — needs human attention).
-- =============================================================================

alter table sites
  add column provision_slug text unique,
  add column provisioning_state jsonb not null default '{}'::jsonb,
  add column failure_reason text;

-- Drop the old status check constraint and re-add with the two new states.
alter table sites
  drop constraint if exists sites_status_check;

alter table sites
  add constraint sites_status_check check (
    status in (
      'pending_content',
      'ready_to_build',
      'provisioning',
      'awaiting_approval',
      'live',
      'cancelled',
      'refunded',
      'failed'
    )
  );

-- Index for the cron-pickup query: where status in ('ready_to_build',
-- 'provisioning'). Keeps the per-minute scan cheap even at scale.
create index if not exists sites_status_pending_idx
  on sites(status)
  where status in ('ready_to_build', 'provisioning');

-- Index on provision_slug for hostname → site lookups (multi-tenant
-- middleware will use this in a follow-up commit).
create index if not exists sites_provision_slug_idx on sites(provision_slug);
