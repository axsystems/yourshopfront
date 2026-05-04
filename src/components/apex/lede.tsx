import * as React from "react"
import { cn } from "@/lib/utils"

export function Lede({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      {...props}
      className={cn(
        "max-w-2xl text-[18px] leading-[1.55] text-apx-mute md:text-[20px]",
        className
      )}
    >
      {children}
    </p>
  )
}
