import * as React from "react"
import { cn } from "@/lib/utils"

type Tone = "default" | "cobalt" | "coral" | "mint"

interface StatProps {
  /** The mono numeric value: e.g. "24h", "$199", "30 days". */
  value: string
  /** The label below the value. */
  label: string
  /** Optional small caption beneath the label. */
  caption?: string
  tone?: Tone
  className?: string
}

const TONE: Record<Tone, string> = {
  default: "text-apx-ink",
  cobalt: "text-apx-primary",
  coral: "text-apx-coral",
  mint: "text-apx-mint",
}

export function Stat({ value, label, caption, tone = "default", className }: StatProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <p
        className={cn(
          "font-mono text-[40px] font-bold leading-none tracking-tight md:text-[56px]",
          TONE[tone]
        )}
      >
        {value}
      </p>
      <p className="font-sans text-[15px] font-semibold text-apx-ink">{label}</p>
      {caption ? (
        <p className="text-[13px] text-apx-mute">{caption}</p>
      ) : null}
    </div>
  )
}
