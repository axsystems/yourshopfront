import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type Size = "sm" | "md" | "lg"

interface LogoProps {
  /** Size of the wordmark. sm = footer, md = header, lg = hero/og. */
  size?: Size
  /** When true, omit the wordmark and render nothing visible (kept so callers
   *  using `markOnly` for a graphic-only logo don't break — but with the SVG
   *  mark removed, the wordmark IS the brand). */
  markOnly?: boolean
  /** When false, do not wrap in a <Link>. Defaults to true. */
  asLink?: boolean
  className?: string
}

const TEXT_SIZE: Record<Size, string> = {
  sm: "text-[15px]",
  md: "text-[19px]",
  lg: "text-[28px]",
}

export function Logo({
  size = "md",
  markOnly,
  asLink = true,
  className,
}: LogoProps) {
  if (markOnly) {
    return null
  }
  const inner = (
    <span
      className={cn(
        "inline-flex items-center font-sans font-bold tracking-[-0.02em] text-apx-ink transition-colors group-hover:text-apx-primary",
        TEXT_SIZE[size],
        className
      )}
    >
      Your Shopfront
    </span>
  )

  if (!asLink) return inner
  return (
    <Link
      href="/"
      aria-label="Your Shopfront — home"
      className="group inline-flex items-center"
    >
      {inner}
    </Link>
  )
}
