import type { Metadata } from "next"
import Link from "next/link"

import { PortfolioGrid } from "@/components/portfolio/portfolio-grid"
import { JsonLd } from "@/components/json-ld"
import { SITE_URL, organizationSchema } from "@/lib/seo"
import { allThemes } from "@/lib/themes"

const PORTFOLIO_URL = `${SITE_URL}/portfolio`

const themesArray = Object.values(allThemes).sort((a, b) => {
  // Sort: theme options first, then by round (3 first, then 1, then 2),
  // then alphabetically by name within each group.
  if (a.isThemeOption !== b.isThemeOption) return a.isThemeOption ? -1 : 1
  if (a.round !== b.round) {
    const order = { 3: 0, 1: 1, 2: 2 } as const
    return order[a.round] - order[b.round]
  }
  return a.name.localeCompare(b.name)
})

export const metadata: Metadata = {
  title: "Web Design Portfolio — Apex Sites",
  description:
    "24 production-grade websites for home-service businesses. Plumbers, painters, cleaners, roofers, electricians, and more. 10 are available as theme options on Apex Sites; 14 are custom-build inspiration.",
  alternates: { canonical: PORTFOLIO_URL },
  openGraph: {
    title: "Web Design Portfolio — Apex Sites",
    description:
      "24 production-grade home-service websites across 3 design rounds.",
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
      "24 production-grade home-service websites across 3 design rounds.",
  },
}

export default function PortfolioPage() {
  const optionsCount = themesArray.filter((t) => t.isThemeOption).length
  const customCount = themesArray.length - optionsCount
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
              {themesArray.length} production-grade home-service site designs across 3 design rounds.
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-neutral-600">
              The top {optionsCount} are available as switchable theme options on Apex Sites — pick
              one, we swap your content in, you go live in 24 hours. The other{" "}
              {customCount} are showcase pieces — the original design files informed how we
              build, and they&apos;re available as fully-custom builds for businesses outside our
              standard categories.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <Link
                href="/#demos"
                className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 font-semibold text-white transition hover:-translate-y-0.5"
              >
                See the {optionsCount} switchable themes →
              </Link>
              <Link
                href="/contact?ref=portfolio"
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-4 py-2 font-semibold text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
              >
                Talk about a custom build
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
                Don&apos;t see what you want?
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                We do fully custom builds starting at{" "}
                <span className="text-emerald-400">$4,997</span>.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-neutral-300">
                Unique design from scratch, copywriting consultation, multiple revision rounds,
                full source code delivered, optional ongoing hosting. For businesses that need
                more than a theme swap.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Link
                href="/contact?ref=portfolio"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-6 py-3 font-bold text-emerald-950 transition hover:-translate-y-0.5 hover:bg-emerald-400"
              >
                Talk to us →
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 px-6 py-3 font-semibold text-neutral-100 hover:border-white"
              >
                Compare all tiers
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
