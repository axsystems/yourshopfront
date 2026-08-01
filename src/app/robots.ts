import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // /api/og/ serves the per-theme Open Graph images consumed by social
        // crawlers and the portfolio grid thumbnails — a more specific Allow
        // wins over the broader /api/ Disallow for Googlebot and Bingbot.
        allow: ["/", "/api/og/"],
        disallow: ["/api/", "/dev/", "/tenant", "/onboarding"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
