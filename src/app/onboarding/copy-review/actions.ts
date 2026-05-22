"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { sendCopyChangeRequestEmail } from "@/lib/email"
import { notifySlack } from "@/lib/notify"
import {
  getSiteByStripeSessionId,
  transitionStatus,
  updateAiCopyDraft,
  updateSiteContent,
  type AICopyDraftMeta,
  type Site,
  type SiteContent,
} from "@/lib/supabase"
import type { PartialSiteContent } from "@/lib/site-content/schema"

// =============================================================================
// /onboarding/copy-review server actions
// =============================================================================
// Auth: session_id bearer (same model as /onboarding actions). Both actions
// guard on status === 'awaiting_copy_approval' AND a present operator
// approval — same gate as the page render — so a stale session_id can't
// approve an unreviewed draft.
// =============================================================================

const SessionIdSchema = z.string().min(20).max(200)

const RequestChangesSchema = z.object({
  sessionId: SessionIdSchema,
  feedback: z
    .string()
    .min(5, "Tell us a little more about what to change.")
    .max(5000, "That's a lot of feedback — please trim it down."),
})

export type CustomerActionResult =
  | { ok: true }
  | { ok: false; error: string }

interface GuardedSite {
  site: Site
  draftBody: PartialSiteContent
}

async function loadAndGuard(sessionId: string): Promise<
  | { ok: true; data: GuardedSite }
  | { ok: false; error: string }
> {
  const site = await getSiteByStripeSessionId(sessionId)
  if (!site) return { ok: false, error: "Site not found for that session." }
  if (site.status !== "awaiting_copy_approval") {
    return {
      ok: false,
      error: `This page is locked (status: ${site.status}).`,
    }
  }
  if (!site.ai_copy_draft?.operatorApprovedAt) {
    return { ok: false, error: "This draft has not been approved by our team yet." }
  }
  const draftBody = site.ai_copy_draft.operatorEdits ?? site.ai_copy_draft.content
  if (!draftBody) {
    return { ok: false, error: "Draft body is missing." }
  }
  return { ok: true, data: { site, draftBody } }
}

/**
 * Customer approves the operator-reviewed draft. Writes the approved
 * content into site_content (so the worksheet / tenant page sees it),
 * stamps customerApprovedAt, and flips the status to ready_to_build —
 * which the provisioning cron picks up.
 */
export async function approveCopy(input: { sessionId: string }): Promise<CustomerActionResult> {
  const parsed = SessionIdSchema.safeParse(input.sessionId)
  if (!parsed.success) return { ok: false, error: "Invalid session ID." }

  try {
    const guard = await loadAndGuard(parsed.data)
    if (!guard.ok) return guard
    const { site, draftBody } = guard.data

    // 1. Stamp customerApprovedAt on the draft metadata.
    if (!site.ai_copy_draft) {
      return { ok: false, error: "No AI draft on file — cannot approve." }
    }
    const nextMeta: AICopyDraftMeta = {
      ...site.ai_copy_draft,
      customerApprovedAt: new Date().toISOString(),
    }
    await updateAiCopyDraft(site.id, nextMeta)

    // 2. Promote the operator-approved draft into site_content. The
    //    PartialSiteContent → SiteContent cast is safe because the shapes
    //    line up — every field on SiteContent is optional too. siteContentIsValid
    //    will gate whether a tenant page renders.
    const merged: SiteContent = {
      ...(site.site_content ?? {}),
      ...(draftBody as SiteContent),
    }
    await updateSiteContent(site.id, merged)

    // 3. Flip status awaiting_copy_approval → ready_to_build atomically.
    const flipped = await transitionStatus(
      site.id,
      "awaiting_copy_approval",
      "ready_to_build"
    )
    if (!flipped) {
      return {
        ok: false,
        error: "Status changed during request — refresh and try again.",
      }
    }

    // Best-effort operator notification.
    await notifySlack(
      [
        `Copy approved by customer — building now.`,
        `${site.business_name} (${site.id})`,
      ].join("\n")
    )

    revalidatePath("/onboarding/copy-review")
    revalidatePath("/onboarding")
    return { ok: true }
  } catch (err) {
    console.error("[copy-review] approveCopy failed", err)
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not approve copy.",
    }
  }
}

/**
 * Customer requests changes — sends free-form feedback to the operator
 * inbox + Slack. Status stays at awaiting_copy_approval so the operator
 * can re-edit and re-send (which re-uses approveDraft and pings the
 * customer again).
 */
export async function requestChanges(input: {
  sessionId: string
  feedback: string
}): Promise<CustomerActionResult> {
  const parsed = RequestChangesSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." }
  }

  try {
    const guard = await loadAndGuard(parsed.data.sessionId)
    if (!guard.ok) return guard
    const { site } = guard.data

    // Fire-and-forget operator notification — best-effort, never blocks
    // the customer-facing response.
    await Promise.allSettled([
      notifySlack(
        [
          `Copy change request — ${site.business_name}`,
          `Site: ${site.id}`,
          "",
          parsed.data.feedback,
        ].join("\n")
      ),
      sendCopyChangeRequestEmail({
        siteId: site.id,
        businessName: site.business_name,
        feedback: parsed.data.feedback,
      }),
    ])

    return { ok: true }
  } catch (err) {
    console.error("[copy-review] requestChanges failed", err)
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not send change request.",
    }
  }
}
