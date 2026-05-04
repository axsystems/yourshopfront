import type { Metadata } from "next"

import { SiteFooter, SiteHeader } from "@/components/apex"
import { JsonLd } from "@/components/json-ld"
import { PortfolioFinalCta } from "@/components/apex/portfolio/final-cta"
import { PortfolioGrid } from "@/components/apex/portfolio/grid"
import { PortfolioHero } from "@/components/apex/portfolio/hero"
import { SITE_URL, organizationSchema } from "@/lib/seo"
import { allThemes, isFeatured } from "@/lib/themes"

const PORTFOLIO_URL = `${SITE_URL}/portfolio`

const themesArray = Object.values(allThemes).sort((a, b) => {
  // Featured 10 first, then by round (R3 → R1 → R2), then alpha by name.
  const aFeatured = isFeatured(a.slug)
  const bFeatured = isFeatured(b.slug)
  if (aFeatured !== bFeatured) return aFeatured ? -1 : 1
  if (a.round !== b.round) {
    const order = { 3: 0, 1: 1, 2: 2 } as const
    return order[a.round] - order[b.round]
  }
  return a.name.localeCompare(b.name)
})

export const metadata: Metadata = {
  title: "Portfolio — All 24 designs",
  description:
    "24 production-grade websites for home-service businesses. Plumbers, painters, cleaners, roofers, electricians, and more — every design is available as a theme option on Apex Sites.",
  alternates: { canonical: PORTFOLIO_URL },
  openGraph: {
    title: "Portfolio — Apex Sites",
    description:
      "24 production-grade home-service websites — every one is available as a theme option.",
    url: PORTFOLIO_URL,
    type: "website",
    siteName: "Apex Sites",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Apex Sites Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio — Apex Sites",
    description: "24 production-grade home-service websites — every one is available.",
  },
}

export default function PortfolioPage() {
  return (
    <>
      <JsonLd
        data={[
          organizationSchema(),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Apex Sites Portfolio",
            url: PORTFOLIO_URL,
            description:
              "24 production-grade home-service website designs across 3 design rounds.",
            isPartOf: { "@type": "WebSite", name: "Apex Sites", url: SITE_URL },
            hasPart: themesArray.map((t) => ({
              "@type": "WebPage",
              name: t.name,
              url: `${SITE_URL}/portfolio/${t.slug}`,
            })),
          },
        ]}
      />
      <SiteHeader variant="default" />
      <main id="main" className="flex-1 bg-apx-paper">
        <PortfolioHero count={themesArray.length} />
        <PortfolioGrid themes={themesArray} />
        <PortfolioFinalCta />
      </main>
      <SiteFooter variant="default" />
    </>
  )
}
