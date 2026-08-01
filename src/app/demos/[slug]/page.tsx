import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ThemedHome } from "@/components/home/themed-home"
import { HideWhenEmbedded } from "@/components/hide-when-embedded"
import { PortfolioBanner } from "@/components/portfolio/portfolio-banner"
import { MobileStickyCTA, MobileStickySpacer } from "@/components/apex/mobile-sticky-cta"
import { JsonLd } from "@/components/json-ld"
import {
  SITE_URL,
  breadcrumbSchema,
  canonicalThemeUrl,
  demoSchema,
  organizationSchema,
  themeMetaTitle,
} from "@/lib/seo"
import { allThemes, getTheme } from "@/lib/themes"
import { PROMO_SETUP } from "@/lib/pricing-constants"

interface PageProps {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  // After Phase 2.5 every theme is buyable, so /demos/[slug] resolves
  // for all 30 — useful for marketing, sharing, and ad targeting.
  return Object.keys(allThemes).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const theme = getTheme(slug)
  if (!theme) return {}
  const demoUrl = `${SITE_URL}/demos/${theme.slug}`
  const canonical = canonicalThemeUrl(theme.slug)
  // Brand-free base — the root layout's title template appends
  // " — Your Shopfront" to `title`, so this must NOT already carry it.
  // openGraph/twitter titles aren't templated, so they append it inline.
  const titleBase = themeMetaTitle(theme)

  return {
    title: titleBase,
    description: theme.seoDescription,
    alternates: { canonical },
    openGraph: {
      title: `${titleBase} — Your Shopfront`,
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
      title: `${titleBase} — Your Shopfront`,
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
            { name: "Portfolio", url: `${SITE_URL}/portfolio` },
            { name: theme.name, url: canonicalThemeUrl(theme.slug) },
          ]),
        ]}
      />
      <HideWhenEmbedded>
        <PortfolioBanner theme={theme} />
      </HideWhenEmbedded>
      <ThemedHome theme={theme} isDemoPreview isDemoRoute />
      {/* Our buy bar is chrome, and at phone widths it is the last piece of
          Your Shopfront branding visible inside a preview iframe. The
          spacer goes with it so an embedded render has no dead strip. */}
      <HideWhenEmbedded>
        <MobileStickySpacer />
        <MobileStickyCTA
          href={`/checkout?tier=subscription&promo=launch&demo=${theme.slug}`}
          label={`Get this site for ${PROMO_SETUP} →`}
          subLabel="30-day money-back"
        />
      </HideWhenEmbedded>
    </>
  )
}
