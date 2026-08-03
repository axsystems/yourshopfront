// =============================================================================
// SiteContent — types + structural validator
// =============================================================================
// This module is client-safe (no `server-only` guard, no env access). The
// worksheet form, the checklist's ContentStep, and the customer-home
// composition all import from here.
//
// Mirrored in Zod at src/lib/site-content/schema.ts; edit both when
// adding/removing fields.
// =============================================================================

export type HoursMode = "24/7" | "hours"

export interface DayHours {
  open?: string
  close?: string
  closed?: boolean
}

export interface WeekHours {
  mon?: DayHours
  tue?: DayHours
  wed?: DayHours
  thu?: DayHours
  fri?: DayHours
  sat?: DayHours
  sun?: DayHours
}

export interface SiteContentHero {
  headline: string
  subhead?: string
  primaryCtaLabel?: string
  primaryCtaHref?: string
}

export interface SiteContentContact {
  phone: string
  email?: string
  address?: string
  hoursMode: HoursMode
  hours?: WeekHours
}

export interface SiteContentService {
  title: string
  blurb: string
  priceFrom?: string
}

export interface SiteContentAbout {
  heading: string
  body: string
}

export interface SiteContentServiceArea {
  cities: string[]
}

export interface SiteContentReview {
  author: string
  body: string
  rating?: 1 | 2 | 3 | 4 | 5
  source?: string
}

export interface SiteContentMedia {
  /** Customer logo, shown in the tenant page header. */
  logoUrl?: string
  /** Hero background or side image. */
  heroUrl?: string
  /** Gallery thumbnails shown in their own section if non-empty. */
  gallery?: string[]
}

/** Renameable section heading. Both halves independently optional. */
export interface SiteContentSectionHeading {
  eyebrow?: string
  title?: string
}

/**
 * How the gallery renders. "grid" is the historical (and default) look:
 * up to 12 aspect-square thumbs. "showcase" trades count for size — a
 * handful of large, full-width images.
 */
export type GalleryLayout = "grid" | "showcase"

/**
 * Where the gallery sits in the page order.
 *
 * "after-services" is the historical (and default) order: hero → services →
 * gallery. "after-hero" promotes the gallery to the first thing under the
 * hero, which is the right call for a visible-quality business where the
 * photos ARE the pitch — a painter's finished rooms, a wine bar's interior.
 */
export type GalleryPlacement = "after-services" | "after-hero"

/** Optional per-site rendering controls. Every unset field falls back to
 * the markup the tenant page rendered before this group existed. */
export interface SiteContentPresentation {
  servicesHeading?: SiteContentSectionHeading
  galleryLayout?: GalleryLayout
  galleryPlacement?: GalleryPlacement
}

/**
 * Optional per-site estimate config. The group as a whole is optional; the
 * five pricing fields are required inside it because an estimate missing
 * its rate or its unit cannot produce an honest number.
 *
 * Presence of this group is the opt-in switch for the tenant lead form: a
 * site without it renders exactly what it rendered before this existed.
 */
export interface SiteContentCalculator {
  /** Section heading, e.g. "Estimate your job". */
  heading: string
  /** Flat amount added to every estimate before the per-unit math. */
  baseAmount: number
  /** Amount charged per unit. */
  perUnitRate: number
  /** What one unit is, e.g. "square foot", "window", "hour". */
  unitLabel: string
  /** Floor — no estimate is quoted below this. */
  minimum: number
  /** Optional heading above the lead form the estimate feeds into. */
  leadFormHeading?: string
  /** Optional supporting line under the lead-form heading. */
  leadFormBlurb?: string
}

export interface SiteContent {
  hero?: SiteContentHero
  contact?: SiteContentContact
  services?: SiteContentService[]
  about?: SiteContentAbout
  serviceArea?: SiteContentServiceArea
  reviews?: SiteContentReview[]
  media?: SiteContentMedia
  presentation?: SiteContentPresentation
  calculator?: SiteContentCalculator
}

/**
 * The strings <CustomerServices> renders when no heading override is set.
 * Kept here (not in schema.ts) so client components can import them without
 * pulling in Zod or the server-only env read in that module.
 */
export const SERVICES_HEADING_DEFAULTS = {
  eyebrow: "Services",
  title: "What we do.",
} as const

