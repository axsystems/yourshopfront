-- Adds copy_addon flag + awaiting_copy status. When copy_addon=true,
-- the operator (or future automation) drafts site copy and writes it
-- into site_content; status moves to ready_to_build only after that
-- copy is in place. Customers who didn't opt in initially can upgrade
-- via /api/checkout/copy-upgrade — webhook flips the flag.

alter table sites
  add column if not exists copy_addon boolean not null default false;

alter table sites
  drop constraint if exists sites_status_check;

alter table sites
  add constraint sites_status_check check (
    status in (
      'pending_content',
      'awaiting_copy',
      'ready_to_build',
      'provisioning',
      'awaiting_approval',
      'live',
      'cancelled',
      'refunded',
      'failed'
    )
  );

create index if not exists sites_copy_addon_pending_idx
  on sites(copy_addon)
  where copy_addon = true and status in ('pending_content', 'awaiting_copy');
