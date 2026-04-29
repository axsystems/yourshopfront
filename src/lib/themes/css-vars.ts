import type { Theme } from "./types"

export function themeToCssVars(theme: Theme): Record<string, string> {
  const c = theme.colors
  const r = theme.radius
  return {
    "--apex-bg": c.bg,
    "--apex-fg": c.fg,
    "--apex-primary": c.primary,
    "--apex-primary-fg": c.primaryFg,
    "--apex-accent": c.accent,
    "--apex-accent-fg": c.accentFg,
    "--apex-muted": c.muted,
    "--apex-muted-fg": c.mutedFg,
    "--apex-border": c.border,
    "--apex-surface": c.surface,
    "--apex-surface-fg": c.surfaceFg,
    "--apex-radius-sm": r.sm,
    "--apex-radius-md": r.md,
    "--apex-radius-lg": r.lg,
    "--apex-radius-pill": r.pill,
    "--apex-font-display": `var(--font-${theme.fonts.display})`,
    "--apex-font-body": `var(--font-${theme.fonts.body})`,
    "--apex-font-mono": `var(--font-${theme.fonts.mono})`,
  }
}
