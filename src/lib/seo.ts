import type { Theme } from "./themes/types"
import { isFeatured } from "./themes"
import {
  HOSTING_ADDON,
  ONE_TIME,
  ONE_TIME_PRICE,
  PROMO_PERIOD_LABEL,
  PROMO_SETUP,
  STANDARD_MONTHLY,
  STANDARD_MONTHLY_PRICE,
  STANDARD_SETUP,
} from "./pricing-constants"

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://yourshopfront.com"

export const SITE_NAME = "Your Shopfront"

export const ORG_DESCRIPTION =
  "Productized website design and hosting for small businesses. Pick one of 30 designs, send us your content, your site goes live in 24 hours."

/**
 * Single source of truth for which route a theme canonicalizes to.
 * Featured 10 self-canonical at /demos/[slug]; the other 20 self-canonical
 * at /portfolio/[slug] (their /demos/[slug] page exists too, for ad
 * targeting, but canonicals back here). Both route files and demoSchema()
 * must agree — duplicating this rule a third time is how it drifts.
 */
export function canonicalThemeUrl(slug: string): string {
  return isFeatured(slug)
    ? `${SITE_URL}/demos/${slug}`
    : `${SITE_URL}/portfolio/${slug}`
}

/**
 * Root layout's `metadata.title.template` is `"%s — Your Shopfront"`, so any
 * page-level title (incl. `theme.seoTitle` from the theme configs) must be
 * brand-free before it's handed to `title:` or the template doubles the
 * brand. Theme configs use two brand-carrying formats — strip both:
 *   - "Your Shopfront — <description>" (the 16 prefix-style titles)
 *   - "<Name> — <description> · Your Shopfront Portfolio" (the 14 suffix-style titles)
 * `openGraph.title` / `twitter.title` are NOT templated, so callers must
 * append " — Your Shopfront" themselves when they want the brand there.
 */
export function themeMetaTitle(theme: Theme): string {
  return theme.seoTitle
    .replace(/^Your Shopfront — /, "")
    .replace(/ · Your Shopfront Portfolio$/, "")
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: "Axon Labs LLC",
    url: SITE_URL,
    description: ORG_DESCRIPTION,
    logo: `${SITE_URL}/logo.png`,
    email: "hello@yourshopfront.com",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "hello@yourshopfront.com",
      availableLanguage: "en",
    },
    // Option B of Google's return-policy markup (a URL describing the
    // policy) rather than Option A (returnPolicyCategory + a fixed
    // merchantReturnDays window): the real policy on /refund-policy is
    // conditional per tier and per trigger event (worksheet submission,
    // source-code transfer, domain pointing), not a single "N days from
    // delivery" window, so forcing it into Option A would misstate it.
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      merchantReturnLink: `${SITE_URL}/refund-policy`,
    },
  }
}

/**
 * Machine-readable offers for the homepage and /pricing.
 *
 * `price` is deliberately the STANDARD list price, never the launch promo.
 * Structured data is crawled on Google's schedule, not ours: a promo price
 * published here outlives the promo by however long it takes to re-crawl,
 * so Google would keep serving $99/mo after we've gone back to charging
 * $149/mo. The list price is the durable, always-true claim; the promo is
 * a time-boxed discount and belongs in the human-readable `description`
 * (and in the visible page copy), which is exactly the split schema.org's
 * Offer model expects.
 *
 * No `priceValidUntil`: it's only meaningful for a price with a known end
 * date. Inventing one for a standing list price makes things worse — once
 * that date passes Google treats the price as expired and drops it.
 */
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
        price: String(STANDARD_MONTHLY_PRICE),
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: String(STANDARD_MONTHLY_PRICE),
          priceCurrency: "USD",
          billingDuration: "P1M",
        },
        description: `${STANDARD_SETUP} setup + ${STANDARD_MONTHLY}. Includes hosting, unlimited edits, SSL, backups, and security patches. Launch promo currently running: ${PROMO_SETUP} ${PROMO_PERIOD_LABEL}.`,
      },
      {
        "@type": "Offer",
        name: "One-time build",
        price: String(ONE_TIME_PRICE),
        priceCurrency: "USD",
        description: `${ONE_TIME} one-time. Full source code delivered. Optional ${HOSTING_ADDON} hosting addon.`,
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
    url: canonicalThemeUrl(theme.slug),
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
