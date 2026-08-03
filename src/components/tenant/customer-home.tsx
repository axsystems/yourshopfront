import * as React from "react"

import type { Theme } from "@/lib/themes/types"
import type { SiteContent } from "@/lib/site-content/types"
import { DEFAULT_GALLERY_PLACEMENT } from "@/lib/site-content/types"
import { ThemeProvider } from "@/components/theme-provider"

import { CustomerAbout } from "./customer-about"
import { CustomerContact } from "./customer-contact"
import { CustomerEstimator } from "./customer-estimator"
import { CustomerFooter } from "./customer-footer"
import { CustomerGallery } from "./customer-gallery"
import { CustomerHeader } from "./customer-header"
import { CustomerHero } from "./customer-hero"
import { CustomerReviews } from "./customer-reviews"
import { CustomerServiceArea } from "./customer-service-area"
import { CustomerServices } from "./customer-services"

interface CustomerHomeProps {
  theme: Theme
  content: SiteContent
  businessName: string
  /**
   * Public subdomain slug. Required for lead capture — the form posts it
   * and /api/leads resolves the real site row from it. Undefined on
   * surfaces with no slug (a not-yet-provisioned preview), which simply
   * means no lead form renders.
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

  // The estimator (and the lead form inside it) is opt-in: it renders only
  // when the owner filled in the calculator worksheet section AND the site
  // has a provision slug to post against. A site with neither renders
  // exactly the markup it rendered before any of this existed.
  const calculator = content.calculator
  const showEstimator = Boolean(calculator && siteSlug)

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
        {showEstimator ? (
          <CustomerEstimator calculator={calculator!} siteSlug={siteSlug!} />
        ) : null}
        <CustomerContact contact={content.contact!} businessName={businessName} />
      </main>
      <CustomerFooter
        businessName={businessName}
        contact={content.contact!}
        services={content.services!}
        serviceArea={content.serviceArea!}
      />
    </ThemeProvider>
  )
}
