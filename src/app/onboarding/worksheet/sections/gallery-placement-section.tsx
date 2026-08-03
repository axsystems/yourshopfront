"use client"

import * as React from "react"

import type {
  GalleryPlacement,
  SiteContentPresentation,
} from "@/lib/site-content/types"
import { DEFAULT_GALLERY_PLACEMENT } from "@/lib/site-content/types"

import { saveWorksheetSection } from "../actions"
import { SaveButton, SectionShell } from "./section-shell"

interface GalleryPlacementSectionProps {
  n: number
  sessionId: string
  /** The whole presentation group — this section only owns galleryPlacement,
   * but it writes the full group, so it must carry the rest forward. */
  initial: SiteContentPresentation | undefined
  locked: boolean
  onSaved: (next: SiteContentPresentation) => void
}

const OPTIONS: { value: GalleryPlacement; label: string; blurb: string }[] = [
  {
    value: "after-services",
    label: "After your services",
    blurb:
      "Visitors read what you do, then see proof of it. Right when the work needs explaining first — most trades, anything where the service list is the pitch.",
  },
  {
    value: "after-hero",
    label: "Straight under the hero",
    blurb:
      "Photos are the first thing on the page, above your services. Right when the finished work IS the pitch — painters, a wine bar's room, anything sold on how it looks.",
  },
]

/**
 * Picks where the gallery sits in the page order. Unset means "after your
 * services", which is the order every existing site already renders.
 */
export function GalleryPlacementSection({
  n,
  sessionId,
  initial,
  locked,
  onSaved,
}: GalleryPlacementSectionProps) {
  const [placement, setPlacement] = React.useState<GalleryPlacement>(
    initial?.galleryPlacement ?? DEFAULT_GALLERY_PLACEMENT
  )
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  const filled = Boolean(initial?.galleryPlacement)
  const status = error ? "error" : pending ? "saving" : filled ? "filled" : "empty"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const data: SiteContentPresentation = { galleryPlacement: placement }
    if (initial?.servicesHeading) data.servicesHeading = initial.servicesHeading
    if (initial?.galleryLayout) data.galleryLayout = initial.galleryLayout
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
      title="Where the gallery sits"
      description="Optional. Skip this and your photos sit below your services — the standard order."
      status={status}
      locked={locked}
      error={error}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {OPTIONS.map((opt) => {
            const active = placement === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPlacement(opt.value)}
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
                  {opt.value === DEFAULT_GALLERY_PLACEMENT ? (
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
          {pending ? "Saving…" : "Save gallery position"}
        </SaveButton>
      </form>
    </SectionShell>
  )
}
