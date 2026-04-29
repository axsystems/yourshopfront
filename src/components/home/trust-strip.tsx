import type { Theme, ThemeVibe } from "@/lib/themes/types"
import { Container } from "./primitives"

interface TrustStripProps {
  theme: Theme
}

const CELLS = [
  { metric: "★★★★★", value: "4.9 / 47", label: "Google reviews" },
  { metric: "100+", value: "sites launched", label: "Across 24 designs" },
  { metric: "24h", value: "delivery", label: "From content receipt" },
  { metric: "30 days", value: "money-back", label: "On the setup fee" },
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
      <Container className="grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
        {CELLS.map((cell) => (
          <Cell
            key={cell.label}
            metric={cell.metric}
            value={cell.value}
            label={cell.label}
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
  metric,
  value,
  label,
  presentation,
}: {
  metric: string
  value: string
  label: string
  presentation: "stark" | "serif" | "pill" | "default"
}) {
  const isPill = presentation === "pill"
  const isStark = presentation === "stark"
  return (
    <div
      className={
        isPill
          ? "rounded-2xl bg-[color-mix(in_oklab,var(--apex-bg)_70%,transparent)] p-4"
          : "flex flex-col"
      }
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
          fontSize: presentation === "serif" ? 36 : 28,
          fontWeight: presentation === "serif" ? 600 : 700,
          letterSpacing: "-0.02em",
        }}
      >
        {metric}
      </p>
      <p
        className="mt-2 text-base font-bold leading-tight"
        style={{ fontFamily: "var(--apex-font-display)" }}
      >
        {value}
      </p>
      <p
        className="mt-1 text-xs"
        style={{
          color: isStark
            ? "color-mix(in oklab, var(--apex-bg) 70%, transparent)"
            : "var(--apex-muted-fg)",
          fontFamily: "var(--apex-font-mono)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
    </div>
  )
}
