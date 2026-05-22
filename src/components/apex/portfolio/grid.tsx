"use client"

import * as React from "react"

import { Container, Section } from "@/components/apex"
import { DemoCard } from "@/components/apex/demo-card"
import { FadeUp } from "@/components/apex/motion/fade-up"
import { cn } from "@/lib/utils"
import type { Theme, ThemeMode } from "@/lib/themes/types"

type RoundFilter = "all" | 1 | 2 | 3
type ModeFilter = "all" | ThemeMode

interface PortfolioGridProps {
  themes: Theme[]
}

const EAGER_CAP = 6

/**
 * /portfolio grid. First 6 cards eager-mount (above the fold). The remaining
 * cards lazy-mount via DemoCard's IntersectionObserver — verifiable in
 * DevTools Network panel: filter by "Doc", scroll to top, hard reload —
 * should show ≤ 6 portfolio-demo HTML requests until you scroll.
 */
export function PortfolioGrid({ themes }: PortfolioGridProps) {
  const [round, setRound] = React.useState<RoundFilter>("all")
  const [mode, setMode] = React.useState<ModeFilter>("all")
  const [industry, setIndustry] = React.useState<string>("all")

  const industries = React.useMemo(() => {
    const set = new Set(themes.map((t) => t.industry))
    return Array.from(set).sort()
  }, [themes])

  const filtered = React.useMemo(() => {
    return themes.filter((t) => {
      if (round !== "all" && t.round !== round) return false
      if (mode !== "all" && t.mode !== mode) return false
      if (industry !== "all" && t.industry !== industry) return false
      return true
    })
  }, [themes, round, mode, industry])

  return (
    <Section bg="paper">
      <Container>
        <div
          className="mb-10 flex flex-col gap-4 rounded-2xl border border-apx-line bg-apx-tint p-5"
          role="group"
          aria-label="Filter portfolio designs"
        >
          <FilterRow label="Round">
            <Chip active={round === "all"} onClick={() => setRound("all")}>
              All rounds <span className="opacity-60">· {themes.length}</span>
            </Chip>
            <Chip active={round === 3} onClick={() => setRound(3)}>R3 — Home services</Chip>
            <Chip active={round === 1} onClick={() => setRound(1)}>R1 — Concepts</Chip>
            <Chip active={round === 2} onClick={() => setRound(2)}>R2 — Personalities</Chip>
          </FilterRow>
          <FilterRow label="Mode">
            <Chip active={mode === "all"} onClick={() => setMode("all")}>All modes</Chip>
            <Chip active={mode === "emergency"} onClick={() => setMode("emergency")}>Emergency</Chip>
            <Chip active={mode === "recurring"} onClick={() => setMode("recurring")}>Recurring</Chip>
            <Chip active={mode === "project"} onClick={() => setMode("project")}>Project</Chip>
          </FilterRow>
          <FilterRow label="Industry">
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="rounded-full border border-apx-line bg-apx-paper px-3 py-1.5 font-sans text-[14px] font-medium text-apx-ink focus:border-apx-primary focus:outline-none"
            >
              <option value="all">All industries</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </FilterRow>
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-apx-line p-10 text-center text-apx-mute">
            No designs match those filters.{" "}
            <button
              type="button"
              onClick={() => {
                setRound("all")
                setMode("all")
                setIndustry("all")
              }}
              className="font-semibold text-apx-ink underline underline-offset-2 hover:text-apx-primary"
            >
              Clear all
            </button>
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((theme, i) => (
              <FadeUp key={theme.slug} delay={Math.min(i * 30, 240)}>
                <DemoCard slug={theme.slug} eager={i < EAGER_CAP} />
              </FadeUp>
            ))}
          </div>
        )}
      </Container>
    </Section>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 min-w-[68px] font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-apx-mute">
        {label}
      </span>
      {children}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 font-sans text-[13px] font-semibold transition-colors",
        active
          ? "border-apx-ink bg-apx-ink text-apx-paper"
          : "border-apx-line bg-apx-paper text-apx-mute hover:border-apx-ink hover:text-apx-ink"
      )}
    >
      {children}
    </button>
  )
}
