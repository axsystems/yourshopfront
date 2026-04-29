import type { Metadata } from "next"
import Link from "next/link"

import { PortfolioGrid } from "@/components/portfolio/portfolio-grid"
import { JsonLd } from "@/components/json-ld"
import { SITE_URL, organizationSchema } from "@/lib/seo"
import { allThemes, isFeatured } from "@/lib/themes"

const PORTFOLIO_URL = `${SITE_URL}/portfolio`

const themesArray = Object.values(allThemes).sort((a, b) => {
  // Featured 10 first, then by round (R3 → R1 → R2), then alpha by name.
  const aFeatured = isFeatured(a.slug)
  const bFeatured = isFeatured(b.slug)
  if (aFeatured !== bFeatured) return aFeatured ? -1 : 1
  if (a.round !== b.round) {
    const order = { 3: 0, 1: 1, 2: 2 } as const
    return order[a.round] - order[b.round]
  }
  return a.name.localeCompare(b.name)
})

export const metadata: Metadata = {
  title: "Web Design Portfolio — Apex Sites",
  description:
    "24 production-grade websites for home-service businesses. Plumbers, painters, cleaners, roofers, electricians, and more — every design is available as a theme option on Apex Sites.",
  alternates: { canonical: PORTFOLIO_URL },
  openGraph: {
    title: "Web Design Portfolio — Apex Sites",
    description:
      "24 production-grade home-service websites — every one is available as a theme option.",
    url: PORTFOLIO_URL,
    type: "website",
    siteName: "Apex Sites",
    images: [
      {
        url: `${SITE_URL}/api/og/default`,
        width: 1200,
        height: 630,
        alt: "Apex Sites Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Design Portfolio — Apex Sites",
    description:
      "24 production-grade home-service websites — every one is available.",
  },
}

export default function PortfolioPage() {
  return (
    <>
      <JsonLd
        data={[
          organizationSchema(),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Apex Sites Portfolio",
            url: PORTFOLIO_URL,
            description:
              "24 production-grade home-service website designs across 3 design rounds.",
            isPartOf: {
              "@type": "WebSite",
              name: "Apex Sites",
              url: SITE_URL,
            },
            hasPart: themesArray.map((t) => ({
              "@type": "WebPage",
              name: t.name,
              url: `${SITE_URL}/portfolio/${t.slug}`,
            })),
          },
        ]}
      />
      <main className="bg-white">
        <section className="border-b border-neutral-200 bg-neutral-50">
          <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-10 md:py-28">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
              Portfolio · 2025–2026
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-[0.95] tracking-tight text-neutral-900 md:text-6xl lg:text-7xl">
              Every site we&apos;ve designed.
            </h1>
            <h2 className="mt-6 max-w-3xl text-2xl leading-snug text-neutral-700 md:text-3xl">
              {themesArray.length} production-grade home-service site designs across 3 design rounds — every one is available as a theme option.
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-neutral-600">
              Pick any of the {themesArray.length}, send us your content, we launch in 24 hours.
              The 10 featured on the homepage are our highest-converting starting lineup; the
              other 14 are equally buyable — they just live one click deeper.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <Link
                href="/#showcase"
                className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 font-semibold text-white transition hover:-translate-y-0.5"
              >
                See the featured 10 →
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-4 py-2 font-semibold text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
              >
                Pricing
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 py-14 md:px-10 md:py-20">
          <PortfolioGrid themes={themesArray} />
        </section>

        <section className="border-t border-neutral-200 bg-neutral-900 text-white">
          <div className="mx-auto grid max-w-[1400px] gap-8 px-6 py-20 md:grid-cols-[1.5fr_1fr] md:items-center md:px-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
                Don&apos;t see what you need?
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Tell us — we{" "}
                <span className="text-emerald-400">add new designs regularly</span>.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-neutral-300">
                If your industry, vibe, or hero pattern isn&apos;t represented in our 24, send
                a quick note. We may have something in the pipeline that suits you, or we&apos;ll
                add yours to the queue.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Link
                href="/contact?ref=portfolio-suggestion"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-6 py-3 font-bold text-emerald-950 transition hover:-translate-y-0.5 hover:bg-emerald-400"
              >
                Suggest a design →
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 px-6 py-3 font-semibold text-neutral-100 hover:border-white"
              >
                Compare both tiers
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
