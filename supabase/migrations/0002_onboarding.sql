-- =============================================================================
-- Apex Sites — onboarding state column
-- =============================================================================
-- Run after 0001_initial.sql in the Supabase SQL editor (Project → SQL
-- Editor → New query → paste → Run).
--
-- Adds a JSONB column to track per-site onboarding step completion.
-- Shape (TypeScript-mirrored in src/lib/supabase.ts as OnboardingState):
--
--   {
--     "content_sent":  { "complete": true, "completed_at": "2026-04-30T..." },
--     "assets_sent":   { "complete": true, "completed_at": "..." },
--     "domain":        {
--                        "complete": true,
--                        "completed_at": "...",
--                        "type": "custom" | "subdomain",
--                        "custom_domain": "..."   // when type=custom
--                      }
--   }
--
-- When all three keys are complete=true, /api/onboarding flips
-- sites.status from 'pending_content' to 'ready_to_build'.
-- =============================================================================

alter table sites
  add column onboarding_state jsonb not null default '{}'::jsonb;
