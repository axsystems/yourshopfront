"use client"

import * as React from "react"

import { TextField } from "@/components/apex"
import type { SiteContentAbout } from "@/lib/site-content/types"

import { saveWorksheetSection } from "../actions"
import { SaveButton, SectionShell } from "./section-shell"

interface AboutSectionProps {
  n: number
  sessionId: string
  initial: SiteContentAbout | undefined
  locked: boolean
  onSaved: (next: SiteContentAbout) => void
}

export function AboutSection({
  n,
  sessionId,
  initial,
  locked,
  onSaved,
}: AboutSectionProps) {
  const [heading, setHeading] = React.useState(initial?.heading ?? "")
  const [body, setBody] = React.useState(initial?.body ?? "")
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  const filled = Boolean(initial?.heading && initial.body)
  const status = error ? "error" : pending ? "saving" : filled ? "filled" : "empty"

  const valid = heading.trim().length >= 3 && body.trim().length >= 40

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const data: SiteContentAbout = {
      heading: heading.trim(),
      body: body.trim(),
    }
    startTransition(async () => {
      const result = await saveWorksheetSection({
        sessionId,
        section: "about",
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
      title="About"
      description="One short paragraph about your business. Why customers should pick you, how long you've been around, what makes you different."
      status={status}
      required
      locked={locked}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Heading"
          required
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          placeholder="Family-owned. Three generations of Denver plumbers."
          maxLength={140}
        />
        <TextField
          label="Body"
          required
          multiline
          rows={6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="We've been fixing pipes in Denver since 1962. Three generations later, we still answer every call ourselves and stand by our work for one full year."
          maxLength={1200}
          hint="2–4 sentences. Aim for at least 40 characters."
        />
        <SaveButton disabled={pending || locked || !valid}>
          {pending ? "Saving…" : "Save about"}
        </SaveButton>
      </form>
    </SectionShell>
  )
}
