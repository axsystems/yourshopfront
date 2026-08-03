import * as React from "react"

import type { Theme } from "@/lib/themes/types"
import type { SiteContent } from "@/lib/site-content/types"
import { DEFAULT_GALLERY_PLACEMENT } from "@/lib/site-content/types"
import { ThemeProvider } from "@/components/theme-provider"

import { CustomerAbout } from "./customer-about"
import { CustomerContact } from "./customer-contact"
import { CustomerFooter } from "./customer-footer"
import { CustomerGallery } from "./customer-gallery"
import { CustomerHeader } from "./customer-header"
import { CustomerHero } from "./customer-hero"
import { CustomerLeadSection } from "./customer-lead-section"
import { CustomerReviews } from "./customer-reviews"
import { CustomerServiceArea } from "./customer-service-area"
import { CustomerServices } from "./customer-services"

interface CustomerHomeProps {
  theme: Theme
  content: SiteContent
  businessName: string
  /**
   * Public subdomain slug. Required for lead capture — the form posts it
   * and /api/leads resolves the real site row from it. /tenant/page.tsx
   * always has one (it is what the row was resolved by), so every delivered
   * site renders the form; it stays optional for any future slug-less
   * surface, which simply renders without lead capture.
   */
  siteSlug?: string
}

/**
 * Customer-facing home composition for tenant subdomains. Theme tokens
 * (colors, fonts, button shape, radius) drive the visual style; copy comes
 * from site_content.
 *
 * Caller MUST have run siteContentIsValid(content) === true. The required
 * sections (hero, contact, services, about, serviceArea) are read with `!`
 * because that invariant is enforced upstream by the worksheet's gating
 * logic and by /tenant/page.tsx before mounting this component.
 */
export function CustomerHome({
  theme,
  content,
  businessName,
  siteSlug,
}: CustomerHomeProps) {
  const hasReviews = Boolean(content.reviews?.length)
  const hasGallery = Boolean(content.media?.gallery?.length)
  const placement =
    content.presentation?.galleryPlacement ?? DEFAULT_GALLERY_PLACEMENT

  const gallery = hasGallery ? (
    <CustomerGallery
      gallery={content.media!.gallery!}
      layout={content.presentation?.galleryLayout}
    />
  ) : null

  return (
    <ThemeProvider theme={theme}>
      <CustomerHeader
        businessName={businessName}
        contact={content.contact!}
        media={content.media}
        hasReviews={hasReviews}
        servicesHeading={content.presentation?.servicesHeading}
      />
      <main id="main" className="flex-1">
        <CustomerHero
          hero={content.hero!}
          contact={content.contact!}
          media={content.media}
          theme={theme}
        />
        {placement === "after-hero" ? gallery : null}
        <CustomerServices
          services={content.services!}
          heading={content.presentation?.servicesHeading}
        />
        {placement === "after-services" ? gallery : null}
        <CustomerAbout about={content.about!} />
        <CustomerServiceArea
          serviceArea={content.serviceArea!}
          businessName={businessName}
        />
        {hasReviews ? <CustomerReviews reviews={content.reviews!} /> : null}
        {/* Lead capture is universal: every delivered site gets the form, so
            no visitor is ever left with only a tel: link. The calculator is
            an optional enhancement rendered beside it when the owner
            configured one — it is not a gate in front of the form. */}
        {siteSlug ? (
          <CustomerLeadSection
            siteSlug={siteSlug}
            calculator={content.calculator}
          />
        ) : null}
        <CustomerContact contact={content.contact!} businessName={businessName} />
      </main>
      <CustomerFooter
        businessName={businessName}
        contact={content.contact!}
        services={content.services!}
        serviceArea={content.serviceArea!}
        servicesHeading={content.presentation?.servicesHeading}
      />
    </ThemeProvider>
  )
}
