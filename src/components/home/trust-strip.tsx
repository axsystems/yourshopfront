import type { Theme, ThemeVibe } from "@/lib/themes/types"
import { Container } from "./primitives"

interface TrustStripProps {
  theme: Theme
}

/**
 * Themed truthful deliverable strip, used on /demos/[slug] and
 * /portfolio/[slug] inside <ThemedHome>. Mirrors the chrome StatStrip on /
 * (master brief §5.6) but renders in theme colors instead of Apex chrome
 * tokens. NO fake metrics.
 */
const CELLS = [
  { value: "24h", label: "Live within 24 hours", caption: "From content receipt" },
  { value: "24", label: "Designs ready to ship", caption: "Across home services and adjacent trades" },
  { value: "$0", label: "Setup commitment", caption: "Subscription tier — cancel any time" },
  { value: "30 days", label: "Money-back guarantee", caption: "On the first month" },
] as const

export function TrustStrip({ theme }: TrustStripProps) {
  const presentation = vibePresentation(theme.vibe)
  return (
    <div
      className="border-y"
      style={{
        background:
          presentation === "stark"
            ? "var(--apex-fg)"
            : presentation === "pill"
              ? "var(--apex-muted)"
              : "var(--apex-surface)",
        color:
          presentation === "stark"
            ? "var(--apex-bg)"
            : presentation === "pill"
              ? "var(--apex-fg)"
              : "var(--apex-surface-fg)",
        borderColor: "var(--apex-border)",
      }}
    >
      <Container className="grid grid-cols-2 gap-6 py-12 md:grid-cols-4 md:py-16">
        {CELLS.map((cell) => (
          <Cell
            key={cell.label}
            value={cell.value}
            label={cell.label}
            caption={cell.caption}
            presentation={presentation}
          />
        ))}
      </Container>
    </div>
  )
}

function vibePresentation(vibe: ThemeVibe): "stark" | "serif" | "pill" | "default" {
  switch (vibe) {
    case "bold-industrial":
      return "stark"
    case "warm-premium":
      return "serif"
    case "friendly-modern":
      return "pill"
    case "naturalist":
    case "sleek-tech":
    default:
      return "default"
  }
}

function Cell({
  value,
  label,
  caption,
  presentation,
}: {
  value: string
  label: string
  caption: string
  presentation: "stark" | "serif" | "pill" | "default"
}) {
  const isStark = presentation === "stark"
  return (
    <div
      className="flex flex-col gap-1.5"
      style={
        isStark
          ? { borderLeft: "3px solid var(--apex-primary)", paddingLeft: 16 }
          : undefined
      }
    >
      <p
        className="leading-none"
        style={{
          fontFamily: "var(--apex-font-display)",
          color: "var(--apex-primary)",
          fontSize: presentation === "serif" ? 48 : 40,
          fontWeight: presentation === "serif" ? 600 : 700,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </p>
      <p
        className="text-base font-bold leading-tight"
        style={{ fontFamily: "var(--apex-font-display)" }}
      >
        {label}
      </p>
      <p
        className="text-xs"
        style={{
          color: isStark
            ? "color-mix(in oklab, var(--apex-bg) 70%, transparent)"
            : "var(--apex-muted-fg)",
          fontFamily: "var(--apex-font-mono)",
          letterSpacing: "0.06em",
        }}
      >
        {caption}
      </p>
    </div>
  )
}
