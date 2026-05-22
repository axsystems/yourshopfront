import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** When true, renders with a slightly stronger border (no shadow). */
  elevated?: boolean
}

export function Card({ elevated, className, children, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-xl border bg-apx-elev p-6 text-apx-ink transition-transform duration-150",
        elevated ? "border-apx-ink/15" : "border-apx-line",
        className
      )}
    >
      {children}
    </div>
  )
}
