"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

import { allThemes } from "@/lib/themes"
import { cn } from "@/lib/utils"

interface RotatingPreviewProps {
  /** Theme slugs to cycle through. Order is the cycle order. */
  slugs: string[]
  /** Auto-advance interval in ms. Default 5000. */
  intervalMs?: number
  className?: string
}

/**
 * Live mini-rendering of N theme demos that crossfade automatically.
 * - All N iframes mount on first paint (we want them ready, not lazy).
 * - The visible iframe gets opacity 1; the others 0. Crossfade is 300ms.
 * - Click any of the dots below to jump to a slug.
 * - Reduced-motion: instant swap (no opacity transition duration).
 */
export function RotatingPreview({
  slugs,
  intervalMs = 5000,
  className,
}: RotatingPreviewProps) {
  const reduce = useReducedMotion()
  const [index, setIndex] = React.useState(0)
  const [paused, setPaused] = React.useState(false)

  React.useEffect(() => {
    if (paused) return
    if (slugs.length <= 1) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slugs.length)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [slugs.length, intervalMs, paused])

  const activeSlug = slugs[index]
  const activeTheme = allThemes[activeSlug]

  return (
    <div
      className={cn("inline-flex w-full max-w-[560px] flex-col gap-3", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-apx-line bg-apx-elev">
        <BrowserChromeBar slug={activeSlug} />
        <div className="relative h-[calc(100%-32px)] w-full">
          {slugs.map((slug, i) => (
            <iframe
              key={slug}
              src={`/demos/${slug}?embed=1`}
              title={`${allThemes[slug]?.name ?? slug} preview`}
              aria-hidden="true"
              tabIndex={-1}
              loading="eager"
              className={cn(
                "pointer-events-none absolute left-0 top-0 origin-top-left border-0",
                reduce ? "transition-none" : "transition-opacity duration-300"
              )}
              style={{
                width: "200%",
                height: "200%",
                transform: "scale(0.5)",
                opacity: i === index ? 1 : 0,
                background: allThemes[slug]?.colors.bg ?? "#FFFFFF",
              }}
            />
          ))}
          <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-apx-line bg-apx-paper/95 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-apx-ink shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-apx-mint" aria-hidden />
            Live preview
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-2">
        <div className="flex flex-1 items-center gap-2">
          {slugs.map((slug, i) => (
            <button
              key={slug}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${allThemes[slug]?.name ?? slug} preview`}
              aria-pressed={i === index}
              className="group flex flex-1 flex-col gap-1 outline-none focus-visible:opacity-100"
            >
              <span
                className={cn(
                  "h-1 w-full rounded-full transition-colors",
                  i === index ? "bg-apx-primary" : "bg-apx-line group-hover:bg-apx-soft"
                )}
              />
              <span
                className={cn(
                  "text-left font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
                  i === index ? "text-apx-primary" : "text-apx-mute group-hover:text-apx-ink"
                )}
              >
                {allThemes[slug]?.industry ?? slug}
              </span>
            </button>
          ))}
        </div>
        <Link
          href={`/demos/${activeSlug}`}
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-apx-mute transition-colors hover:text-apx-primary"
        >
          Open →
        </Link>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={activeSlug}
          initial={reduce ? undefined : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="px-2 text-[13px] text-apx-mute"
        >
          {activeTheme?.tagline ?? ""}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

function BrowserChromeBar({ slug }: { slug: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-apx-line bg-apx-tint px-3 py-2">
      <div className="flex flex-none items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-apx-coral/70" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-apx-highlight/80" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-apx-mint/80" aria-hidden />
      </div>
      <div className="ml-1 min-w-0 flex-1 truncate rounded-md bg-apx-paper px-2 py-1 font-mono text-[10px] tracking-tight text-apx-mute">
        yourshopfront.com/demos/{slug}
      </div>
    </div>
  )
}
