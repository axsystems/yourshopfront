import type { Theme } from "@/lib/themes/types"
import { Container } from "./primitives"

interface TrustStripProps {
  theme: Theme
}

const CELLS = [
  { metric: "4.9 / 5.0", label: "Avg Google rating", icon: "★" },
  { metric: "100+", label: "Sites built", icon: "▲" },
  { metric: "24h", label: "Launch turnaround", icon: "◷" },
  { metric: "30 days", label: "Money-back guarantee", icon: "✓" },
]

export function TrustStrip({ theme }: TrustStripProps) {
  void theme
  return (
    <div
      className="border-y"
      style={{
        background: "var(--apex-surface)",
        borderColor: "var(--apex-border)",
      }}
    >
      <Container className="grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
        {CELLS.map((cell) => (
          <div key={cell.label} className="flex flex-col gap-1.5">
            <p
              className="text-3xl leading-none md:text-4xl"
              style={{
                fontFamily: "var(--apex-font-display)",
                color: "var(--apex-fg)",
                fontWeight: 700,
                letterSpacing: "-0.015em",
              }}
            >
              <span aria-hidden style={{ color: "var(--apex-primary)", marginRight: 8 }}>
                {cell.icon}
              </span>
              {cell.metric}
            </p>
            <p
              className="text-xs"
              style={{
                color: "var(--apex-muted-fg)",
                fontFamily: "var(--apex-font-mono)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {cell.label}
            </p>
          </div>
        ))}
      </Container>
    </div>
  )
}
