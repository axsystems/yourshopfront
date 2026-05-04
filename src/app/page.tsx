import type { Metadata } from "next"

import { SiteFooter, SiteHeader } from "@/components/apex"
import { HomeFaq } from "@/components/apex/home/faq"
import { HomeFinalCta } from "@/components/apex/home/final-cta"
import { HomeHero } from "@/components/apex/home/hero"
import { HomeHowItWorks } from "@/components/apex/home/how-it-works"
import { HomePricingTeaser } from "@/components/apex/home/pricing-teaser"
import { HomeStatStrip } from "@/components/apex/home/stat-strip"
import { HomeThemeGallery } from "@/components/apex/home/theme-gallery"
import { JsonLd } from "@/components/json-ld"
import { SITE_URL, organizationSchema, serviceSchema } from "@/lib/seo"

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Apex Sites — Websites for trades that book more jobs",
    description:
      "24 production-grade designs. Pick one, send us your content, your site is live in 24 hours. Subscription or one-time. Built for plumbers, painters, roofers, electricians.",
    url: SITE_URL,
    type: "website",
    siteName: "Apex Sites",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Apex Sites",
      },
    ],
  },
}

export default function Home() {
  return (
    <>
      <JsonLd data={[organizationSchema(), serviceSchema()]} />
      <SiteHeader variant="default" />
      <main id="main" className="flex-1 bg-apx-paper">
        <HomeHero />
        <HomeStatStrip />
        <HomeHowItWorks />
        <HomeThemeGallery />
        <HomePricingTeaser />
        <HomeFaq />
        <HomeFinalCta />
      </main>
      <SiteFooter variant="default" />
    </>
  )
}
