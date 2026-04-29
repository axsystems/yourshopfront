import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

import type { Theme } from "@/lib/themes/types"

/**
 * Banner shown at the top of every /portfolio/[slug] page.
 * After Phase 2.5 every theme is buyable as a theme option, so the
 * banner is uniform — green "Theme option" pill, "I want this look"
 * CTA pointing at checkout.
 */
export function PortfolioBanner({ theme }: { theme: Theme }) {
  return (
    <div
      className="border-b"
      style={{
        background: "#064E3B",
        color: "#FFFFFF",
        borderColor: "#065F46",
      }}
    >
      <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex flex-none items-center rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-950"
          >
            Theme option
          </span>
          <p className="leading-snug">
            Previewing demo: <strong className="font-bold">{theme.name}</strong>
            <span className="ml-2 hidden text-white/70 sm:inline">
              — available as a theme option
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white/85 hover:text-white hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            See all portfolio
          </Link>
          <Link
            href={`/checkout?tier=subscription&demo=${theme.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-emerald-950 transition hover:-translate-y-0.5"
          >
            I want this look
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
