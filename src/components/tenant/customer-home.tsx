import * as React from "react"

import type { Theme } from "@/lib/themes/types"
import type { SiteContent } from "@/lib/site-content/types"
import { ThemeProvider } from "@/components/theme-provider"

import { CustomerAbout } from "./customer-about"
import { CustomerContact } from "./customer-contact"
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
export function CustomerHome({ theme, content, businessName }: CustomerHomeProps) {
  const hasReviews = Boolean(content.reviews?.length)
  const hasGallery = Boolean(content.media?.gallery?.length)
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
        <CustomerServices services={content.services!} />
        {hasGallery ? (
          <CustomerGallery gallery={content.media!.gallery!} />
        ) : null}
        <CustomerAbout about={content.about!} />
        <CustomerServiceArea
          serviceArea={content.serviceArea!}
          businessName={businessName}
        />
        {hasReviews ? <CustomerReviews reviews={content.reviews!} /> : null}
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
