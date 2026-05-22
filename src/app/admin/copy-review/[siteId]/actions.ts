"use server"

import { timingSafeEqual } from "node:crypto"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { sendCopyReadyForReviewEmail } from "@/lib/email"
import { draftSiteContent } from "@/lib/ai-copy/draft"
import { allThemes, defaultTheme } from "@/lib/themes"
import {
  getSiteById,
  supabase,
  transitionStatus,
  updateAiCopyDraft,
  type AICopyDraftMeta,
  type Site,
  type SiteStatus,
} from "@/lib/supabase"
import {
  PartialSiteContentSchema,
  type PartialSiteContent,
} from "@/lib/site-content/schema"
import { SITE_URL } from "@/lib/seo"

// =============================================================================
// /admin/copy-review/[siteId] server actions
// =============================================================================
// Both actions re-verify ADMIN_PASSWORD before any DB write. The page-level
// auth check is for navigation gating; actions can be invoked from anywhere
// (e.g. a malicious page using the same shape) so they MUST validate again.
// Same timing-safe compare as /api/provisioning/approve.
// =============================================================================

const MAX_DRAFT_ATTEMPTS = 3

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return timingSafeEqual(aBuf, bBuf)
}

function authorize(token: string | undefined): { ok: true } | { ok: false; error: string } {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return { ok: false, error: "Admin endpoint not configured." }
  if (!token) return { ok: false, error: "Missing admin token." }
  if (!safeEqual(token, expected)) return { ok: false, error: "Invalid admin token." }
  return { ok: true }
}

export type AdminActionResult =
  | { ok: true }
  | { ok: false; error: string }

const ApproveSchema = z.object({
  siteId: z.string().uuid(),
  token: z.string().min(1),
  edits: PartialSiteContentSchema.optional(),
})

const RedraftSchema = z.object({
  siteId: z.string().uuid(),
  token: z.string().min(1),
})

interface CustomerLookup {
  email: string
  firstName: string
}

async function getCustomerForSite(site: Site): Promise<CustomerLookup | null> {
  const { data, error } = await supabase()
    .from("customers")
    .select("email,name")
    .eq("id", site.customer_id)
    .maybeSingle()
  if (error || !data) return null
  const row = data as { email: string; name: string }
  return {
    email: row.email,
    firstName: row.name.split(" ")[0] ?? row.name,
  }
}

function mergeEdits(
  base: PartialSiteContent | undefined,
  patch: PartialSiteContent | undefined
): PartialSiteContent {
  // Section-level merge. Each top-level key in PartialSiteContent is either
  // an object (hero/contact/about/serviceArea/media) or an array
  // (services/reviews). For arrays, the operator's edit fully replaces the
  // AI draft list — partial array merging would be ambiguous. For objects,
  // we spread to keep any AI-drafted fields the operator didn't touch.
  const merged: PartialSiteContent = { ...(base ?? {}) }
  if (!patch) return merged
  if (patch.hero !== undefined) merged.hero = { ...merged.hero, ...patch.hero }
  if (patch.contact !== undefined) merged.contact = { ...merged.contact, ...patch.contact }
  if (patch.about !== undefined) merged.about = { ...merged.about, ...patch.about }
  if (patch.serviceArea !== undefined) merged.serviceArea = { ...merged.serviceArea, ...patch.serviceArea }
  if (patch.media !== undefined) merged.media = { ...merged.media, ...patch.media }
  if (patch.services !== undefined) merged.services = patch.services
  if (patch.reviews !== undefined) merged.reviews = patch.reviews
  return merged
}

/**
 * Operator approves the (possibly-edited) AI draft and sends it to the
 * customer for final approval. Status flips awaiting_copy_review →
 * awaiting_copy_approval and the customer gets the review email.
 */
