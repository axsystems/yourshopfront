"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Theme, ThemeMode } from "@/lib/themes/types"

type RoundFilter = "all" | 1 | 2 | 3
type ModeFilter = "all" | ThemeMode

interface PortfolioGridProps {
  themes: Theme[]
}

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
    <div>
      <div className="mb-10 space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
        <FilterRow label="Round">
          <Chip active={round === "all"} onClick={() => setRound("all")}>
            All rounds <span className="opacity-60">· {themes.length}</span>
          </Chip>
          <Chip active={round === 3} onClick={() => setRound(3)}>R3 — Home-service brands</Chip>
          <Chip active={round === 1} onClick={() => setRound(1)}>R1 — Abstract concepts</Chip>
          <Chip active={round === 2} onClick={() => setRound(2)}>R2 — Brand personalities</Chip>
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
            className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 focus:border-neutral-900 focus:outline-none"
          >
            <option value="all">All industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </FilterRow>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          No designs match those filters.{" "}
          <button
            type="button"
            onClick={() => {
              setRound("all")
              setMode("all")
              setIndustry("all")
            }}
            className="font-semibold underline underline-offset-2"
          >
            Clear all
          </button>
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((theme) => (
            <PortfolioCard key={theme.slug} theme={theme} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 min-w-[68px] text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
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
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-semibold transition",
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
      )}
    >
      {children}
    </button>
  )
}

function PortfolioCard({ theme }: { theme: Theme }) {
  return (
    <Link
      href={`/portfolio/${theme.slug}`}
      className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Visual preview — uses /api/og/<slug> PNG instead of the old
          /portfolio-demos/<sourceHtmlPath> iframe. The OG generator renders
          each theme's bg color, primary accent, display font, eyebrow pill,
          and per-theme headline — so the 30 cards now read as 30 distinct
          designs at glance instead of 30 similarly-cropped iframes. Also a
          perf win: a single PNG vs 30 hidden iframes scaled to 238%. */}
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{ background: theme.colors.bg }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/og/${theme.slug}`}
          alt={`${theme.name} — ${theme.industry} preview`}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          loading="lazy"
        />
        {/* Launch-promo badge — sunshine highlight color signals "deal" more
            urgently than the prior generic emerald "Available →" badge.
            $99 across all 30 cards = price visible at-a-glance on the
            browse surface; matches the launch-promo language in the mobile
            sticky bar + Hero so prospects see consistent pricing wherever
            they enter the funnel. */}
        <span className="absolute right-3 top-3 rounded-full bg-apx-highlight px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-apx-highlight-ink">
          $99 launch
        </span>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-base font-bold text-neutral-900">{theme.name}</p>
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-neutral-500">
            R{theme.round}
          </p>
        </div>
        <p className="text-sm text-neutral-600">{theme.industry}</p>
        <p className="line-clamp-2 text-sm text-neutral-700">{theme.tagline}</p>
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {[
            theme.colors.bg,
            theme.colors.fg,
            theme.colors.primary,
            theme.colors.accent,
            theme.colors.muted,
          ].map((c, i) => (
            <span
              key={`${c}-${i}`}
              title={c}
              className="h-4 w-4 rounded-full border border-neutral-200"
              style={{ background: c }}
            />
          ))}
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 group-hover:text-neutral-900">
            View <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
          </span>
        </div>
        <p className="border-t border-neutral-100 pt-2 text-[11px] font-mono uppercase tracking-[0.14em] text-neutral-400">
          {theme.fonts.display} · {theme.fonts.body}
        </p>
      </div>
    </Link>
  )
}
