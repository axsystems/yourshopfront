import type { Theme } from "./themes/types"

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://apexsites.com"

export const SITE_NAME = "Apex Sites"

export const ORG_DESCRIPTION =
  "Productized website design and hosting for home-service businesses. Pick a style from 10 designed templates, we swap your content in, your site goes live in 24 hours."

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: ORG_DESCRIPTION,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "hello@apexsites.com",
      availableLanguage: "en",
    },
  }
}

export function serviceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Apex Sites — Productized Website Design",
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    areaServed: "United States",
    description: ORG_DESCRIPTION,
    offers: [
      {
        "@type": "Offer",
        name: "Subscription",
        price: "199",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "199",
          priceCurrency: "USD",
          billingDuration: "P1M",
        },
        description:
          "$499 setup + $199/mo. Includes hosting, unlimited edits, Google Business profile management.",
      },
      {
        "@type": "Offer",
        name: "One-time build",
        price: "2997",
        priceCurrency: "USD",
        description:
          "$2,997 one-time. Full source code delivered. Optional $29/mo hosting addon.",
      },
    ],
  }
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function demoSchema(theme: Theme) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: theme.seoTitle,
    description: theme.seoDescription,
    url: `${SITE_URL}/demos/${theme.slug}`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    about: {
      "@type": "Service",
      name: `${theme.name} style template`,
      provider: { "@type": "Organization", name: SITE_NAME },
      audience: { "@type": "BusinessAudience", audienceType: theme.industry },
    },
  }
}
