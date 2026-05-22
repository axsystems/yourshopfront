import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ThemedHome } from "@/components/home/themed-home"
import { JsonLd } from "@/components/json-ld"
import {
  SITE_URL,
  breadcrumbSchema,
  demoSchema,
  organizationSchema,
} from "@/lib/seo"
import { allThemes, getTheme, isFeatured } from "@/lib/themes"

interface PageProps {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  // After Phase 2.5 every theme is buyable, so /demos/[slug] resolves
  // for all 24 — useful for marketing, sharing, and ad targeting.
  return Object.keys(allThemes).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const theme = getTheme(slug)
  if (!theme) return {}
  const demoUrl = `${SITE_URL}/demos/${theme.slug}`
  const portfolioUrl = `${SITE_URL}/portfolio/${theme.slug}`
  // Featured 10 self-canonical here; non-featured 14 canonical back to
  // /portfolio/[slug] (which is their canonical home).
  const canonical = isFeatured(theme.slug) ? demoUrl : portfolioUrl

  return {
    title: theme.seoTitle,
    description: theme.seoDescription,
    alternates: { canonical },
    openGraph: {
      title: theme.seoTitle,
      description: theme.seoDescription,
      url: demoUrl,
      type: "website",
      siteName: "Your Shopfront",
      images: [
        {
          url: `${SITE_URL}/api/og/${theme.slug}`,
          width: 1200,
          height: 630,
          alt: `${theme.name} demo — Your Shopfront`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: theme.seoTitle,
      description: theme.seoDescription,
      images: [`${SITE_URL}/api/og/${theme.slug}`],
    },
  }
}

export default async function DemoPage({ params }: PageProps) {
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
            { name: "Showcase", url: `${SITE_URL}/#showcase` },
            { name: theme.name, url: `${SITE_URL}/demos/${theme.slug}` },
          ]),
        ]}
      />
      <ThemedHome theme={theme} isDemoPreview />
    </>
  )
}
