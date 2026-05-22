import Link from "next/link"
import { ArrowRight } from "lucide-react"

import type { Theme } from "@/lib/themes/types"
import { getPortfolioCopy } from "@/lib/portfolio-copy"

export function AboutThisDesign({ theme }: { theme: Theme }) {
  const copy = getPortfolioCopy(theme.slug)
  return (
    <section className="border-t border-neutral-200 bg-white py-20">
      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
          About this design
        </p>
        <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-neutral-900 md:text-4xl">
          {theme.name} — {theme.industry}
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-neutral-700">{copy}</p>

        <dl className="mt-10 grid grid-cols-2 gap-y-5 border-t border-neutral-200 pt-8 text-sm md:grid-cols-3">
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
              Design round
            </dt>
            <dd className="mt-1 font-semibold text-neutral-900">Round {theme.round}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
              Vibe
            </dt>
            <dd className="mt-1 font-semibold text-neutral-900">{theme.vibe}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
              Mode
            </dt>
            <dd className="mt-1 font-semibold capitalize text-neutral-900">{theme.mode}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
              Hero pattern
            </dt>
            <dd className="mt-1 font-semibold text-neutral-900">{theme.hero}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
              Display font
            </dt>
            <dd className="mt-1 font-semibold text-neutral-900">{theme.fonts.display}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
              Body font
            </dt>
            <dd className="mt-1 font-semibold text-neutral-900">{theme.fonts.body}</dd>
          </div>
        </dl>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href={`/checkout?tier=subscription&demo=${theme.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
          >
            I want this look — start subscription <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/checkout?tier=onetime&demo=${theme.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-900 hover:border-neutral-900"
          >
            Buy as one-time build
          </Link>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1.5 rounded-full px-5 py-3 text-sm font-semibold text-neutral-700 hover:text-neutral-900"
          >
            Browse the other 29 designs →
          </Link>
        </div>
      </div>
    </section>
  )
}
