import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/seo"
import { allThemes, featuredThemeSlugs, isFeatured } from "@/lib/themes"

const NOW = new Date()

/**
 * Sitemap lists each canonical URL exactly once.
 *
 * The featured 10 themes are canonical at /demos/[slug]. The non-featured
 * 14 are canonical at /portfolio/[slug]. Although both /demos/[slug] and
 * /portfolio/[slug] routes exist for every theme (so any URL works), only
 * the canonical form for each theme appears in the sitemap to avoid
 * "URL is not canonical" warnings in Search Console.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const homepage: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: NOW,
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ]
  const featuredDemos: MetadataRoute.Sitemap = featuredThemeSlugs.map((slug) => ({
    url: `${SITE_URL}/demos/${slug}`,
    lastModified: NOW,
    changeFrequency: "monthly",
    priority: 0.9,
  }))
  const portfolioIndex: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/portfolio`,
      lastModified: NOW,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ]
  const nonFeaturedPortfolio: MetadataRoute.Sitemap = Object.keys(allThemes)
    .filter((slug) => !isFeatured(slug))
    .map((slug) => ({
      url: `${SITE_URL}/portfolio/${slug}`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.7,
    }))
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/pricing`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: NOW,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: NOW,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: NOW,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/refund-policy`,
      lastModified: NOW,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]
  return [
    ...homepage,
    ...featuredDemos,
    ...portfolioIndex,
    ...nonFeaturedPortfolio,
    ...staticPages,
  ]
}
