import * as React from "react"
import { cn } from "@/lib/utils"

interface PriceTagProps {
  /** The numeric value. e.g. "$299", "$149", "$997". */
  value: string
  /** Optional period suffix. e.g. "/mo", "once", "setup". */
  period?: string
  /** When true, render at hero size. */
  large?: boolean
  className?: string
}

/**
 * Mono numeric price with a thin coral underline beneath the value.
 * Apex chrome's signature element 3 — used everywhere a price renders.
 */
export function PriceTag({ value, period, large, className }: PriceTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1.5 font-mono font-semibold text-apx-ink",
        className
      )}
    >
      <span
        className={cn(
          "relative",
          "after:absolute after:inset-x-0 after:-bottom-1 after:h-[2px] after:bg-apx-coral after:content-['']",
          large ? "text-[44px] leading-none md:text-[56px]" : "text-[28px] leading-none"
        )}
      >
        {value}
      </span>
      {period ? (
        <span
          className={cn(
            "font-mono text-apx-mute",
            large ? "text-[16px]" : "text-[13px]"
          )}
        >
          {period}
        </span>
      ) : null}
    </span>
  )
}
