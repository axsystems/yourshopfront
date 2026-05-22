"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"

import { TextField } from "@/components/apex"
import type { SiteContentService } from "@/lib/site-content/types"

import { saveWorksheetSection } from "../actions"
import { SaveButton, SectionShell } from "./section-shell"

interface ServicesSectionProps {
  n: number
  sessionId: string
  initial: SiteContentService[] | undefined
  locked: boolean
  onSaved: (next: SiteContentService[]) => void
}

const MIN_SERVICES = 3
const MAX_SERVICES = 12

export function ServicesSection({
  n,
  sessionId,
  initial,
  locked,
  onSaved,
}: ServicesSectionProps) {
  const [items, setItems] = React.useState<SiteContentService[]>(
    initial && initial.length > 0
      ? initial
      : [emptyService(), emptyService(), emptyService()]
  )
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  const filled =
    initial !== undefined &&
    initial.length >= MIN_SERVICES &&
    initial.every((s) => s.title.trim() && s.blurb.trim())
  const status = error ? "error" : pending ? "saving" : filled ? "filled" : "empty"

  const update = (i: number, patch: Partial<SiteContentService>) => {
    setItems((arr) => arr.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  }
  const add = () => {
    if (items.length >= MAX_SERVICES) return
    setItems((arr) => [...arr, emptyService()])
  }
  const remove = (i: number) => {
    setItems((arr) => arr.filter((_, idx) => idx !== i))
  }

  const cleaned: SiteContentService[] = items.map((s) => ({
    title: s.title.trim(),
    blurb: s.blurb.trim(),
    priceFrom: s.priceFrom?.trim() ? s.priceFrom.trim() : undefined,
  }))
  const valid =
    cleaned.length >= MIN_SERVICES &&
    cleaned.every((s) => s.title.length >= 2 && s.blurb.length >= 8)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await saveWorksheetSection({
        sessionId,
        section: "services",
        data: cleaned,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      onSaved(cleaned)
    })
  }

  return (
    <SectionShell
      n={n}
      title="Services"
      description={`What you offer. Add at least ${MIN_SERVICES}; up to ${MAX_SERVICES}. Each one gets a title, a one-sentence blurb, and an optional starting price.`}
      status={status}
      required
      locked={locked}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          {items.map((s, i) => (
            <div
              key={i}
              className="rounded-lg border p-4"
              style={{
                borderColor: "var(--apex-border)",
                background: "var(--apex-bg)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-apx-mute">
                  Service {i + 1}
                </p>
                {items.length > MIN_SERVICES ? (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label={`Remove service ${i + 1}`}
                    className="text-apx-mute transition hover:text-apx-danger"
                    disabled={locked}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <div className="mt-3 space-y-3">
                <TextField
                  label="Title"
                  required
                  value={s.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                  placeholder="Drain cleaning"
                  maxLength={80}
                />
                <TextField
                  label="Blurb"
                  required
                  multiline
                  rows={2}
                  value={s.blurb}
                  onChange={(e) => update(i, { blurb: e.target.value })}
                  placeholder="Hydro-jet and snake services for clogged kitchen, bathroom, and main lines."
                  maxLength={280}
                />
                <TextField
                  label="Starting price"
                  value={s.priceFrom ?? ""}
                  onChange={(e) => update(i, { priceFrom: e.target.value })}
                  placeholder="From $189"
                  maxLength={40}
                  hint="Optional. Free-text — write it however your customers think about it."
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={add}
          disabled={items.length >= MAX_SERVICES || locked}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            borderColor: "var(--apex-border)",
            background: "var(--apex-surface)",
            color: "var(--apex-fg)",
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add service ({items.length}/{MAX_SERVICES})
        </button>

        <SaveButton disabled={pending || locked || !valid}>
          {pending ? "Saving…" : "Save services"}
        </SaveButton>
      </form>
    </SectionShell>
  )
}

function emptyService(): SiteContentService {
  return { title: "", blurb: "" }
}
