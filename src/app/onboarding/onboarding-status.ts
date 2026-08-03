import type { PartialSiteContent } from "@/lib/site-content/schema"
import type { SiteStatus } from "@/lib/supabase"

// =============================================================================
// "Is this customer still in onboarding?" — single source of truth
// =============================================================================
// Client-safe: the only import is a type, which is erased at compile time,
// so nothing pulls the server-only Supabase client into a browser bundle.
//
// This list used to be spelled out three different ways: /onboarding
// computed `pastOnboarding` from four negated comparisons, the checklist
// and the worksheet each hardcoded `status !== "pending_content"`. The
// copy-addon lifecycle never passes through pending_content
// (awaiting_copy_draft → awaiting_copy_review → awaiting_copy_approval →
// ready_to_build), so the hub rendered an onboarding checklist whose
// worksheet, uploader, and domain step were all locked. Every consumer now
// reads the same list.
// =============================================================================

/**
 * Statuses where the customer still owns their content and may edit it.
 * Everything after this (ready_to_build, provisioning, awaiting_approval,
 * live, cancelled, refunded, failed) is ours to change, not theirs.
 */
export const ONBOARDING_OPEN_STATUSES: SiteStatus[] = [
  "pending_content",
  "awaiting_copy",
  "awaiting_copy_draft",
  "awaiting_copy_review",
  "awaiting_copy_approval",
]

export function isOnboardingOpen(status: SiteStatus): boolean {
  return ONBOARDING_OPEN_STATUSES.includes(status)
}

/**
 * The only worksheet sections the copy service writes — the three the
 * drafting system prompt in src/lib/ai-copy/draft.ts asks the model for,
 * and the only three the admin review form can edit.
 *
 * Everything else on the worksheet (contact, service area, reviews, media,
 * presentation, calculator) belongs to the customer and must survive
 * promotion untouched.
 */
export const COPY_SERVICE_OWNED_SECTIONS = ["hero", "services", "about"] as const

type CopyServiceOwnedSection = (typeof COPY_SERVICE_OWNED_SECTIONS)[number]

/**
 * Narrows an approved draft to the sections the copy service actually owns,
 * for approveCopy's `{ ...site_content, ...draft }` promotion.
 *
 * Without this, promotion is only as disciplined as the model. Verified by
 * execution, not assumption: PartialSiteContentSchema (what draft.ts parses
 * the model reply with) accepts `presentation` and `calculator` as known
 * optional keys, so Zod does NOT strip them — a model that ignores the
 * "hero, services, about only" instruction gets those keys persisted into
 * ai_copy_draft.content, mergeEdits carries them through in its
 * `{ ...base }`, and the spread then destroys the customer's real gallery
 * layout and their real rate card. That was unreachable while the worksheet
 * was locked for copy-addon customers; unlocking it is exactly what would
 * have armed it.
 *
 * Behaviour-preserving for every path the shipped UI can produce: the admin
 * form only emits hero/about/services, and a compliant draft carries only
 * those three.
 */
export function pickCopyServiceSections(
  draft: PartialSiteContent
): Pick<PartialSiteContent, CopyServiceOwnedSection> {
  const picked: Pick<PartialSiteContent, CopyServiceOwnedSection> = {}
  if (draft.hero !== undefined) picked.hero = draft.hero
  if (draft.services !== undefined) picked.services = draft.services
  if (draft.about !== undefined) picked.about = draft.about
  return picked
}

/**
 * True when a pending copy-service draft will replace this site's
 * hero/services/about on approval, so the worksheet can say so instead of
 * silently discarding what the customer typed.
 */
export function copyServiceOwnsCopy(site: {
  copy_addon: boolean
  status: SiteStatus
}): boolean {
  return site.copy_addon && isOnboardingOpen(site.status)
}
