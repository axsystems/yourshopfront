"use client"

import * as React from "react"
import { Plus, Star, Trash2 } from "lucide-react"

import { TextField } from "@/components/apex"
import type { SiteContentReview } from "@/lib/site-content/types"

import { saveWorksheetSection } from "../actions"
import { SaveButton, SectionShell } from "./section-shell"

interface ReviewsSectionProps {
  n: number
  sessionId: string
  initial: SiteContentReview[] | undefined
  locked: boolean
  onSaved: (next: SiteContentReview[]) => void
}

const MAX_REVIEWS = 20

export function ReviewsSection({
  n,
  sessionId,
  initial,
  locked,
  onSaved,
}: ReviewsSectionProps) {
  const [items, setItems] = React.useState<SiteContentReview[]>(initial ?? [])
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  const filled = Boolean(initial && initial.length > 0)
  const status = error ? "error" : pending ? "saving" : filled ? "filled" : "empty"

  const update = (i: number, patch: Partial<SiteContentReview>) => {
    setItems((arr) => arr.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }
  const add = () => {
    if (items.length >= MAX_REVIEWS) return
    setItems((arr) => [...arr, emptyReview()])
  }
  const remove = (i: number) => {
    setItems((arr) => arr.filter((_, idx) => idx !== i))
  }

  const cleaned: SiteContentReview[] = items
    .map((r) => {
      const trimmedBody = r.body.trim()
      const trimmedAuthor = r.author.trim()
      const trimmedSource = r.source?.trim()
      return {
        author: trimmedAuthor,
        body: trimmedBody,
        ...(r.rating ? { rating: r.rating } : {}),
        ...(trimmedSource ? { source: trimmedSource } : {}),
      } as SiteContentReview
    })
    .filter((r) => r.author.length > 0 && r.body.length > 0)

  const valid = cleaned.every(
    (r) => r.author.length >= 2 && r.body.length >= 8
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await saveWorksheetSection({
        sessionId,
        section: "reviews",
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
      title="Reviews"
      description={`Optional. Paste a few real customer reviews — Google, Yelp, or wherever. Max ${MAX_REVIEWS}. Hidden from your site if you skip this.`}
      status={status}
      locked={locked}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((r, i) => (
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
                    Review {i + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label={`Remove review ${i + 1}`}
                    className="text-apx-mute transition hover:text-apx-danger"
                    disabled={locked}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  <TextField
                    label="Author"
                    required
                    value={r.author}
                    onChange={(e) => update(i, { author: e.target.value })}
                    placeholder="Sarah W."
                    maxLength={80}
                  />
                  <TextField
                    label="Review"
                    required
                    multiline
                    rows={3}
                    value={r.body}
                    onChange={(e) => update(i, { body: e.target.value })}
                    placeholder="They came out same-day, fixed the leak in 30 minutes, didn't try to upsell us. Will use again."
                    maxLength={600}
                  />
                  <RatingPicker
                    value={r.rating}
                    onChange={(rating) => update(i, { rating })}
                  />
                  <TextField
                    label="Source"
                    value={r.source ?? ""}
                    onChange={(e) => update(i, { source: e.target.value })}
                    placeholder="Google"
                    maxLength={40}
                    hint="Optional. Where the review came from."
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-apx-mute">
            No reviews added yet. Skip this section if you don&apos;t have any
            yet.
          </p>
        )}

        <button
          type="button"
          onClick={add}
          disabled={items.length >= MAX_REVIEWS || locked}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            borderColor: "var(--apex-border)",
            background: "var(--apex-surface)",
            color: "var(--apex-fg)",
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add review ({items.length}/{MAX_REVIEWS})
        </button>

        <SaveButton disabled={pending || locked || !valid}>
          {pending
            ? "Saving…"
            : items.length === 0
              ? "Save (no reviews)"
              : "Save reviews"}
        </SaveButton>
      </form>
    </SectionShell>
  )
}

function RatingPicker({
  value,
  onChange,
}: {
  value: SiteContentReview["rating"]
  onChange: (rating: 1 | 2 | 3 | 4 | 5 | undefined) => void
}) {
  return (
    <div>
      <span className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-apx-mute">
        Rating
      </span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = value !== undefined && n <= value
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(value === n ? undefined : (n as 1 | 2 | 3 | 4 | 5))}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              aria-pressed={filled}
              className="rounded transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-apx-primary"
            >
              <Star
                className="h-5 w-5"
                strokeWidth={2}
                fill={filled ? "currentColor" : "none"}
                style={{ color: "var(--apex-primary)" }}
              />
            </button>
          )
        })}
        {value !== undefined ? (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="ml-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-apx-mute hover:text-apx-ink"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  )
}

function emptyReview(): SiteContentReview {
  return { author: "", body: "" }
}
