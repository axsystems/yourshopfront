import * as React from "react"
import { cn } from "@/lib/utils"

interface PriceTagProps {
  /** The numeric value. e.g. "$299", "$149", "$997". */
  value: string
  /** Optional period suffix. e.g. "/mo", "once", "setup". */
  period?: string
  /**
   * Original (pre-sale) value. When set, renders as a strikethrough chip
   * before the current `value` to signal a discount. Use for launch promo
   * pricing where customers need to see the saving.
   */
  originalValue?: string
  /** When true, render at hero size. */
  large?: boolean
  className?: string
}

/**
 * Mono numeric price with a thin coral underline beneath the value.
 * Apex chrome's signature element 3 — used everywhere a price renders.
 *
 * When `originalValue` is set, prepends a strikethrough version of the
 * pre-sale price to make the discount obvious (classic ecommerce sale
 * pattern). Helps with conversion when an ad shows the promo price and
 * the customer wants to see the "real" price to gauge value.
 */
export function PriceTag({
  value,
  period,
  originalValue,
  large,
  className,
}: PriceTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1.5 font-mono font-semibold text-apx-ink",
        className
      )}
    >
      {originalValue ? (
        <span
          className={cn(
            "font-mono font-normal text-apx-mute line-through",
            large ? "text-[20px] leading-none md:text-[24px]" : "text-[14px] leading-none"
          )}
        >
          {originalValue}
        </span>
      ) : null}
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
