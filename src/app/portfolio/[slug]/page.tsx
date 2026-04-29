import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ThemedHome } from "@/components/home/themed-home"
import { AboutThisDesign } from "@/components/portfolio/about-this-design"
import { PortfolioBanner } from "@/components/portfolio/portfolio-banner"
import { JsonLd } from "@/components/json-ld"
import {
  SITE_URL,
  breadcrumbSchema,
  demoSchema,
  organizationSchema,
} from "@/lib/seo"
import { allThemes, getTheme } from "@/lib/themes"

interface PageProps {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(allThemes).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const theme = getTheme(slug)
  if (!theme) return {}

  const portfolioUrl = `${SITE_URL}/portfolio/${theme.slug}`
  const demoUrl = `${SITE_URL}/demos/${theme.slug}`
  // Theme options live canonically at /demos/[slug]; portfolio pages for those
  // 10 point their canonical at the demo URL to avoid duplicate-content issues.
  // The 14 portfolio-only pieces are self-canonical at /portfolio/[slug].
  const canonical = theme.isThemeOption ? demoUrl : portfolioUrl

  const title = theme.isThemeOption
    ? `${theme.name} — Available as a theme option · Apex Sites`
    : `${theme.name} — Custom build inspiration · Apex Sites`

  return {
    title,
    description: theme.seoDescription,
    alternates: { canonical },
    openGraph: {
      title,
      description: theme.seoDescription,
      url: portfolioUrl,
      type: "website",
      siteName: "Apex Sites",
      images: [
        {
          url: `${SITE_URL}/api/og/${theme.slug}`,
          width: 1200,
          height: 630,
          alt: `${theme.name} — Apex Sites portfolio`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: theme.seoDescription,
      images: [`${SITE_URL}/api/og/${theme.slug}`],
    },
  }
}

export default async function PortfolioDetailPage({ params }: PageProps) {
  const { slug } = await params
  const theme = getTheme(slug)
  if (!theme) notFound()
  return (
    <>
      <JsonLd
        data={[
          organizationSchema(),
          demoSchema(theme),
          breadcrumbSchema([
            { name: "Home", url: SITE_URL },
            { name: "Portfolio", url: `${SITE_URL}/portfolio` },
            { name: theme.name, url: `${SITE_URL}/portfolio/${theme.slug}` },
          ]),
        ]}
      />
      <PortfolioBanner theme={theme} />
      <ThemedHome theme={theme} isDemoPreview />
      <AboutThisDesign theme={theme} />
    </>
  )
}
