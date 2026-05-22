"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { ChevronRight } from "lucide-react"

import { allThemes, featuredThemes } from "@/lib/themes"
import { cn } from "@/lib/utils"

/**
 * Sticky sub-nav for themed surfaces. After Phase 4, the SiteHeader
 * (variant="themed") sits above this — when the user scrolls past the
 * header, only this thin demo strip remains pinned. ARIA: navigation, not
 * tablist (the chips navigate, they don't switch panels).
 *
 * Renders on:
 *   /demos/[slug]
 *   /portfolio/[slug]
 *
 * Hidden everywhere else and inside iframes (?embed=1).
 */
export function DemoSwitcher() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isEmbedded = searchParams?.get("embed") === "1"

  // After Phase 4: DemoSwitcher only renders on /demos/[slug]. On
  // /portfolio/[slug] the <PortfolioBanner> serves as the nav strip
  // (prev/next + "I want this look") — stacking both sticky ribbons would
  // collide for top:0.
  const demosMatch = pathname?.match(/^\/demos\/([^/]+)/)
  const activeSlug = demosMatch?.[1] ?? null
  const activeTheme = activeSlug ? allThemes[activeSlug] : null

  const moreCount = Object.keys(allThemes).length - featuredThemes.length

  if (isEmbedded) return null
  if (!activeTheme) return null

  return (
    <div
      className="sticky top-0 z-40 border-b border-apx-line bg-apx-paper/95 backdrop-blur"
      data-demo-switcher
    >
      <div className="mx-auto flex h-12 max-w-[1500px] items-center gap-3 px-4 sm:h-14 sm:gap-4 sm:px-6">
        <span className="hidden flex-shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-apx-mute sm:inline">
          Try a different look:
        </span>
        <nav
          aria-label="Switch demo theme"
          className="-mx-1 flex flex-1 items-center gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {featuredThemes.map((t) => {
            const active = activeSlug === t.slug
            return (
              <Link
                key={t.slug}
                href={`/demos/${t.slug}`}
                prefetch
                aria-current={active ? "page" : undefined}
                aria-label={`${t.name} — ${t.industry}`}
                title={`${t.name} — ${t.industry}`}
                className={cn(
                  "group relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-md transition-shadow sm:h-9 sm:w-9",
                  active
                    ? "ring-2 ring-apx-primary ring-offset-2 ring-offset-apx-paper"
                    : "ring-1 ring-apx-line hover:ring-apx-ink"
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
                  className="absolute inset-x-0 bottom-0 grid h-2.5 place-items-center text-[7px] font-black uppercase tracking-tight"
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
              className="ml-1 flex h-8 flex-shrink-0 items-center gap-1 rounded-full border border-dashed border-apx-mute px-3 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-apx-mute transition-[transform,colors] hover:-translate-y-0.5 hover:border-apx-ink hover:text-apx-ink sm:h-9"
              aria-label={`See ${moreCount} more designs in the portfolio`}
            >
              +{moreCount} more
              <ChevronRight className="h-3 w-3" aria-hidden />
            </Link>
          )}
        </nav>
        {activeTheme && (
          <Link
            href={`/checkout?tier=subscription&demo=${activeTheme.slug}`}
            className="hidden flex-shrink-0 items-center gap-1 rounded-full bg-apx-primary px-3.5 py-1.5 font-sans text-[12px] font-bold text-apx-primary-fg transition-transform hover:-translate-y-0.5 hover:bg-apx-primary-ink sm:inline-flex"
          >
            I want this look
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  )
}
