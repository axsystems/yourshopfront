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
  title: "Portfolio — All 30 designs",
  description:
    "30 production-grade website designs for small businesses of every kind — from barbers to law firms to trades. Every design is available as a theme option on Your Shopfront.",
  alternates: { canonical: PORTFOLIO_URL },
  openGraph: {
    title: "Portfolio — Your Shopfront",
    description:
      "30 production-grade website designs for small businesses — every one is available as a theme option.",
    url: PORTFOLIO_URL,
    type: "website",
    siteName: "Your Shopfront",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Your Shopfront Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio — Your Shopfront",
    description: "30 production-grade website designs for small businesses — every one is available.",
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
            name: "Your Shopfront Portfolio",
            url: PORTFOLIO_URL,
            description:
              "30 production-grade small business website designs across 3 design rounds.",
            isPartOf: { "@type": "WebSite", name: "Your Shopfront", url: SITE_URL },
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
