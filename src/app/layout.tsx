import type { Metadata } from "next"
import "./globals.css"

import { allFontVariables } from "@/lib/fonts"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://apexsites.com"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Apex Sites — Websites for home-service businesses that book more jobs",
    template: "%s — Apex Sites",
  },
  description:
    "Pick a style, we swap your content in, your site goes live in 24 hours. Subscription or one-time. Built for home-service businesses.",
  openGraph: {
    type: "website",
    siteName: "Apex Sites",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${allFontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
