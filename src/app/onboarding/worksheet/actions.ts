"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import {
  getSiteByStripeSessionId,
  isOnboardingComplete,
  siteContentIsValid,
  updateOnboardingState,
  updateSiteContent,
  updateSiteStatus,
  type OnboardingState,
  type SiteContent,
} from "@/lib/supabase"
import {
  AboutSchema,
  ContactSchema,
  HeroSchema,
  PhotosSchema,
  ReviewSchema,
  ServiceAreaSchema,
  ServiceSchema,
} from "@/lib/site-content/schema"

// =============================================================================
// /onboarding/worksheet server actions
// =============================================================================
// One action: saveWorksheetSection. Validates the section's payload with its
// Zod schema, merges into the site's existing site_content JSONB, writes
// back, then reconciles onboarding_state.content_sent against
// siteContentIsValid(merged). If that flip closes out all three onboarding
// steps, status moves to 'ready_to_build'.
//
// Access model: same Stripe-session-id bearer token as the checklist
// actions. Locked once status leaves 'pending_content'.
// =============================================================================

const SessionIdSchema = z.string().min(20).max(200)

const SectionEnum = z.enum([
  "hero",
  "contact",
  "services",
  "about",
  "serviceArea",
  "reviews",
  "photos",
])

const sectionSchemas = {
  hero: HeroSchema,
  contact: ContactSchema,
  services: z.array(ServiceSchema).max(12),
  about: AboutSchema,
  serviceArea: ServiceAreaSchema,
  reviews: z.array(ReviewSchema).max(20),
  photos: PhotosSchema,
} as const

export type ActionResult = { ok: true } | { ok: false; error: string }

export interface SaveSectionInput {
  sessionId: string
  section: z.infer<typeof SectionEnum>
  data: unknown
}

export async function saveWorksheetSection(
  input: SaveSectionInput
): Promise<ActionResult> {
  const sessionParse = SessionIdSchema.safeParse(input.sessionId)
  if (!sessionParse.success) {
    return { ok: false, error: "Invalid session." }
  }
  const sectionParse = SectionEnum.safeParse(input.section)
  if (!sectionParse.success) {
    return { ok: false, error: "Unknown section." }
  }
  const schema = sectionSchemas[sectionParse.data]
  const dataParse = schema.safeParse(input.data)
  if (!dataParse.success) {
    return { ok: false, error: dataParse.error.issues[0]?.message ?? "Invalid input." }
  }

  try {
    const site = await getSiteByStripeSessionId(sessionParse.data)
    if (!site) {
      return { ok: false, error: "Site not found for that session." }
    }
    if (site.status !== "pending_content") {
      return {
        ok: false,
        error: `Onboarding is locked (status: ${site.status}). Email hello@apexsites.com to change anything.`,
      }
    }

    const nextContent: SiteContent = {
      ...site.site_content,
      [sectionParse.data]: dataParse.data,
    }
    await updateSiteContent(site.id, nextContent)

    // Reconcile content_sent against the new structural validity.
    const valid = siteContentIsValid(nextContent)
    const prior: OnboardingState = site.onboarding_state ?? {}
    const priorComplete = prior.content_sent?.complete ?? false
    if (valid !== priorComplete) {
      const nextOnboarding: OnboardingState = {
        ...prior,
        content_sent: valid
          ? { complete: true, completed_at: new Date().toISOString() }
          : { complete: false },
      }
      await updateOnboardingState(site.id, nextOnboarding)
      if (isOnboardingComplete(nextOnboarding)) {
        await updateSiteStatus(site.id, "ready_to_build")
      }
    }

    revalidatePath("/onboarding")
    revalidatePath("/onboarding/worksheet")
    return { ok: true }
  } catch (err) {
    console.error("[worksheet] saveWorksheetSection failed", err)
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not save the worksheet.",
    }
  }
}