export async function approveDraft(input: {
  siteId: string
  token: string
  edits?: PartialSiteContent
}): Promise<AdminActionResult> {
  const parsed = ApproveSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." }
  }
  const auth = authorize(parsed.data.token)
  if (!auth.ok) return auth

  try {
    const site = await getSiteById(parsed.data.siteId)
    if (!site) return { ok: false, error: "Site not found." }

    // Status guard. We only accept approval from awaiting_copy_review.
    // awaiting_copy_approval (already-approved-once) is allowed too so the
    // operator can re-send with further edits if the customer pushed back.
    const allowedFrom: SiteStatus[] = ["awaiting_copy_review", "awaiting_copy_approval"]
    if (!allowedFrom.includes(site.status)) {
      return {
        ok: false,
        error: `Site is in status '${site.status}', not 'awaiting_copy_review'.`,
      }
    }

    if (!site.ai_copy_draft) {
      return { ok: false, error: "No AI draft on file — cannot approve." }
    }
    const currentMeta: AICopyDraftMeta = site.ai_copy_draft
    const merged = mergeEdits(currentMeta.content, parsed.data.edits)
    const nextMeta: AICopyDraftMeta = {
      ...currentMeta,
      operatorEdits: merged,
      operatorApprovedAt: new Date().toISOString(),
    }
    await updateAiCopyDraft(site.id, nextMeta)

    if (site.status === "awaiting_copy_review") {
      const flipped = await transitionStatus(
        site.id,
        "awaiting_copy_review",
        "awaiting_copy_approval"
      )
      if (!flipped) {
        return {
          ok: false,
          error: "Status changed during request — try again.",
        }
      }
    }

    // Best-effort email send. Don't block the action on Resend.
    const customer = await getCustomerForSite(site)
    if (customer) {
      const onboardingUrl = `${SITE_URL}/onboarding/copy-review?session_id=${encodeURIComponent(
        site.stripe_session_id
      )}`
      await sendCopyReadyForReviewEmail({
        to: customer.email,
        firstName: customer.firstName,
        onboardingUrl,
      })
    }

    revalidatePath(`/admin/copy-review/${site.id}`)
    return { ok: true }
  } catch (err) {
    console.error("[admin/copy-review] approveDraft failed", err)
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not approve draft.",
    }
  }
}

/**
 * Re-runs draftSiteContent against the current discovery answers. Capped at
 * MAX_DRAFT_ATTEMPTS (3) — beyond that the operator must hand-write the
 * copy in the textareas. Status stays at awaiting_copy_review so the
 * operator can re-open the page and review the new draft.
 */
export async function redraft(input: {
  siteId: string
  token: string
}): Promise<AdminActionResult> {
  const parsed = RedraftSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." }
  }
  const auth = authorize(parsed.data.token)
  if (!auth.ok) return auth

  try {
    const site = await getSiteById(parsed.data.siteId)
    if (!site) return { ok: false, error: "Site not found." }

    const currentMeta = site.ai_copy_draft
    const nextAttempt = (currentMeta?.attemptCount ?? 0) + 1
    if (nextAttempt > MAX_DRAFT_ATTEMPTS) {
      return {
        ok: false,
        error: `Maximum ${MAX_DRAFT_ATTEMPTS} draft attempts reached. Edit the existing draft by hand.`,
      }
    }

    if (!site.discovery_answers) {
      return {
        ok: false,
        error: "No discovery answers on file — cannot regenerate draft.",
      }
    }

    const theme = allThemes[site.demo_slug] ?? defaultTheme
    const drafted = await draftSiteContent(site.discovery_answers, theme)

    const nextMeta: AICopyDraftMeta = {
      ...(currentMeta ?? {}),
      content: drafted.draft,
      // Clear the operator's previous edits — a fresh draft means the
      // operator should re-review from scratch. Keep operatorApprovedAt
      // cleared too so the customer page won't surface a stale approval.
      operatorEdits: undefined,
      operatorApprovedAt: undefined,
      attemptCount: nextAttempt,
      draftedAt: new Date().toISOString(),
    }
    await updateAiCopyDraft(site.id, nextMeta)

    revalidatePath(`/admin/copy-review/${site.id}`)
    return { ok: true }
  } catch (err) {
    console.error("[admin/copy-review] redraft failed", err)
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not regenerate draft.",
    }
  }
}
