import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type Size = "sm" | "md" | "lg"

interface LogoProps {
  /** Size of the mark + wordmark. sm = footer, md = header, lg = hero/og. */
  size?: Size
  /** When true, omit the wordmark and render only the mark. */
  markOnly?: boolean
  /** When false, do not wrap in a <Link>. Defaults to true. */
  asLink?: boolean
  className?: string
}

const MARK_SIZE: Record<Size, number> = { sm: 20, md: 24, lg: 40 }
const TEXT_SIZE: Record<Size, string> = {
  sm: "text-[14px]",
  md: "text-[16px]",
  lg: "text-[24px]",
}

export function Logo({ size = "md", markOnly, asLink = true, className }: LogoProps) {
  const dim = MARK_SIZE[size]
  const inner = (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-sans font-bold tracking-[-0.02em] text-apx-ink transition-colors group-hover:text-apx-primary",
        className
      )}
    >
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="flex-none"
      >
        <path
          d="M 12 2 L 22 22 L 18.4 22 L 12 9.2 L 5.6 22 L 2 22 Z"
          fill="currentColor"
        />
        <path d="M 8.45 14 L 12 5.6 L 15.55 14 Z" fill="var(--apx-primary)" />
        <path
          d="M 9.7 11 L 14.3 11 L 14.85 12.2 L 9.15 12.2 Z"
          fill="currentColor"
        />
        <path
          d="M 7.45 15.5 L 16.55 15.5 L 17.4 17.2 L 6.6 17.2 Z"
          fill="currentColor"
        />
      </svg>
      {!markOnly ? <span className={TEXT_SIZE[size]}>Your Shopfront</span> : null}
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
