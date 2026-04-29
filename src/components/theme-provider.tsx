import * as React from "react"

import { themeFontClassNames } from "@/lib/fonts"
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
  // Font subsetting: only this theme's display + body + mono fonts are
  // preloaded on this page — not all 9 we support globally.
  const fontClasses = themeFontClassNames(theme)
  return (
    <div
      data-theme={theme.slug}
      data-vibe={theme.vibe}
      data-mode={theme.mode}
      style={vars}
      className={cn(
        "apex-theme min-h-screen bg-[var(--apex-bg)] text-[var(--apex-fg)]",
        "font-[family-name:var(--apex-font-body)] antialiased",
        fontClasses,
        className
      )}
    >
      {children}
    </div>
  )
}
