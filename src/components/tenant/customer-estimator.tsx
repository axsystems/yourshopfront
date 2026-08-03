"use client"

import * as React from "react"
import { Minus, Plus } from "lucide-react"

import type { SiteContentCalculator } from "@/lib/site-content/types"
import {
  computeCalculatorEstimate,
  formatEstimate,
  MAX_CALCULATOR_UNITS,
} from "@/lib/site-content/types"

interface CustomerEstimatorProps {
  calculator: SiteContentCalculator
  /** Current unit count. Owned by <CustomerLeadSection> so the lead form
   * that sits beside this card can send the same number. */
  units: number
  onUnitsChange: (next: number) => void
}

/** Where the slider/stepper starts. One unit, not zero — a $0-looking
 * estimate on first paint reads as broken. */
export const INITIAL_ESTIMATOR_UNITS = 1

/**
 * Instant-estimate tool. Renders the calculator card only — the lead form
 * it feeds is a SIBLING, composed by <CustomerLeadSection>, because that
 * form must also render on sites that have no calculator at all.
 *
 * This is an ESTIMATE, not a quote. The number moves with a single input
 * and knows nothing about access, condition, or scope, so the copy says so
 * plainly rather than implying a locked-in price. The same formula runs
 * server-side in /api/leads, so what the visitor saw is what the owner is
 * emailed.
 */
export function CustomerEstimator({
  calculator,
  units,
  onUnitsChange,
}: CustomerEstimatorProps): React.JSX.Element {
  const estimate = computeCalculatorEstimate(calculator, units) ?? 0
  const atMinimum = estimate <= calculator.minimum
  const ceiling = React.useMemo(() => sliderCeiling(calculator), [calculator])

  const setUnits = (next: number) => onUnitsChange(clampUnits(next))
  const bump = (delta: number) => setUnits(units + delta)

  return (
    <div
      className="flex flex-col overflow-hidden p-7"
      style={{
        background: "var(--apex-surface)",
        color: "var(--apex-surface-fg)",
        border: "1px solid var(--apex-border)",
        borderRadius: "var(--apex-radius-lg)",
      }}
    >
      <label
        htmlFor="estimator-units"
        className="text-[11px] font-bold uppercase tracking-[0.16em]"
        style={{
          color: "var(--apex-muted-fg)",
          fontFamily: "var(--apex-font-mono)",
        }}
      >
        How many {pluralize(calculator.unitLabel)}?
      </label>

      <div className="mt-4 flex items-center gap-3">
        <StepButton
          label={`Decrease ${calculator.unitLabel} count`}
          onClick={() => bump(-1)}
          disabled={units <= 0}
        >
          <Minus className="h-4 w-4" strokeWidth={3} aria-hidden />
        </StepButton>
        <input
          id="estimator-units"
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_CALCULATOR_UNITS}
          value={units}
          onChange={(e) => setUnits(Number(e.target.value))}
          className="w-full min-w-0 px-4 py-3 text-center text-2xl font-bold outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--apex-primary)]"
          style={{
            background: "var(--apex-bg)",
            color: "var(--apex-fg)",
            border: "1px solid var(--apex-border)",
            borderRadius: "var(--apex-radius-md)",
            fontFamily: "var(--apex-font-display)",
          }}
        />
        <StepButton
          label={`Increase ${calculator.unitLabel} count`}
          onClick={() => bump(1)}
          disabled={units >= MAX_CALCULATOR_UNITS}
        >
          <Plus className="h-4 w-4" strokeWidth={3} aria-hidden />
        </StepButton>
      </div>

      <input
        type="range"
        aria-label={`${calculator.unitLabel} count slider`}
        min={0}
        max={ceiling}
        value={Math.min(units, ceiling)}
        onChange={(e) => setUnits(Number(e.target.value))}
        className="mt-5 w-full cursor-pointer"
        style={{ accentColor: "var(--apex-primary)" }}
      />

      {/* The math, shown rather than asserted. A visitor who can see
          how the number was built trusts it more than a number that
          simply appears — and it makes the minimum's effect obvious
          instead of looking like a glitch. */}
      <dl
        className="mt-8 space-y-2.5 border-t pt-6 text-sm"
        style={{ borderColor: "var(--apex-border)" }}
      >
        <BreakdownRow
          term="Starting price"
          value={formatEstimate(calculator.baseAmount)}
        />
        <BreakdownRow
          term={`${units.toLocaleString("en-US")} ${
            units === 1 ? calculator.unitLabel : pluralize(calculator.unitLabel)
          } × ${formatEstimate(calculator.perUnitRate)}`}
          value={formatEstimate(calculator.perUnitRate * units)}
        />
        {atMinimum ? (
          <BreakdownRow
            term="Minimum job charge"
            value={formatEstimate(calculator.minimum)}
            emphasis
          />
        ) : null}
      </dl>

      <div
        className="mt-7 border-t pt-6"
        style={{ borderColor: "var(--apex-border)" }}
      >
        <p
          className="text-[11px] font-bold uppercase tracking-[0.16em]"
          style={{
            color: "var(--apex-muted-fg)",
            fontFamily: "var(--apex-font-mono)",
          }}
        >
          Ballpark estimate
        </p>
        <p
          className="mt-2 text-5xl font-bold leading-none tabular-nums sm:text-6xl"
          style={{
            fontFamily: "var(--apex-font-display)",
            letterSpacing: "-0.03em",
          }}
          aria-live="polite"
        >
          {formatEstimate(estimate)}
        </p>
        <p
          className="mt-3 text-[13px] leading-relaxed"
          style={{ color: "var(--apex-muted-fg)" }}
        >
          An estimate, not a quote. The final price depends on what we
          find on site.
        </p>
      </div>
    </div>
  )
}

