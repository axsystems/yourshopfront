import * as React from "react"
import { cn } from "@/lib/utils"

export function Container({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn("mx-auto w-full max-w-[1200px] px-6 md:px-10", className)}
    >
      {children}
    </div>
  )
}
