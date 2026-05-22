import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { allThemesList, isFeatured } from "@/lib/themes"
import type { Theme } from "@/lib/themes/types"

/**
 * Sticky ribbon at the top of /portfolio/[slug]. Apex chrome tokens — no more
 * hardcoded #064E3B emerald. Shows "Design X of N" and prev/next arrows so the
 * gallery feels navigable rather than scattered. The "I want this look" CTA
 * jumps to checkout in cobalt.
 */
export function PortfolioBanner({ theme }: { theme: Theme }) {
  // Stable order: featured first, then by round, then alpha (matches /portfolio).
  const order = [...allThemesList].sort((a, b) => {
    const af = isFeatured(a.slug) ? 0 : 1
    const bf = isFeatured(b.slug) ? 0 : 1
    if (af !== bf) return af - bf
    if (a.round !== b.round) {
      const orderRound = { 3: 0, 1: 1, 2: 2 } as const
      return orderRound[a.round] - orderRound[b.round]
    }
    return a.name.localeCompare(b.name)
  })
  const idx = order.findIndex((t) => t.slug === theme.slug)
  const prev = idx > 0 ? order[idx - 1] : null
  const next = idx < order.length - 1 ? order[idx + 1] : null
  const total = order.length

  return (
    <div className="sticky top-0 z-40 border-b border-apx-line bg-apx-paper/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-3 px-4 sm:h-16 sm:px-6">
        <Link
          href="/portfolio"
          className="inline-flex flex-shrink-0 items-center gap-1.5 font-sans text-[13px] font-semibold text-apx-mute transition-colors hover:text-apx-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">All designs</span>
        </Link>

        <div className="hidden flex-1 items-center gap-3 sm:flex">
          {prev ? (
            <Link
              href={`/portfolio/${prev.slug}`}
              className="inline-flex items-center gap-1 font-sans text-[12px] font-semibold text-apx-mute transition-colors hover:text-apx-ink"
              prefetch
            >
              <ArrowLeft className="h-3 w-3" aria-hidden />
              {prev.name}
            </Link>
          ) : (
            <span aria-hidden className="w-0" />
          )}
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-apx-mute">
            Design {idx + 1} of {total} · {theme.name}
          </span>
          {next ? (
            <Link
              href={`/portfolio/${next.slug}`}
              className="inline-flex items-center gap-1 font-sans text-[12px] font-semibold text-apx-mute transition-colors hover:text-apx-ink"
              prefetch
            >
              {next.name}
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          ) : (
            <span aria-hidden className="w-0" />
          )}
        </div>

        <span className="flex-1 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-apx-mute sm:hidden">
          {idx + 1} / {total}
        </span>

        <Link
          href={`/checkout?tier=subscription&demo=${theme.slug}`}
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-apx-primary px-4 py-2 font-sans text-[12px] font-bold text-apx-primary-fg transition-transform hover:-translate-y-0.5 hover:bg-apx-primary-ink"
        >
          I want this look
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  )
}
