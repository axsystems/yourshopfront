"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { draftSiteContent } from "@/lib/ai-copy/draft"
import { notifySlack } from "@/lib/notify"
import {
  DiscoverySchema,
  type Discovery,
} from "@/lib/site-content/schema"
import {
  getSiteByStripeSessionId,
  transitionStatus,
  updateAiCopyDraft,
  updateDiscoveryAnswers,
  type AICopyDraftMeta,
  type Site,
  type SiteStatus,
} from "@/lib/supabase"
import { allThemes, defaultTheme } from "@/lib/themes"

// =============================================================================
// /onboarding/discovery server action
// =============================================================================
// One action: submitDiscovery. Validates the form payload, persists the
// answers, calls Claude Haiku to draft the copy synchronously, writes the
// draft back, and transitions status. Synchronous because Vercel kills
// background work the moment the response is sent — and 5-15s is fine for
// a "drafting your copy" loading state.
//
// Status flow:
//   pending_content | awaiting_copy | awaiting_copy_draft  (any of these)
//     → during the action: stays put while we work
//     → on success:  awaiting_copy_review
//     → on failure:  stays at awaiting_copy_draft (or its starting status)
//                    + Slack-ping operator with the failure reason
//
// Cost cap: 3 attempts per site. After that we refuse to call Anthropic
// and Slack-ping the operator for manual intervention. Tracked in the
// ai_copy_draft.attemptCount field.
// =============================================================================

const SessionIdSchema = z.string().min(20).max(200)
const MAX_ATTEMPTS = 3

/**
 * Statuses from which a customer is allowed to (re)submit discovery.
 * Includes the legacy 'awaiting_copy' from migration 0007 so in-flight rows
 * created before 0008 still work. 'pending_content' is included because a
 * copy_addon customer might land on the discovery page from the worksheet
 * upgrade flow before the status has been nudged.
 */
const ALLOWED_PRE_DRAFT_STATUSES: SiteStatus[] = [
  "pending_content",
  "awaiting_copy",
  "awaiting_copy_draft",
]

export type SubmitResult =
  | { ok: true }
  | { ok: false; error: string }

export interface SubmitDiscoveryInput {
  sessionId: string
  discovery: unknown
}

export async function submitDiscovery(
  input: SubmitDiscoveryInput
): Promise<SubmitResult> {
  const sessionParse = SessionIdSchema.safeParse(input.sessionId)
  if (!sessionParse.success) {
    return { ok: false, error: "Invalid session." }
  }
  const discoveryParse = DiscoverySchema.safeParse(input.discovery)
  if (!discoveryParse.success) {
    return {
      ok: false,
      error: discoveryParse.error.issues[0]?.message ?? "Invalid input.",
    }
  }

  let site: Site | null
  try {
    site = await getSiteByStripeSessionId(sessionParse.data)
  } catch (err) {
    console.error("[discovery] supabase lookup failed", err)
    return {
      ok: false,
      error: "We couldn't look up your site. Please try again in a moment.",
    }
  }

  if (!site) {
    return { ok: false, error: "Site not found for that session." }
  }
  if (!site.copy_addon) {
    return {
      ok: false,
      error:
        "Copy service isn't enabled on this site. If you'd like it, head back to the worksheet and click 'Upgrade'.",
    }
  }
  if (!ALLOWED_PRE_DRAFT_STATUSES.includes(site.status)) {
    return {
      ok: false,
      error: `Discovery is locked at this stage (status: ${site.status}). Email hello@yourshopfront.com to make changes.`,
    }
  }

  const priorAttempts = site.ai_copy_draft?.attemptCount ?? 0
  if (priorAttempts >= MAX_ATTEMPTS) {
    // Hard cost cap. Tell the operator a human needs to step in; do NOT
    // call Anthropic again.
    await notifySlack(
      `:warning: AI draft attempt-cap hit for *${site.business_name}* (site ${site.id}). ${priorAttempts}/${MAX_ATTEMPTS} attempts used. Manual draft needed.`
    )
    return {
      ok: false,
      error:
        "We've tried drafting your copy a few times without success. Our team has been notified and will reach out within 1 business day.",
    }
  }

  // Persist the answers FIRST so the operator can see what we tried to draft
  // even if Anthropic blows up.
  try {
    await updateDiscoveryAnswers(site.id, discoveryParse.data)
  } catch (err) {
    console.error("[discovery] failed to save discovery answers", err)
    return {
      ok: false,
      error: "We couldn't save your answers. Please try again.",
    }
  }

  const theme = allThemes[site.demo_slug] ?? defaultTheme

  // Synchronous draft call. Vercel keeps the function alive while the
  // server action awaits, and the typical Haiku response is 5-15s — well
  // under the 60s default. We deliberately don't auto-retry on 429/529:
  // operator handles rate limits.
  try {
    const result = await draftSiteContent(discoveryParse.data, theme)
    const nextDraft: AICopyDraftMeta = {
      content: result.draft,
      draftedAt: result.generatedAt,
      attemptCount: priorAttempts + 1,
    }
    await updateAiCopyDraft(site.id, nextDraft)

    // Transition status. Source can be ANY of the pre-draft statuses; we
    // try each in turn until one succeeds. This is the "accept either
    // current status" back-compat the brief calls for.
    let transitioned = false
    for (const from of ALLOWED_PRE_DRAFT_STATUSES) {
      if (await transitionStatus(site.id, from, "awaiting_copy_review")) {
        transitioned = true
        break
      }
    }
    if (!transitioned) {
      // Someone (or some other cron) raced us. Not an error per se — the
      // draft is saved; the operator will see it. Log + Slack so we notice.
      console.warn(
        `[discovery] status transition skipped for site ${site.id} (current was outside ALLOWED_PRE_DRAFT_STATUSES)`
      )
    }

    await notifySlack(
      `:writing_hand: AI copy draft ready for review — *${site.business_name}* (site ${site.id}, attempt ${nextDraft.attemptCount}/${MAX_ATTEMPTS}). Model: ${result.model}.`
    )
    revalidatePath("/onboarding")
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[discovery] draftSiteContent failed", err)

    // Record the failure so the operator can see context — bump attempts
    // even on failure so a stuck site doesn't burn unlimited credits.
    await recordFailedAttempt(site, priorAttempts, message)

    await notifySlack(
      `:rotating_light: AI draft FAILED for *${site.business_name}* (site ${site.id}, attempt ${priorAttempts + 1}/${MAX_ATTEMPTS}). Error: \`${truncate(message, 400)}\``
    )

    return {
      ok: false,
      error:
        "We hit an issue drafting your copy. Our team has been notified and will reach out within 1 business day.",
    }
  }
}

async function recordFailedAttempt(
  site: Site,
  priorAttempts: number,
  errorMessage: string
): Promise<void> {
  try {
    const meta: AICopyDraftMeta = {
      // Keep the prior content (or seed an empty one) so the operator has
      // something to inspect.
      content: site.ai_copy_draft?.content ?? {},
      draftedAt: new Date().toISOString(),
      attemptCount: priorAttempts + 1,
    }
    await updateAiCopyDraft(site.id, meta)
  } catch (err) {
    // Best-effort. The Slack ping is the real signal.
    console.warn("[discovery] failed to record failure metadata", err)
  }
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`
}

/**
 * Exported for typing convenience in the page/form pair.
 * @internal
 */
export type { Discovery }
