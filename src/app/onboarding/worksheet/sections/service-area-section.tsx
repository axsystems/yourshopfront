"use client"

import * as React from "react"
import { Plus, X } from "lucide-react"

import { TextField } from "@/components/apex"
import type { SiteContentServiceArea } from "@/lib/site-content/types"

import { saveWorksheetSection } from "../actions"
import { SaveButton, SectionShell } from "./section-shell"

interface ServiceAreaSectionProps {
  n: number
  sessionId: string
  initial: SiteContentServiceArea | undefined
  locked: boolean
  onSaved: (next: SiteContentServiceArea) => void
}

const MAX_CITIES = 40

export function ServiceAreaSection({
  n,
  sessionId,
  initial,
  locked,
  onSaved,
}: ServiceAreaSectionProps) {
  const [cities, setCities] = React.useState<string[]>(initial?.cities ?? [])
  const [draft, setDraft] = React.useState("")
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  const filled = Boolean(initial?.cities && initial.cities.length >= 1)
  const status = error ? "error" : pending ? "saving" : filled ? "filled" : "empty"

  const addDraft = () => {
    const trimmed = draft.trim()
    if (trimmed.length < 2) return
    if (cities.includes(trimmed)) {
      setDraft("")
      return
    }
    if (cities.length >= MAX_CITIES) return
    setCities((c) => [...c, trimmed])
    setDraft("")
  }

  const remove = (i: number) => setCities((c) => c.filter((_, idx) => idx !== i))

  const valid = cities.length >= 1

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const data: SiteContentServiceArea = { cities }
    startTransition(async () => {
      const result = await saveWorksheetSection({
        sessionId,
        section: "serviceArea",
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
      title="Service area"
      description="The cities or neighborhoods you serve. Press Enter or click Add after each one."
      status={status}
      required
      locked={locked}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <TextField
              label="Add a city"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addDraft()
                }
              }}
              placeholder="Denver, CO"
              maxLength={80}
            />
          </div>
          <div className="self-end">
            <button
              type="button"
              onClick={addDraft}
              disabled={
                locked || draft.trim().length < 2 || cities.length >= MAX_CITIES
              }
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                borderColor: "var(--apex-border)",
                background: "var(--apex-surface)",
                color: "var(--apex-fg)",
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        </div>

        {cities.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {cities.map((city, i) => (
              <li
                key={`${city}-${i}`}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm"
                style={{
                  background: "color-mix(in oklab, var(--apex-primary) 12%, transparent)",
                  color: "var(--apex-fg)",
                  border:
                    "1px solid color-mix(in oklab, var(--apex-primary) 30%, var(--apex-border))",
                }}
              >
                {city}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Remove ${city}`}
                  className="text-apx-mute transition hover:text-apx-danger"
                  disabled={locked}
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-apx-mute">No cities added yet.</p>
        )}

        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-apx-mute">
          {cities.length}/{MAX_CITIES}
        </p>

        <SaveButton disabled={pending || locked || !valid}>
          {pending ? "Saving…" : "Save service area"}
        </SaveButton>
      </form>
    </SectionShell>
  )
}
