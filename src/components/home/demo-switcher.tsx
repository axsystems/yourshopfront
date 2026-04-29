"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { ChevronRight } from "lucide-react"

import { allThemes, themeOptions } from "@/lib/themes"
import { cn } from "@/lib/utils"

/**
 * Sticky top bar — 60px desktop / 50px mobile. Renders on:
 *   /                       (homepage)
 *   /demos/[slug]           (theme-option demo)
 *   /portfolio/[slug]       (any of the 24 portfolio pages)
 * Hidden everywhere else, including inside iframes (?embed=1).
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
          {themeOptions.map((t) => {
            const active = activeSlug === t.slug
            const href = onHome || demosMatch ? `/demos/${t.slug}` : `/portfolio/${t.slug}`
            return (
              <Link
                key={t.slug}
                href={href}
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
        </div>
        {activeTheme && <ContextualCta theme={activeTheme} />}
      </div>
    </div>
  )
}

function ContextualCta({ theme }: { theme: (typeof allThemes)[string] }) {
  if (theme.isThemeOption) {
    return (
      <Link
        href={`/checkout?tier=subscription&demo=${theme.slug}`}
        className="hidden flex-shrink-0 items-center gap-1 rounded-full bg-neutral-900 px-3.5 py-1.5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800 sm:inline-flex"
      >
        I want this look
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    )
  }
  return (
    <Link
      href={`/contact?ref=portfolio&piece=${theme.slug}`}
      className="hidden flex-shrink-0 items-center gap-1 rounded-full bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-amber-950 transition hover:-translate-y-0.5 hover:bg-amber-400 sm:inline-flex"
    >
      Get a custom quote
      <ChevronRight className="h-3.5 w-3.5" />
    </Link>
  )
}

