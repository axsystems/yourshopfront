import * as React from "react"
import { cn } from "@/lib/utils"

type Level = "display-2xl" | "display-xl" | "display-lg" | "display-md"

interface DisplayProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: Level
  as?: "h1" | "h2" | "h3" | "h4"
}

const LEVEL_CLASS: Record<Level, string> = {
  // mobile / desktop sizes per master brief §5.2
  "display-2xl": "text-[44px] leading-[0.98] md:text-[76px]",
  "display-xl": "text-[36px] leading-[0.98] md:text-[56px]",
  "display-lg": "text-[28px] leading-[1.05] md:text-[40px]",
  "display-md": "text-[22px] leading-[1.1] md:text-[28px]",
}

export function Display({
  level = "display-lg",
  as: As = "h2",
  className,
  children,
  ...props
}: DisplayProps) {
  return (
    <As
      {...props}
      className={cn(
        "font-sans font-bold tracking-[-0.02em] text-apx-ink",
        LEVEL_CLASS[level],
        className
      )}
    >
      {children}
    </As>
  )
}
