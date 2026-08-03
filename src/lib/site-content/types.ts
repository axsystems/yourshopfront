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

/** Optional per-site rendering controls. Every unset field falls back to
 * the markup the tenant page rendered before this group existed. */
export interface SiteContentPresentation {
  servicesHeading?: SiteContentSectionHeading
  galleryLayout?: GalleryLayout
}

/**
 * Optional per-site estimate config. Consumed by the Workstream B2 estimate
 * tool — nothing in this repo renders it yet. The group as a whole is
 * optional; the five pricing fields are required inside it because an
 * estimate missing its rate or its unit cannot produce an honest number.
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

/** Minimum gallery size for AssetsStep to consider step 3 done. */
export const MIN_GALLERY_PHOTOS = 3

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
