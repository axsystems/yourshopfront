"use client"

import * as React from "react"

import type {
  GalleryLayout,
  SiteContentPresentation,
} from "@/lib/site-content/types"
import { DEFAULT_GALLERY_LAYOUT } from "@/lib/site-content/types"

import { saveWorksheetSection } from "../actions"
import { SaveButton, SectionShell } from "./section-shell"

interface GalleryLayoutSectionProps {
  n: number
  sessionId: string
  /** The whole presentation group — this section only owns galleryLayout,
   * but it writes the full group, so it must carry the rest forward. */
  initial: SiteContentPresentation | undefined
  locked: boolean
  onSaved: (next: SiteContentPresentation) => void
}

const OPTIONS: { value: GalleryLayout; label: string; blurb: string }[] = [
  {
    value: "grid",
    label: "Grid",
    blurb:
      "Up to 12 square thumbnails, four across. Best when the photos are proof of work — job sites, before-and-afters, the shop.",
  },
  {
    value: "showcase",
    label: "Showcase",
    blurb:
      "Up to 6 large images, one per row, never cropped. Best when each photo is the product — design work, portraits, plated dishes.",
  },
]

/**
 * Picks how the gallery renders. Unset means "grid", which is what every
 * existing site shows.
 */
export function GalleryLayoutSection({
  n,
  sessionId,
  initial,
  locked,
  onSaved,
}: GalleryLayoutSectionProps) {
  const [layout, setLayout] = React.useState<GalleryLayout>(
    initial?.galleryLayout ?? DEFAULT_GALLERY_LAYOUT
  )
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  const filled = Boolean(initial?.galleryLayout)
  const status = error ? "error" : pending ? "saving" : filled ? "filled" : "empty"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const data: SiteContentPresentation = { galleryLayout: layout }
    if (initial?.servicesHeading) data.servicesHeading = initial.servicesHeading
    startTransition(async () => {
      const result = await saveWorksheetSection({
        sessionId,
        section: "presentation",
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
      title="Gallery layout"
      description="Optional. Skip this and your photos show as a grid of thumbnails — the standard layout."
      status={status}
      locked={locked}
      error={error}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {OPTIONS.map((opt) => {
            const active = layout === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLayout(opt.value)}
                aria-pressed={active}
                disabled={locked}
                className="rounded-lg border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: active
                    ? "color-mix(in oklab, var(--apex-primary) 10%, var(--apex-bg))"
                    : "var(--apex-bg)",
                  borderColor: active
                    ? "var(--apex-primary)"
                    : "var(--apex-border)",
                  color: "var(--apex-fg)",
                }}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="grid h-4 w-4 flex-shrink-0 place-items-center rounded-full border"
                    style={{
                      borderColor: active
                        ? "var(--apex-primary)"
                        : "var(--apex-border)",
                    }}
                    aria-hidden
                  >
                    {active ? (
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: "var(--apex-primary)" }}
                      />
                    ) : null}
                  </span>
                  <span className="text-sm font-bold">{opt.label}</span>
                  {opt.value === DEFAULT_GALLERY_LAYOUT ? (
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-apx-mute">
                      Default
                    </span>
                  ) : null}
                </span>
                <span
                  className="mt-2 block text-[13px] leading-relaxed"
                  style={{ color: "var(--apex-muted-fg)" }}
                >
                  {opt.blurb}
                </span>
              </button>
            )
          })}
        </div>
        <SaveButton disabled={pending || locked}>
          {pending ? "Saving…" : "Save gallery layout"}
        </SaveButton>
      </form>
    </SectionShell>
  )
}
