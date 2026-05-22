"use client"

import * as React from "react"
import Link from "next/link"

import { Button, Container, Display, Eyebrow, Lede, Section } from "@/components/apex"
import { DemoCard } from "@/components/apex/demo-card"
import { FadeUp } from "@/components/apex/motion/fade-up"
import { allThemesList, isFeatured } from "@/lib/themes"
import { cn } from "@/lib/utils"

type FilterKey = "all" | "home-services" | "trades" | "hospitality" | "creative"

interface FilterDef {
  key: FilterKey
  label: string
  /** Industries that match this filter. "all" means no filter. */
  industries?: string[]
}

const FILTERS: FilterDef[] = [
  { key: "all", label: "All 24" },
  {
    key: "home-services",
    label: "Home services",
    industries: [
      "Plumbing",
      "Plumbing & HVAC",
      "Lawn Care",
      "Painting",
      "Cleaning",
      "Roofing",
      "Tree Care",
      "Electrical",
      "Moving",
      "Pickup & Delivery",
      "General Services",
      "Premium Services",
    ],
  },
  {
    key: "trades",
    label: "Trades",
    industries: [
      "Plumbing",
      "Plumbing & HVAC",
      "Lawn Care",
      "Painting",
      "Roofing",
      "Tree Care",
      "Electrical",
      "Moving",
    ],
  },
  {
    key: "hospitality",
    label: "Hospitality",
    industries: [
      "Laundromat / Hospitality",
      "Restaurant / Pizza",
      "Yoga / Wellness",
      "Brewery / Taproom",
      "Wine Bar / Restaurant",
      "Bookstore / Press",
      "Florist / Apothecary",
    ],
  },
  {
    key: "creative",
    label: "Creative",
    industries: [
      "Design Studio",
      "Video / Film Studio",
      "Tech / Product",
      "Creative Agency",
      "Photographer / Director",
      "Developer Tools / SaaS",
      "Commercial / Healthcare Services",
    ],
  },
]

const VISIBLE_BEFORE_LINK = 12

export function HomeThemeGallery() {
  const [filterKey, setFilterKey] = React.useState<FilterKey>("all")

  // Featured themes first; non-featured after. Within each group, original order.
  const sorted = React.useMemo(() => {
    return [...allThemesList].sort((a, b) => {
      const af = isFeatured(a.slug) ? 0 : 1
      const bf = isFeatured(b.slug) ? 0 : 1
      return af - bf
    })
  }, [])

  const filtered = React.useMemo(() => {
    const def = FILTERS.find((f) => f.key === filterKey)
    if (!def?.industries) return sorted
    const set = new Set(def.industries)
    return sorted.filter((t) => set.has(t.industry))
  }, [filterKey, sorted])

  const visible = filtered.slice(0, VISIBLE_BEFORE_LINK)

  return (
    <Section bg="paper" id="gallery">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-[640px]">
            <Eyebrow>Gallery</Eyebrow>
            <Display level="display-xl" className="mt-5">
              30 designs. Pick one. Go live in a day.
            </Display>
            <Lede className="mt-5">
              Every card below is a real iframe of the actual demo site — not a screenshot. Click into one to see it full-size with your industry framed in.
            </Lede>
          </div>
          <Link
            href="/portfolio"
            className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-apx-mute transition-colors hover:text-apx-primary"
          >
            See all 24 →
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-2" role="group" aria-label="Filter designs by category">
          {FILTERS.map((f) => {
            const active = filterKey === f.key
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilterKey(f.key)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-4 py-2 font-mono text-[12px] uppercase tracking-[0.12em] transition-colors",
                  active
                    ? "border-apx-ink bg-apx-ink text-apx-paper"
                    : "border-apx-line bg-apx-paper text-apx-mute hover:border-apx-ink hover:text-apx-ink"
                )}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((t, i) => (
            <FadeUp key={t.slug} delay={Math.min(i * 40, 240)}>
              <DemoCard slug={t.slug} eager={i < 3} />
            </FadeUp>
          ))}
        </div>

        {filtered.length > VISIBLE_BEFORE_LINK ? (
          <div className="mt-12 flex justify-center">
            <Button href="/portfolio" variant="secondary" size="md">
              See all {filtered.length} →
            </Button>
          </div>
        ) : null}
      </Container>
    </Section>
  )
}
