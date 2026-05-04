"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"

import { allThemes, isFeatured } from "@/lib/themes"
import { cn } from "@/lib/utils"
import { HeroFrame } from "./marks/hero-frame"

interface DemoCardProps {
  slug: string
  /** When true, wrap the card in <HeroFrame> (cobalt double-frame). Reserved for ~5–6 featured cards on /. */
  featured?: boolean
  /** When true, mount the iframe immediately (above-fold). When false, wait for IntersectionObserver. */
  eager?: boolean
  /** Override the link target. Defaults to /portfolio/[slug]. */
  href?: string
  className?: string
}

/**
 * Live mini-rendering of a theme demo, framed in Apex chrome.
 *
 * Implementation:
 *   - Top bar: browser-chrome row (3 traffic-light dots + mono URL pill).
 *   - Body: iframe at 0.42× scale of /demos/[slug]?embed=1.
 *   - The iframe src is held as a data attribute until the card scrolls
 *     within 200px of the viewport (IntersectionObserver). For above-fold
 *     cards (eager=true), src is assigned on mount.
 *   - Until the iframe's load event fires, a skeleton shimmer with the
 *     theme name centered is shown.
 *   - pointer-events: none on the iframe so the wrapping <Link> receives
 *     clicks (otherwise the iframe content swallows them).
 *   - On hover (when motion allowed): card lifts -2px, cobalt outline
 *     appears (HeroFrame for featured cards adds the double-frame).
 */
export function DemoCard({
  slug,
  featured = false,
  eager = false,
  href,
  className,
}: DemoCardProps) {
  const theme = allThemes[slug]
  const target = href ?? `/portfolio/${slug}`
  const reduce = useReducedMotion()

  const cardRef = React.useRef<HTMLDivElement | null>(null)
  // Initial state: eager → mount immediately; otherwise wait. The very-old-
  // browser fallback (no IntersectionObserver) is detected at render time so
  // we don't have to setState inside the effect.
  const [shouldMount, setShouldMount] = React.useState(() => {
    if (eager) return true
    if (typeof window === "undefined") return false
    return !("IntersectionObserver" in window)
  })
  const [iframeLoaded, setIframeLoaded] = React.useState(false)

  React.useEffect(() => {
    if (shouldMount) return
    const el = cardRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldMount(true)
            obs.disconnect()
            return
          }
        }
      },
      { rootMargin: "200px 0px" }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [shouldMount])

  if (!theme) return null

  const card = (
    <motion.div
      ref={cardRef}
      whileHover={reduce ? undefined : { y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-apx-line bg-apx-elev shadow-[0_1px_0_rgba(0,0,0,0.02)] transition-colors hover:border-apx-primary/40",
        className
      )}
    >
      <BrowserChrome slug={slug} themeName={theme.name} />
      <Link
        href={target}
        aria-label={`Open ${theme.name} — ${theme.industry} demo`}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-apx-primary"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-apx-tint">
          {!iframeLoaded ? <DemoCardSkeleton themeName={theme.name} /> : null}
          {shouldMount ? (
            <iframe
              src={`/demos/${slug}?embed=1`}
              title={`${theme.name} preview`}
              aria-hidden="true"
              tabIndex={-1}
              loading="lazy"
              onLoad={() => setIframeLoaded(true)}
              className={cn(
                "pointer-events-none absolute left-0 top-0 origin-top-left border-0 transition-opacity duration-300",
                iframeLoaded ? "opacity-100" : "opacity-0"
              )}
              style={{
                width: "238%",
                height: "238%",
                transform: "scale(0.42)",
                background: theme.colors.bg,
              }}
            />
          ) : null}
          <LivePreviewPill />
        </div>
        <div className="flex items-baseline justify-between gap-2 px-4 py-3">
          <p className="text-[14px] font-semibold text-apx-ink">{theme.name}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-apx-mute">
            {theme.industry}
          </p>
        </div>
      </Link>
    </motion.div>
  )

  if (featured) {
    return <HeroFrame className={isFeatured(slug) ? "" : ""}>{card}</HeroFrame>
  }
  return card
}

function BrowserChrome({ slug, themeName }: { slug: string; themeName: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-apx-line bg-apx-tint px-3 py-2">
      <div className="flex flex-none items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-apx-coral/70" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-apx-highlight/80" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-apx-mint/80" aria-hidden />
      </div>
      <div className="ml-1 min-w-0 flex-1 truncate rounded-md bg-apx-paper px-2 py-1 font-mono text-[10px] tracking-tight text-apx-mute">
        apexsites.com/demos/{slug}
      </div>
      <span
        aria-hidden
        className="hidden flex-none font-mono text-[10px] uppercase tracking-[0.14em] text-apx-mute sm:inline"
        title={themeName}
      >
        {themeName.split(" ")[0]}
      </span>
    </div>
  )
}

function LivePreviewPill() {
  return (
    <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-apx-line bg-apx-paper/95 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-apx-ink shadow-sm backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-apx-mint" aria-hidden />
      Live preview
    </span>
  )
}

export function DemoCardSkeleton({ themeName }: { themeName?: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-apx-tint">
      <div className="flex flex-col items-center gap-3">
        <div className="h-3 w-32 animate-pulse rounded-full bg-apx-line" />
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-apx-mute">
          {themeName ?? "Loading preview"}
        </div>
        <div className="h-2 w-20 animate-pulse rounded-full bg-apx-line" />
      </div>
    </div>
  )
}
