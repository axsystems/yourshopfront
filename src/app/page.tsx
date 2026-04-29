import type { Metadata } from "next"

import { ThemedHome } from "@/components/apex/themed-home"
import { JsonLd } from "@/components/json-ld"
import { SITE_URL, organizationSchema, serviceSchema } from "@/lib/seo"
import { defaultTheme } from "@/lib/themes"

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Apex Sites — Websites for home-service businesses that book more jobs",
    description:
      "Pick a style, we swap your content in, your site goes live in 24 hours. Subscription or one-time. Built for home-service businesses.",
    url: SITE_URL,
    type: "website",
    siteName: "Apex Sites",
    images: [
      {
        url: `${SITE_URL}/api/og/default`,
        width: 1200,
        height: 630,
        alt: "Apex Sites",
      },
    ],
  },
}

export default function Home() {
  return (
    <>
      <JsonLd data={[organizationSchema(), serviceSchema()]} />
      <ThemedHome theme={defaultTheme} />
    </>
  )
}
