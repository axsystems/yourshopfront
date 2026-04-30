"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import {
  getSiteByStripeSessionId,
  isOnboardingComplete,
  updateOnboardingState,
  updateSiteStatus,
  type OnboardingState,
} from "@/lib/supabase"

// =============================================================================
// /onboarding server actions
// =============================================================================
// Access model: anyone holding the Stripe Checkout session_id can mutate
// onboarding state for that site. Session IDs are unguessable Stripe-generated
// tokens (~70 chars), so this is an acceptable bearer-token model for this
// phase. Phase 5+ will layer customer auth on top.
//
// Each action validates inputs with Zod, fetches the site, merges the patch
// into the existing JSONB state, writes back, and flips status to
// 'ready_to_build' if all three user-actionable steps are now complete.
// =============================================================================

const SessionIdSchema = z.string().min(20).max(200)

const SetContentSchema = z.object({
  sessionId: SessionIdSchema,
  complete: z.boolean(),
})

const SetAssetsSchema = z.object({
  sessionId: SessionIdSchema,
  complete: z.boolean(),
})

const SetDomainSchema = z.discriminatedUnion("type", [
  z.object({
    sessionId: SessionIdSchema,
    type: z.literal("subdomain"),
  }),
  z.object({
    sessionId: SessionIdSchema,
    type: z.literal("custom"),
    customDomain: z
      .string()
      .min(3, "Domain too short")
      .max(253, "Domain too long")
      .regex(
        /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/,
        "Enter a valid domain (e.g. example.com)"
      ),
  }),
])

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string }

export async function setContentSent(input: {
  sessionId: string
  complete: boolean
}): Promise<ActionResult> {
  const parsed = SetContentSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message }
  }
  return persist(parsed.data.sessionId, (state) => ({
    ...state,
    content_sent: stamped(parsed.data.complete),
  }))
}

export async function setAssetsSent(input: {
  sessionId: string
  complete: boolean
}): Promise<ActionResult> {
  const parsed = SetAssetsSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message }
  }
  return persist(parsed.data.sessionId, (state) => ({
    ...state,
    assets_sent: stamped(parsed.data.complete),
  }))
}

export async function setDomain(
  input:
    | { sessionId: string; type: "subdomain" }
    | { sessionId: string; type: "custom"; customDomain: string }
): Promise<ActionResult> {
  const parsed = SetDomainSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message }
  }
  const value = parsed.data
  return persist(value.sessionId, (state) => ({
    ...state,
    domain: {
      complete: true,
      completed_at: new Date().toISOString(),
      type: value.type,
      ...(value.type === "custom" ? { custom_domain: value.customDomain } : {}),
    },
  }))
}

function stamped(complete: boolean): { complete: boolean; completed_at?: string } {
  return complete
    ? { complete: true, completed_at: new Date().toISOString() }
    : { complete: false }
}

async function persist(
  sessionId: string,
  patch: (current: OnboardingState) => OnboardingState
): Promise<ActionResult> {
  try {
    const site = await getSiteByStripeSessionId(sessionId)
    if (!site) {
      return { ok: false, error: "Site not found for that session." }
    }
    if (site.status !== "pending_content") {
      // Once we've started building we don't accept further onboarding
      // edits — a customer who needs to change something can email us.
      return {
        ok: false,
        error: `Onboarding is locked (status: ${site.status}). Email hello@apexsites.com to change anything.`,
      }
    }
    const next = patch(site.onboarding_state ?? {})
    await updateOnboardingState(site.id, next)
    if (isOnboardingComplete(next)) {
      await updateSiteStatus(site.id, "ready_to_build")
    }
    revalidatePath("/onboarding")
    return { ok: true }
  } catch (err) {
    console.error("[onboarding] persist failed", err)
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Could not save onboarding state.",
    }
  }
}
