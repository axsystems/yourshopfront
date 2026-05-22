import { z } from "zod"

// =============================================================================
// Your Shopfront — site_content validation
// =============================================================================
// Zod mirror of the SiteContent TypeScript types in src/lib/supabase.ts.
// Two flavors:
//
//   PartialSiteContentSchema — what the worksheet writes incrementally. Every
//     section is optional so a customer can save progress section-by-section.
//
//   CompleteSiteContentSchema — the bar that gates onboarding step 2 (and
//     therefore the ready_to_build status flip). Required: hero, contact,
//     ≥3 services, about, ≥1 service-area city. Reviews/photos optional.
//
// Both schemas accept and write the same JSONB shape — the difference is
// solely in which fields are required.
// =============================================================================

// -----------------------------------------------------------------------------
// Atomic shapes
// -----------------------------------------------------------------------------

export const HoursModeSchema = z.enum(["24/7", "hours"])

const TimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour HH:MM (e.g. 08:00)")

export const DayHoursSchema = z
  .object({
    open: TimeSchema.optional(),
    close: TimeSchema.optional(),
    closed: z.boolean().optional(),
  })
  .refine(
    (d) => d.closed === true || (d.open && d.close),
    "Set open and close times, or mark the day closed."
  )

export const WeekHoursSchema = z.object({
  mon: DayHoursSchema.optional(),
  tue: DayHoursSchema.optional(),
  wed: DayHoursSchema.optional(),
  thu: DayHoursSchema.optional(),
  fri: DayHoursSchema.optional(),
  sat: DayHoursSchema.optional(),
  sun: DayHoursSchema.optional(),
})

export const HeroSchema = z.object({
  headline: z.string().trim().min(3, "Headline is too short").max(140),
  subhead: z.string().trim().max(280).optional(),
  primaryCtaLabel: z.string().trim().max(40).optional(),
  primaryCtaHref: z.string().trim().max(2048).optional(),
})

export const ContactSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(7, "Phone is too short")
    .max(40)
    .regex(/^[\d+()\-.\s]+$/, "Use digits, spaces, and -/+/() only"),
  email: z.string().trim().email("Enter a valid email").max(254).optional(),
  address: z.string().trim().max(280).optional(),
  hoursMode: HoursModeSchema,
  hours: WeekHoursSchema.optional(),
})

export const ServiceSchema = z.object({
  title: z.string().trim().min(2, "Title is too short").max(80),
  blurb: z.string().trim().min(8, "Blurb is too short").max(280),
  priceFrom: z.string().trim().max(40).optional(),
})

export const AboutSchema = z.object({
  heading: z.string().trim().min(3, "Heading is too short").max(140),
  body: z.string().trim().min(40, "Add at least a couple sentences").max(1200),
})

export const ServiceAreaSchema = z.object({
  cities: z
    .array(z.string().trim().min(2).max(80))
    .min(1, "Add at least one city")
    .max(40),
})

export const ReviewSchema = z.object({
  author: z.string().trim().min(2).max(80),
  body: z.string().trim().min(8).max(600),
  rating: z
    .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
    .optional(),
  source: z.string().trim().max(40).optional(),
})

const allowedMediaHost = (() => {
  const url = process.env.SUPABASE_URL
  if (!url) return null
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
})()

const mediaUrlSchema = z
  .string()
  .trim()
  .url("Media URL must be a valid URL.")
  .refine((url) => {
    if (!allowedMediaHost) return false
    try {
      const parsed = new URL(url)
      return (
        parsed.protocol === "https:" && parsed.hostname === allowedMediaHost
      )
    } catch {
      return false
    }
  }, "Media URL must be on the configured Supabase Storage host.")

export const MediaSchema = z.object({
  logoUrl: mediaUrlSchema.optional(),
  heroUrl: mediaUrlSchema.optional(),
  gallery: z.array(mediaUrlSchema).max(40).optional(),
})

// -----------------------------------------------------------------------------
// Aggregate shapes
// -----------------------------------------------------------------------------

/** What the worksheet writes incrementally — every section optional. */
export const PartialSiteContentSchema = z.object({
  hero: HeroSchema.optional(),
  contact: ContactSchema.optional(),
  services: z.array(ServiceSchema).max(12).optional(),
  about: AboutSchema.optional(),
  serviceArea: ServiceAreaSchema.optional(),
  reviews: z.array(ReviewSchema).max(20).optional(),
  media: MediaSchema.optional(),
})

/**
 * The "complete enough to launch" bar. Used by `siteContentIsValid` to gate
 * onboarding step 2 (the content_sent → ready_to_build status flip).
 */
export const CompleteSiteContentSchema = z.object({
  hero: HeroSchema,
  contact: ContactSchema,
  services: z.array(ServiceSchema).min(3, "Add at least 3 services").max(12),
  about: AboutSchema,
  serviceArea: ServiceAreaSchema,
  reviews: z.array(ReviewSchema).max(20).optional(),
  media: MediaSchema.optional(),
})

export type PartialSiteContent = z.infer<typeof PartialSiteContentSchema>
export type CompleteSiteContent = z.infer<typeof CompleteSiteContentSchema>

// -----------------------------------------------------------------------------
// Discovery — 5-fact customer intake that seeds the AI copy draft
// -----------------------------------------------------------------------------
// Customers complete this form when copy_addon = true. The raw answers are
// persisted to sites.discovery_answers (audit trail) and fed to the LLM that
// produces sites.ai_copy_draft. Keep this lean — every extra field is a
// drop-off risk.

export const DiscoverySchema = z.object({
  yearsInBusiness: z.string().trim().min(1).max(40),
  whatMakesYouDifferent: z.string().trim().min(20).max(800),
  topServices: z.array(z.string().trim().min(2).max(120)).min(1).max(8),
  targetCustomer: z.string().trim().min(10).max(400),
  preferredTone: z.enum(["professional", "friendly", "premium", "direct"]),
})
export type Discovery = z.infer<typeof DiscoverySchema>
export type PreferredTone = Discovery["preferredTone"]
