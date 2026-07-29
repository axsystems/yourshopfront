-- =============================================================================
-- 0013_referral_tracking — promoter payout + channel attribution
-- =============================================================================
-- Adds two nullable columns to `sites` so a promoter link like
-- https://yourshopfront.com/start?ref=payton&src=tiktok can be traced end to
-- end: `referral_code` (from `?ref=`) is WHO gets paid; `referral_source`
-- (from `?src=`) is WHICH channel (tiktok/ig/fb/...) drove the sale.
--
-- Both are optional and purely additive: no default, nullable, and every
-- existing row (and every future sale with no referral link) keeps NULL in
-- both columns — no change to current behavior.
--
-- Values are captured client-side into a first-party cookie (30-day expiry,
-- first-touch wins), validated against /^[a-z0-9][a-z0-9_-]{0,31}$/i at the
-- /api/checkout Zod boundary, carried through the Stripe Checkout session's
-- metadata, and written onto this `sites` row by the
-- checkout.session.completed webhook handler. RLS stays exactly as
-- 0001_initial.sql left it (enabled, no policies — service-role only);
-- these are plain columns, not a new access surface.
-- =============================================================================

alter table sites
  add column if not exists referral_code text;

alter table sites
  add column if not exists referral_source text;

-- Reporting index: payout queries filter on "has a referral at all" before
-- grouping, so index only the rows that matter.
create index if not exists sites_referral_code_idx
  on sites(referral_code)
  where referral_code is not null;

-- -----------------------------------------------------------------------------
-- Payout query — who to pay, and how much they've closed. Run in the
-- Supabase SQL editor. Excludes cancelled/refunded/failed sales so a
-- refunded sale doesn't get paid out. Add a per-tier payout amount once
-- one is decided (e.g. `sum(case when tier = 'subscription' then 25 else
-- 50 end)`) — this version reports raw counts.
-- -----------------------------------------------------------------------------
-- select
--   referral_code,
--   count(*) as sales,
--   count(*) filter (where tier = 'subscription') as subscriptions,
--   count(*) filter (where tier = 'onetime') as onetime_sales
-- from sites
-- where referral_code is not null
--   and status not in ('cancelled', 'refunded', 'failed')
-- group by referral_code
-- order by sales desc;

-- -----------------------------------------------------------------------------
-- Channel report — which social platform actually converts.
-- -----------------------------------------------------------------------------
-- select
--   referral_source,
--   count(*) as sales
-- from sites
-- where referral_source is not null
--   and status not in ('cancelled', 'refunded', 'failed')
-- group by referral_source
-- order by sales desc;