function BreakdownRow({
  term,
  value,
  emphasis,
}: {
  term: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt style={{ color: emphasis ? undefined : "var(--apex-muted-fg)" }}>
        {term}
      </dt>
      <dd
        className="tabular-nums"
        style={{ fontWeight: emphasis ? 700 : 500 }}
      >
        {value}
      </dd>
    </div>
  )
}

function StepButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-12 w-12 flex-shrink-0 place-items-center transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        background: "var(--apex-bg)",
        color: "var(--apex-fg)",
        border: "1px solid var(--apex-border)",
        borderRadius: "var(--apex-radius-md)",
      }}
    >
      {children}
    </button>
  )
}

function clampUnits(next: number): number {
  if (!Number.isFinite(next)) return 0
  return Math.min(MAX_CALCULATOR_UNITS, Math.max(0, Math.round(next)))
}

/**
 * Slider range. A "square foot" calculator and a "window" calculator need
 * wildly different ceilings and the config carries no max, so derive one:
 * the unit count where the job reaches roughly 10x the largest configured
 * amount, rounded up to a 1/2/5 step. The number input stays free-form for
 * anyone whose job is bigger than the slider goes.
 */
function sliderCeiling(calculator: SiteContentCalculator): number {
  const { perUnitRate, minimum, baseAmount } = calculator
  if (perUnitRate <= 0) return 20
  const targetTotal = Math.max(minimum, baseAmount, perUnitRate) * 10
  const units = targetTotal / perUnitRate
  return roundUpNice(Math.max(10, Math.min(1000, units)))
}

/** Rounds up to the next 1, 2, or 5 times a power of ten. */
function roundUpNice(n: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(n))
  for (const step of [1, 2, 5]) {
    const candidate = step * magnitude
    if (candidate >= n) return candidate
  }
  return 10 * magnitude
}

/** Naive but adequate: unit labels are short nouns typed by the owner. */
function pluralize(unitLabel: string): string {
  const lower = unitLabel.trim()
  if (!lower) return "units"
  if (/(s|x|z|ch|sh)$/i.test(lower)) return `${lower}es`
  if (/[^aeiou]y$/i.test(lower)) return `${lower.slice(0, -1)}ies`
  return `${lower}s`
}
