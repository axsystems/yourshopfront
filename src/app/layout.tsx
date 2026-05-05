import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import "./globals.css"

import { DemoPalettePicker } from "@/components/home/demo-palette-picker"
import { DemoSwitcher } from "@/components/home/demo-switcher"
import { PlausibleAnalytics } from "@/components/plausible"
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
  applicationName: "Apex Sites",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon-32.png"],
  },
  openGraph: {
    type: "website",
    siteName: "Apex Sites",
    url: siteUrl,
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Apex Sites — Websites that book more jobs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-default.png"],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${baseFontClassName} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <PlausibleAnalytics />
        <Suspense fallback={null}>
          <DemoSwitcher />
        </Suspense>
        <Suspense fallback={null}>
          <DemoPalettePicker />
        </Suspense>
        {children}
      </body>
    </html>
  )
}
