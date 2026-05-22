import * as React from "react"
import { cn } from "@/lib/utils"

interface HighlightStrokeProps {
  children: React.ReactNode
  className?: string
}

/**
 * Sunshine underline beneath a single hero keyword. Hand-drawn-feel — the
 * SVG path has a slight wobble so the underline reads as marker, not as a
 * solid rect. One per major page.
 *
 * Usage:
 *   <h1>Websites that <HighlightStroke>book</HighlightStroke> more jobs.</h1>
 */
export function HighlightStroke({ children, className }: HighlightStrokeProps) {
  return (
    <span className={cn("relative inline-block whitespace-nowrap", className)}>
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden
        viewBox="0 0 100 12"
        preserveAspectRatio="none"
        className="absolute -bottom-[0.05em] left-0 z-0 h-[0.32em] w-full"
        focusable="false"
      >
        <path
          d="M 0.6 7.4 C 18 6.0, 36 8.2, 56 6.6 C 76 5.0, 88 7.8, 99.4 6.4 L 99.4 11.4 C 88 11.8, 76 9.4, 56 11.0 C 36 12.6, 18 10.4, 0.6 12.0 Z"
          fill="var(--apx-highlight)"
        />
      </svg>
    </span>
  )
}
