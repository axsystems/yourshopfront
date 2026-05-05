"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"

import { allThemes } from "@/lib/themes"
import type { ColorVariant, Theme, ThemeColors } from "@/lib/themes/types"
import { cn } from "@/lib/utils"

function colorsToCssVarPairs(colors: ThemeColors): Array<[string, string]> {
  return [
    ["--apex-bg", colors.bg],
    ["--apex-fg", colors.fg],
    ["--apex-primary", colors.primary],
    ["--apex-primary-fg", colors.primaryFg],
    ["--apex-accent", colors.accent],
    ["--apex-accent-fg", colors.accentFg],
    ["--apex-muted", colors.muted],
    ["--apex-muted-fg", colors.mutedFg],
    ["--apex-border", colors.border],
    ["--apex-surface", colors.surface],
    ["--apex-surface-fg", colors.surfaceFg],
  ]
}

/**
 * Sticky pill below DemoSwitcher that swaps the active theme's 11 color CSS
 * variables on the wrapper `[data-theme="<slug>"]` element via direct
 * `style.setProperty()` mutation. No React re-renders of the demo tree —
 * just one paint per click.
 *
 * Renders only on /demos/[slug] when the active theme has `colorVariants`.
 * Self-resolves the active theme from `usePathname()` like DemoSwitcher,
 * so it drops into the global layout next to it with no per-page wiring.
 */
export function DemoPalettePicker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isEmbedded = searchParams?.get("embed") === "1"

  const demosMatch = pathname?.match(/^\/demos\/([^/]+)/)
  const activeSlug = demosMatch?.[1] ?? null
  const activeTheme: Theme | undefined = activeSlug
    ? allThemes[activeSlug]
    : undefined

  const variants = React.useMemo<Array<{ name: string; colors: ThemeColors }>>(
    () =>
      activeTheme
        ? [
            { name: "Default", colors: activeTheme.colors },
            ...((activeTheme.colorVariants ?? []) as ColorVariant[]),
          ]
        : [],
    [activeTheme]
  )

  // Pair the active variant index with the slug it applies to. When the user
  // navigates between demos, we reset the index during render (React's
  // blessed pattern) instead of a useEffect. The new demo's CSS vars are
  // already correct via SSR — we just sync our React state.
  const [paletteState, setPaletteState] = React.useState<{
    slug: string | null
    index: number
  }>({ slug: activeSlug, index: 0 })
  let activeIndex = paletteState.index
  if (paletteState.slug !== activeSlug) {
    setPaletteState({ slug: activeSlug, index: 0 })
    activeIndex = 0
  }

  const apply = React.useCallback(
    (index: number) => {
      if (!activeTheme) return
      const target = variants[index]
      if (!target) return
      const root = document.querySelector(
        `[data-theme="${activeTheme.slug}"]`
      ) as HTMLElement | null
      if (!root) return
      for (const [varName, varValue] of colorsToCssVarPairs(target.colors)) {
        root.style.setProperty(varName, varValue)
      }
      setPaletteState({ slug: activeTheme.slug, index })
    },
    [activeTheme, variants]
  )

  if (isEmbedded) return null
  if (!activeTheme) return null
  if (variants.length <= 1) return null

  return (
    <div
      className="sticky top-12 z-30 border-b border-apx-line bg-apx-paper/95 backdrop-blur sm:top-14"
      role="region"
      aria-label="Color palette"
    >
      <div className="mx-auto flex h-11 max-w-[1500px] items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <span className="hidden flex-shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-apx-mute sm:inline">
          Color way:
        </span>
        <div className="flex flex-1 items-center gap-2 overflow-x-auto">
          {variants.map((v, i) => {
            const active = i === activeIndex
            return (
              <button
                key={`${activeTheme.slug}-${v.name}-${i}`}
                type="button"
                onClick={() => apply(i)}
                aria-pressed={active}
                className={cn(
                  "inline-flex h-7 flex-shrink-0 items-center gap-2 rounded-full border px-3 text-[12px] font-semibold transition-colors",
                  active
                    ? "border-apx-ink bg-apx-ink text-apx-paper"
                    : "border-apx-line bg-apx-paper text-apx-ink hover:border-apx-ink"
                )}
              >
                <span
                  aria-hidden
                  className="flex h-3.5 w-3.5 overflow-hidden rounded-full ring-1 ring-black/10"
                >
                  <span
                    className="block h-full w-1/2"
                    style={{ background: v.colors.primary }}
                  />
                  <span
                    className="block h-full w-1/2"
                    style={{ background: v.colors.accent }}
                  />
                </span>
                {v.name}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
