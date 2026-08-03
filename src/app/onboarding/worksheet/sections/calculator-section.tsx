"use client"

import * as React from "react"

import { TextField } from "@/components/apex"
import type { SiteContentCalculator } from "@/lib/site-content/types"
import { computeCalculatorEstimate } from "@/lib/site-content/types"

import { saveWorksheetSection } from "../actions"
import { SaveButton, SectionShell } from "./section-shell"

interface CalculatorSectionProps {
  n: number
  sessionId: string
  initial: SiteContentCalculator | undefined
  locked: boolean
  onSaved: (next: SiteContentCalculator) => void
}

/** Mirrors CalculatorSchema's ceiling in src/lib/site-content/schema.ts. */
const MAX_AMOUNT = 100_000

/** The unit count the preview quotes, so the customer sees a real number
 * rather than the bare minimum. */
const PREVIEW_UNITS = 10

/**
 * Sets up the instant-estimate tool. Entirely optional: leave it blank and
 * the site renders exactly as it does today, with no estimator and no lead
 * form. Fill it in and both appear.
 *
 * All five pricing fields move together — a rate with no unit label, or a
 * unit with no rate, cannot produce an honest number, so the section saves
 * as a group or not at all.
 */
export function CalculatorSection({
  n,
  sessionId,
  initial,
  locked,
  onSaved,
}: CalculatorSectionProps) {
  const [heading, setHeading] = React.useState(initial?.heading ?? "")
  const [baseAmount, setBaseAmount] = React.useState(
    initial ? String(initial.baseAmount) : ""
  )
  const [perUnitRate, setPerUnitRate] = React.useState(
    initial ? String(initial.perUnitRate) : ""
  )
  const [unitLabel, setUnitLabel] = React.useState(initial?.unitLabel ?? "")
  const [minimum, setMinimum] = React.useState(
    initial ? String(initial.minimum) : ""
  )
  const [leadFormHeading, setLeadFormHeading] = React.useState(
    initial?.leadFormHeading ?? ""
  )
  const [leadFormBlurb, setLeadFormBlurb] = React.useState(
    initial?.leadFormBlurb ?? ""
  )
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  const filled = Boolean(initial)
  const status = error ? "error" : pending ? "saving" : filled ? "filled" : "empty"

  const base = parseAmount(baseAmount)
  const rate = parseAmount(perUnitRate)
  const min = parseAmount(minimum)
  const valid =
    heading.trim().length >= 2 &&
    unitLabel.trim().length >= 1 &&
    base !== null &&
    rate !== null &&
    min !== null

  const preview =
    valid && base !== null && rate !== null && min !== null
      ? computeCalculatorEstimate(
          {
            heading: heading.trim(),
            baseAmount: base,
            perUnitRate: rate,
            unitLabel: unitLabel.trim(),
            minimum: min,
          },
          PREVIEW_UNITS
        )
      : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (base === null || rate === null || min === null) return
    const data: SiteContentCalculator = {
      heading: heading.trim(),
      baseAmount: base,
      perUnitRate: rate,
      unitLabel: unitLabel.trim(),
      minimum: min,
      ...(leadFormHeading.trim()
        ? { leadFormHeading: leadFormHeading.trim() }
        : {}),
      ...(leadFormBlurb.trim() ? { leadFormBlurb: leadFormBlurb.trim() } : {}),
    }
    startTransition(async () => {
      const result = await saveWorksheetSection({
        sessionId,
        section: "calculator",
        data,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      onSaved(data)
    })
  }

  return (
    <SectionShell
      n={n}
      title="Instant estimate tool"
      description="Optional. Fill this in and your site gets a price estimator plus a form visitors can send you their details through. Leave it blank and neither appears."
      status={status}
      locked={locked}
      error={error}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Heading"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          placeholder="Estimate your job"
          maxLength={80}
          hint='Shown above the estimator. Try "What will it cost?" or "Price your project."'
        />
        <TextField
          label="What is one unit?"
          value={unitLabel}
          onChange={(e) => setUnitLabel(e.target.value)}
          placeholder="room"
          maxLength={40}
          hint='Singular, lowercase — "room", "window", "square foot", "hour". We add the "s".'
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            label="Starting price ($)"
            value={baseAmount}
            onChange={(e) => setBaseAmount(e.target.value)}
            inputMode="decimal"
            placeholder="150"
            hint="Flat amount on every job."
          />
          <TextField
            label="Price per unit ($)"
            value={perUnitRate}
            onChange={(e) => setPerUnitRate(e.target.value)}
            inputMode="decimal"
            placeholder="85"
            hint="Charged per unit above."
          />
          <TextField
            label="Minimum ($)"
            value={minimum}
            onChange={(e) => setMinimum(e.target.value)}
            inputMode="decimal"
            placeholder="250"
            hint="Never quote below this."
          />
        </div>

        <PreviewLine
          amount={preview}
          unitLabel={unitLabel.trim()}
          invalid={!valid && hasAnyAmount(baseAmount, perUnitRate, minimum)}
        />

        <TextField
          label="Form heading (optional)"
          value={leadFormHeading}
          onChange={(e) => setLeadFormHeading(e.target.value)}
          placeholder="Get your estimate in writing"
          maxLength={80}
        />
        <TextField
          label="Form blurb (optional)"
          value={leadFormBlurb}
          onChange={(e) => setLeadFormBlurb(e.target.value)}
          multiline
          rows={2}
          maxLength={280}
        />

        <SaveButton disabled={pending || locked || !valid}>
          {pending ? "Saving…" : "Save estimate tool"}
        </SaveButton>
      </form>
    </SectionShell>
  )
}

function PreviewLine({
  amount,
  unitLabel,
  invalid,
}: {
  amount: number | null
  unitLabel: string
  invalid: boolean
}) {
  if (invalid) {
    return (
      <p className="text-[13px] text-apx-mute">
        Enter all three amounts as plain numbers (no $ or commas) to see a
        preview.
      </p>
    )
  }
  if (amount === null) return null
  return (
    <p
      className="rounded-lg border px-4 py-3 text-sm"
      style={{
        background: "color-mix(in oklab, var(--apex-primary) 8%, transparent)",
        borderColor: "color-mix(in oklab, var(--apex-primary) 30%, var(--apex-border))",
        color: "var(--apex-fg)",
      }}
    >
      <strong className="font-semibold">Preview:</strong> a {PREVIEW_UNITS}-
      {unitLabel || "unit"} job would show as{" "}
      <strong className="font-semibold tabular-nums">
        ${amount.toLocaleString("en-US")}
      </strong>
      .
    </p>
  )
}

/** Plain-number parse. Returns null for blanks, junk, and out-of-range so
 * the caller can gate the save without duplicating Zod's messages. */
function parseAmount(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const value = Number(trimmed)
  if (!Number.isFinite(value) || value < 0 || value > MAX_AMOUNT) return null
  return value
}

function hasAnyAmount(...values: string[]): boolean {
  return values.some((v) => v.trim().length > 0)
}
