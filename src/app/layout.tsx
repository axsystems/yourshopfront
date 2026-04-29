import type { Metadata } from "next"
import { Suspense } from "react"
import "./globals.css"

import { DemoSwitcher } from "@/components/home/demo-switcher"
import { baseFontClassName } from "@/lib/fonts"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://apexsites.com"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Apex Sites — Websites that book more jobs",
    template: "%s — Apex Sites",
  },
  description:
    "Production-grade home-service websites, designed to convert. Pick a style, send us your content, we launch in 24 hours.",
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
    <html lang="en" className={`${baseFontClassName} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <DemoSwitcher />
        </Suspense>
        {children}
      </body>
    </html>
  )
}
