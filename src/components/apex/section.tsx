import * as React from "react"
import { cn } from "@/lib/utils"

export type SectionBg = "paper" | "canvas" | "tint" | "primary-soft"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  bg?: SectionBg
}

const BG_CLASS: Record<SectionBg, string> = {
  paper: "bg-apx-paper text-apx-ink",
  canvas: "bg-apx-canvas text-apx-ink",
  tint: "bg-apx-tint text-apx-ink",
  "primary-soft": "bg-apx-primary-soft text-apx-ink",
}

export function Section({
  bg = "paper",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      {...props}
      className={cn("py-24 md:py-32", BG_CLASS[bg], className)}
    >
      {children}
    </section>
  )
}
