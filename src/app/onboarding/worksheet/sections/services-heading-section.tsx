"use client"

import * as React from "react"

import { TextField } from "@/components/apex"
import type { SiteContentPresentation } from "@/lib/site-content/types"
import { SERVICES_HEADING_DEFAULTS } from "@/lib/site-content/types"

import { saveWorksheetSection } from "../actions"
import { SaveButton, SectionShell } from "./section-shell"

interface ServicesHeadingSectionProps {
  n: number
  sessionId: string
  /** The whole presentation group — this section only owns servicesHeading,
   * but it writes the full group, so it must carry the rest forward. */
  initial: SiteContentPresentation | undefined
  locked: boolean
  onSaved: (next: SiteContentPresentation) => void
}

const MIN_LEN = 2

/**
 * Renames the services section. "Services / What we do." is right for a
 * plumber and wrong for a brewery ("On tap") or a bookstore ("This month's
 * events"). Leaving both blank keeps the defaults.
 */
export function ServicesHeadingSection({
  n,
  sessionId,
  initial,
  locked,
  onSaved,
}: ServicesHeadingSectionProps) {
  const [eyebrow, setEyebrow] = React.useState(
    initial?.servicesHeading?.eyebrow ?? ""
  )
  const [title, setTitle] = React.useState(
    initial?.servicesHeading?.title ?? ""
  )
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  const filled = Boolean(
    initial?.servicesHeading?.eyebrow || initial?.servicesHeading?.title
  )
  const status = error ? "error" : pending ? "saving" : filled ? "filled" : "empty"

  const trimmedEyebrow = eyebrow.trim()
  const trimmedTitle = title.trim()
  // Blank means "use the default". Anything typed has to clear the min.
  const valid =
    (trimmedEyebrow.length === 0 || trimmedEyebrow.length >= MIN_LEN) &&
    (trimmedTitle.length === 0 || trimmedTitle.length >= MIN_LEN)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const data: SiteContentPresentation = {}
    if (initial?.galleryLayout) data.galleryLayout = initial.galleryLayout
    if (trimmedEyebrow || trimmedTitle) {
      data.servicesHeading = {
        ...(trimmedEyebrow ? { eyebrow: trimmedEyebrow } : {}),
        ...(trimmedTitle ? { title: trimmedTitle } : {}),
      }
    }
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
      title="Rename the services section"
      description={`Optional. Leave both blank and this section stays "${SERVICES_HEADING_DEFAULTS.eyebrow} / ${SERVICES_HEADING_DEFAULTS.title}" — exactly as it looks today.`}
      status={status}
      locked={locked}
      error={error}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Small label above the heading"
          value={eyebrow}
          onChange={(e) => setEyebrow(e.target.value)}
          placeholder={SERVICES_HEADING_DEFAULTS.eyebrow}
          maxLength={40}
          hint={`Optional. Defaults to "${SERVICES_HEADING_DEFAULTS.eyebrow}".`}
        />
        <TextField
          label="Heading"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={SERVICES_HEADING_DEFAULTS.title}
          maxLength={80}
          hint={`Optional. Defaults to "${SERVICES_HEADING_DEFAULTS.title}". Try "On tap.", "This month's events.", or "Staff picks."`}
        />
        <SaveButton disabled={pending || locked || !valid}>
          {pending ? "Saving…" : "Save section name"}
        </SaveButton>
      </form>
    </SectionShell>
  )
}
