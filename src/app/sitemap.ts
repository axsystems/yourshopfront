import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/seo"
import { allThemes, themeOptionSlugs } from "@/lib/themes"

const NOW = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  const homepage: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: NOW,
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ]
  const demos: MetadataRoute.Sitemap = themeOptionSlugs.map((slug) => ({
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
  const portfolioDetails: MetadataRoute.Sitemap = Object.keys(allThemes).map((slug) => ({
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
      url: `${SITE_URL}/contact`,
      lastModified: NOW,
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ]
  return [
    ...homepage,
    ...demos,
    ...portfolioIndex,
    ...portfolioDetails,
    ...staticPages,
  ]
}
