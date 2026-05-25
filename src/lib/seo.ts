import type { Theme } from "./themes/types"

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://yourshopfront.com"

export const SITE_NAME = "Your Shopfront"

export const ORG_DESCRIPTION =
  "Productized website design and hosting for small businesses. Pick one of 30 designs, send us your content, your site goes live in 24 hours."

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
      email: "hello@yourshopfront.com",
      availableLanguage: "en",
    },
  }
}

export function serviceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Your Shopfront — Productized Website Design",
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    areaServed: "United States",
    description: ORG_DESCRIPTION,
    offers: [
      {
        "@type": "Offer",
        name: "Subscription",
        price: "149",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "149",
          priceCurrency: "USD",
          billingDuration: "P1M",
        },
        description:
          "$299 setup + $149/mo. Includes hosting, unlimited edits, SSL, backups, and security patches.",
      },
      {
        "@type": "Offer",
        name: "One-time build",
        price: "997",
        priceCurrency: "USD",
        description:
          "$997 one-time. Full source code delivered. Optional $49/mo hosting addon.",
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
