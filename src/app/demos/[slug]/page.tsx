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
import { getTheme, themeOptionSlugs } from "@/lib/themes"

interface PageProps {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return themeOptionSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const theme = getTheme(slug)
  if (!theme) return {}
  const url = `${SITE_URL}/demos/${theme.slug}`
  return {
    title: theme.seoTitle,
    description: theme.seoDescription,
    alternates: { canonical: url },
    openGraph: {
      title: theme.seoTitle,
      description: theme.seoDescription,
      url,
      type: "website",
      siteName: "Apex Sites",
      images: [
        {
          url: `${SITE_URL}/api/og/${theme.slug}`,
          width: 1200,
          height: 630,
          alt: `${theme.name} demo — Apex Sites`,
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
  if (!theme || !theme.isThemeOption) notFound()
  return (
    <>
      <JsonLd
        data={[
          organizationSchema(),
          demoSchema(theme),
          breadcrumbSchema([
            { name: "Home", url: SITE_URL },
            { name: "Showcase", url: `${SITE_URL}/#demos` },
            { name: theme.name, url: `${SITE_URL}/demos/${theme.slug}` },
          ]),
        ]}
      />
      <ThemedHome theme={theme} isDemoPreview />
    </>
  )
}
