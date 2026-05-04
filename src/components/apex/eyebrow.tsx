import * as React from "react"
import { cn } from "@/lib/utils"

type EyebrowTone = "mute" | "cobalt" | "coral"

interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: EyebrowTone
}

const TONE_CLASS: Record<EyebrowTone, string> = {
  mute: "text-apx-mute",
  cobalt: "text-apx-primary",
  coral: "text-apx-coral",
}

export function Eyebrow({
  tone = "mute",
  className,
  children,
  ...props
}: EyebrowProps) {
  return (
    <span
      {...props}
      className={cn(
        "inline-block font-mono text-[11px] font-semibold uppercase tracking-[0.16em]",
        TONE_CLASS[tone],
        className
      )}
    >
      {children}
    </span>
  )
}
