import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/seo"
import { themeSlugs } from "@/lib/themes"

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
  const demos: MetadataRoute.Sitemap = themeSlugs.map((slug) => ({
    url: `${SITE_URL}/demos/${slug}`,
    lastModified: NOW,
    changeFrequency: "monthly",
    priority: 0.9,
  }))
  return [...homepage, ...demos]
}
