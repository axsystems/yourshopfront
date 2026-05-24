import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { SalesAgent } from "@/components/apex/sales-agent"
import { DemoPalettePicker } from "@/components/home/demo-palette-picker"
import { DemoSwitcher } from "@/components/home/demo-switcher"
import { PlausibleAnalytics } from "@/components/plausible"
import { baseFontClassName } from "@/lib/fonts"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yourshopfront.com"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Your Shopfront — A website your business deserves",
    template: "%s — Your Shopfront",
  },
  description:
    "Pick one of 30 designs, send us your content, your site is live in 24 hours. Built for every small business.",
  applicationName: "Your Shopfront",
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
    siteName: "Your Shopfront",
    url: siteUrl,
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Your Shopfront — A website your business deserves",
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
        <Suspense fallback={null}>
          <SalesAgent />
        </Suspense>
        {/* Vercel Web Analytics — page views + Web Vitals. Co-exists with
            Plausible (different vendor surfaces, different dashboards). No
            env var or config required; reads NEXT_PUBLIC_VERCEL_* injected
            by Vercel at build time. */}
        <Analytics />
      </body>
    </html>
  )
}
