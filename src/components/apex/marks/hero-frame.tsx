import * as React from "react"
import { cn } from "@/lib/utils"

interface HeroFrameProps {
  children: React.ReactNode
  className?: string
  /** Pixel offset of the cobalt outer rule from the content. Default 8. */
  offset?: number
}

/**
 * Cobalt double-frame. A 2px --apx-primary outline, offset N pixels from the
 * inner content. Used to anchor the rotating-theme preview on / and the
 * full-size demo iframe on /portfolio/[slug] as "an Apex design," not an
 * unframed standalone site.
 *
 * Implementation: wrap children in a div with a cobalt 2px outer ring via
 * CSS outline + outline-offset (cleaner than two nested divs since outline
 * doesn't affect layout flow).
 */
export function HeroFrame({ children, className, offset = 8 }: HeroFrameProps) {
  return (
    <div
      className={cn("relative inline-block", className)}
      style={{
        outline: "2px solid var(--apx-primary)",
        outlineOffset: `${offset}px`,
      }}
    >
      {children}
    </div>
  )
}
