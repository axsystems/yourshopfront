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

export interface SiteContent {
  hero?: SiteContentHero
  contact?: SiteContentContact
  services?: SiteContentService[]
  about?: SiteContentAbout
  serviceArea?: SiteContentServiceArea
  reviews?: SiteContentReview[]
  media?: SiteContentMedia
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
