"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { ChevronRight } from "lucide-react"

import { allThemes, featuredThemes } from "@/lib/themes"
import { cn } from "@/lib/utils"

/**
 * Sticky top bar — 60px desktop / 50px mobile. Renders on:
 *   /                       (homepage)
 *   /demos/[slug]           (any of the 24 themes — all are demoable)
 *   /portfolio/[slug]       (any of the 24 portfolio pages)
 * Hidden everywhere else, including inside iframes (?embed=1).
 *
 * The strip shows the curated 10 (featuredThemes), not all 24.
 * Clicking any square navigates to /demos/[slug] regardless of
 * which page you're on. A trailing "+N more →" pill links to /portfolio
 * so anyone interested in the non-curated 14 finds them.
 */
export function DemoSwitcher() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isEmbedded = searchParams?.get("embed") === "1"

  const demosMatch = pathname?.match(/^\/demos\/([^/]+)/)
  const portfolioMatch = pathname?.match(/^\/portfolio\/([^/]+)/)
  const activeSlug = demosMatch?.[1] ?? portfolioMatch?.[1] ?? null
  const activeTheme = activeSlug ? allThemes[activeSlug] : null

  const onHome = pathname === "/"
  const onDemoOrPortfolioDetail = !!activeTheme
  const moreCount = Object.keys(allThemes).length - featuredThemes.length

  if (isEmbedded) return null
  if (!onHome && !onDemoOrPortfolioDetail) return null

  return (
    <div
      className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur"
      data-demo-switcher
    >
      <div className="mx-auto flex h-[50px] max-w-[1500px] items-center gap-2 px-3 sm:h-[60px] sm:gap-4 sm:px-5">
        <Link
          href="/"
          className="flex flex-shrink-0 items-center gap-1.5 text-sm font-bold tracking-tight text-neutral-900 hover:opacity-70"
        >
          <span className="grid h-7 w-7 place-items-center rounded bg-neutral-900 text-xs font-black text-white">
            A
          </span>
          <span className="hidden sm:inline">Apex Sites</span>
        </Link>
        <span className="hidden flex-shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 sm:inline">
          Try a different look:
        </span>
        <div
          className="-mx-1 flex flex-1 items-center gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Theme switcher"
          role="tablist"
        >
          {featuredThemes.map((t) => {
            const active = activeSlug === t.slug
            return (
              <Link
                key={t.slug}
                href={`/demos/${t.slug}`}
                prefetch
                role="tab"
                aria-current={active ? "true" : undefined}
                aria-label={`${t.name} — ${t.industry}`}
                title={`${t.name} — ${t.industry}`}
                className={cn(
                  "group relative flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-md transition sm:h-10 sm:w-10",
                  active
                    ? "ring-2 ring-neutral-900 ring-offset-2 ring-offset-white"
                    : "ring-1 ring-neutral-200 hover:ring-neutral-400"
                )}
              >
                <span
                  className="absolute inset-0"
                  style={{ background: t.colors.primary }}
                  aria-hidden
                />
                <span
                  className="absolute right-0 top-0 h-full w-1/2"
                  style={{ background: t.colors.accent }}
                  aria-hidden
                />
                <span
                  className="absolute inset-x-0 bottom-0 grid h-3 place-items-center text-[8px] font-black uppercase tracking-tight"
                  style={{
                    background: t.colors.fg,
                    color: t.colors.bg,
                    fontFamily: "system-ui, sans-serif",
                  }}
                  aria-hidden
                >
                  {t.industry.slice(0, 3).toUpperCase()}
                </span>
              </Link>
            )
          })}
          {moreCount > 0 && (
            <Link
              href="/portfolio"
              className="ml-1 flex h-9 flex-shrink-0 items-center gap-1 rounded-full border border-dashed border-neutral-400 px-3 text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-700 transition hover:-translate-y-0.5 hover:border-neutral-900 hover:text-neutral-900 sm:h-10"
              aria-label={`See ${moreCount} more designs in the portfolio`}
            >
              +{moreCount} more
              <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
        {activeTheme && (
          <Link
            href={`/checkout?tier=subscription&demo=${activeTheme.slug}`}
            className="hidden flex-shrink-0 items-center gap-1 rounded-full bg-neutral-900 px-3.5 py-1.5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800 sm:inline-flex"
          >
            I want this look
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  )
}