/** Gallery layout used when `presentation.galleryLayout` is unset. */
export const DEFAULT_GALLERY_LAYOUT: GalleryLayout = "grid"

/** Gallery position used when `presentation.galleryPlacement` is unset —
 * the order every existing site already renders. */
export const DEFAULT_GALLERY_PLACEMENT: GalleryPlacement = "after-services"

/** Minimum gallery size for AssetsStep to consider step 3 done. */
export const MIN_GALLERY_PHOTOS = 3

/** Copy the lead form falls back to when the owner set no override. */
export const LEAD_FORM_DEFAULTS = {
  heading: "Get your estimate in writing",
  blurb:
    "Send your details and we'll come back with a firm price. No obligation.",
} as const

/** Hard ceiling on the units input, matched by the API's Zod schema. Keeps
 * a fat-fingered "999999999" from rendering an absurd estimate. */
export const MAX_CALCULATOR_UNITS = 100_000

/**
 * Ceiling on a computed estimate: the largest value leads.calculator_estimate
 * — numeric(12,2) — can hold. Both `perUnitRate` and `units` are individually
 * plausible while their product is not (100,000 units x a $100,000 rate is
 * 1e10), and an over-precision insert fails with Postgres 22003 rather than
 * anything the visitor could act on. Clamping is the honest failure: the
 * number is absurd either way, and a stored absurd number beats a 503.
 */
export const MAX_CALCULATOR_ESTIMATE = 9_999_999_999.99

/**
 * The estimate formula, defined once and used on BOTH sides.
 *
 * The client renders this live as the visitor types; the API recomputes it
 * from the site's stored config and ignores whatever number the client
 * sent. Both call this function, so the figure the visitor saw and the
 * figure the owner is emailed can never drift apart — which is also why the
 * MAX_CALCULATOR_ESTIMATE clamp lives HERE and not in the route: a clamp
 * applied on one side only would reintroduce exactly that drift.
 *
 * `minimum` is a floor, not an addend — a business that won't take a job
 * under $250 quotes $250 for a job the per-unit math prices at $180.
 * Returns null for a non-finite or negative unit count so callers never
 * have to render NaN.
 */
export function computeCalculatorEstimate(
  calculator: SiteContentCalculator,
  units: number
): number | null {
  if (!Number.isFinite(units) || units < 0) return null
  const raw = calculator.baseAmount + calculator.perUnitRate * units
  const withFloor = Math.max(calculator.minimum, raw)
  const clamped = Math.min(MAX_CALCULATOR_ESTIMATE, withFloor)
  // Two decimals: the DB column is numeric(12,2) and the value is money.
  return Math.round(clamped * 100) / 100
}

/**
 * Money formatting for every estimate the visitor sees. Whole dollars when
 * the amount is whole ("$1,250", not "$1,250.00") so a round rate doesn't
 * read like an invoice.
 */
export function formatEstimate(amount: number): string {
  const fractionDigits = Number.isInteger(amount) ? 0 : 2
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}

/**
 * "Is this site_content complete enough to launch?" — the bar that gates
 * onboarding step 2 and the content_sent → ready_to_build status flip.
 *
 * Cheap structural check (no Zod) so tenant pages and the checklist can
 * call this on every render. Worksheet writes use the Zod schema for
 * proper field-level error messages.
 */
export function siteContentIsValid(c: SiteContent): boolean {
  return Boolean(
    c.hero?.headline?.trim() &&
      c.contact?.phone?.trim() &&
      c.contact?.hoursMode &&
      c.services &&
      c.services.length >= 3 &&
      c.services.every((s) => s.title?.trim() && s.blurb?.trim()) &&
      c.about?.heading?.trim() &&
      c.about?.body?.trim() &&
      c.serviceArea?.cities &&
      c.serviceArea.cities.length >= 1
  )
}

/**
 * "Has the customer uploaded enough media?" — gates onboarding step 3.
 * Logo + at least MIN_GALLERY_PHOTOS gallery photos. Hero image is
 * optional.
 */
export function assetsAreSufficient(c: SiteContent): boolean {
  return Boolean(
    c.media?.logoUrl?.trim() &&
      c.media.gallery &&
      c.media.gallery.length >= MIN_GALLERY_PHOTOS
  )
}
