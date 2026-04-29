import * as React from "react"

import { cn } from "@/lib/utils"
import type { Theme, ThemeButton } from "@/lib/themes/types"

export function Container({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn("mx-auto w-full max-w-[1400px] px-6 md:px-10", className)}
    >
      {children}
    </div>
  )
}

export function Section({
  className,
  children,
  surface = false,
  invert = false,
  ...props
}: React.HTMLAttributes<HTMLElement> & { surface?: boolean; invert?: boolean }) {
  return (
    <section
      {...props}
      className={cn("py-20 md:py-28", className)}
      style={{
        background: invert
          ? "var(--apex-fg)"
          : surface
            ? "var(--apex-surface)"
            : "var(--apex-bg)",
        color: invert
          ? "var(--apex-bg)"
          : surface
            ? "var(--apex-surface-fg)"
            : "var(--apex-fg)",
      }}
    >
      {children}
    </section>
  )
}

export function Eyebrow({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
        className
      )}
      style={{
        background: "var(--apex-accent)",
        color: "var(--apex-accent-fg)",
        borderRadius: "var(--apex-radius-pill)",
      }}
    >
      {children}
    </span>
  )
}

export function Display({
  as: As = "h2",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2" | "h3" }) {
  return (
    <As
      {...props}
      className={cn("font-bold leading-[0.98] tracking-tight", className)}
      style={{ fontFamily: "var(--apex-font-display)" }}
    >
      {children}
    </As>
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline" | "accent"
  theme: Theme
  size?: "sm" | "md" | "lg"
  asChildHref?: string
}

export function ApexButton({
  variant = "primary",
  theme,
  size = "md",
  className,
  children,
  asChildHref,
  ...props
}: ButtonProps) {
  const styles = buttonStyles(theme.button, variant, size)
  if (asChildHref) {
    return (
      <a
        href={asChildHref}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5",
          className
        )}
        style={styles}
      >
        {children}
      </a>
    )
  }
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5",
        className
      )}
      style={styles}
    >
      {children}
    </button>
  )
}

function buttonStyles(
  cfg: ThemeButton,
  variant: "primary" | "ghost" | "outline" | "accent",
  size: "sm" | "md" | "lg"
): React.CSSProperties {
  const radius =
    cfg.shape === "pill"
      ? "var(--apex-radius-pill)"
      : cfg.shape === "rounded"
        ? "var(--apex-radius-md)"
        : "var(--apex-radius-sm)"
  const padding =
    size === "sm"
      ? "10px 16px"
      : size === "lg"
        ? "18px 32px"
        : "14px 24px"
  const fontWeight = cfg.weight === "heavy" ? 800 : cfg.weight === "bold" ? 700 : 500
  const fontSize = size === "sm" ? 13 : size === "lg" ? 16 : 15
  const base: React.CSSProperties = {
    fontFamily: "var(--apex-font-display)",
    fontWeight,
    fontSize,
    letterSpacing: cfg.uppercase ? "0.04em" : "0",
    textTransform: cfg.uppercase ? "uppercase" : "none",
    padding,
    borderRadius: radius,
    cursor: "pointer",
    border: "none",
    textDecoration: "none",
    transition: "all 0.15s ease",
  }
  if (variant === "primary") {
    base.background = "var(--apex-primary)"
    base.color = "var(--apex-primary-fg)"
    if (cfg.shadow === "hard-offset") base.boxShadow = "0 5px 0 var(--apex-fg)"
    if (cfg.shadow === "glow") base.boxShadow = "0 0 32px color-mix(in oklab, var(--apex-primary) 50%, transparent)"
    if (cfg.shadow === "soft") base.boxShadow = "0 12px 24px -8px color-mix(in oklab, var(--apex-primary) 35%, transparent)"
    return base
  }
  if (variant === "accent") {
    base.background = "var(--apex-accent)"
    base.color = "var(--apex-accent-fg)"
    return base
  }
  if (variant === "outline") {
    base.background = "transparent"
    base.color = "var(--apex-fg)"
    base.border = "1.5px solid var(--apex-fg)"
    return base
  }
  base.background = "transparent"
  base.color = "currentColor"
  base.borderBottom = "1.5px solid currentColor"
  base.borderRadius = "0"
  return base
}
