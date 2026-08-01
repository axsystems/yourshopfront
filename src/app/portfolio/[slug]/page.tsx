import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ThemedHome } from "@/components/home/themed-home"
import { AboutThisDesign } from "@/components/portfolio/about-this-design"
import { PortfolioBanner } from "@/components/portfolio/portfolio-banner"
import { JsonLd } from "@/components/json-ld"
import {
  SITE_URL,
  breadcrumbSchema,
  canonicalThemeUrl,
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
  // Featured 10 canonical at /demos/[slug]; non-featured 20 self-canonical
  // here at /portfolio/[slug]. The /demos/[slug] route also exists for the
  // 20 (so URLs work everywhere) but it canonicals back to /portfolio/[slug].
  const canonical = canonicalThemeUrl(theme.slug)

  // Brand-free base — the root layout's title template appends
  // " — Your Shopfront" to `title`, so this must NOT already carry it.
  // openGraph/twitter titles aren't templated, so they append it inline.
  const titleBase = `${theme.name} — Available as a theme option`

  return {
    title: titleBase,
    description: theme.seoDescription,
    alternates: { canonical },
    openGraph: {
      title: `${titleBase} — Your Shopfront`,
      description: theme.seoDescription,
      url: portfolioUrl,
      type: "website",
      siteName: "Your Shopfront",
      images: [
        {
          url: `${SITE_URL}/api/og/${theme.slug}`,
          width: 1200,
          height: 630,
          alt: `${theme.name} — Your Shopfront portfolio`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${titleBase} — Your Shopfront`,
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
