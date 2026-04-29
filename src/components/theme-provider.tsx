import * as React from "react"

import { themeToCssVars } from "@/lib/themes/css-vars"
import type { Theme } from "@/lib/themes/types"
import { cn } from "@/lib/utils"

interface ThemeProviderProps {
  theme: Theme
  className?: string
  children: React.ReactNode
}

export function ThemeProvider({ theme, className, children }: ThemeProviderProps) {
  const vars = themeToCssVars(theme) as React.CSSProperties
  return (
    <div
      data-theme={theme.slug}
      data-vibe={theme.vibe}
      data-mode={theme.mode}
      style={vars}
      className={cn(
        "apex-theme min-h-screen bg-[var(--apex-bg)] text-[var(--apex-fg)]",
        "font-[family-name:var(--apex-font-body)] antialiased",
        className
      )}
    >
      {children}
    </div>
  )
}
