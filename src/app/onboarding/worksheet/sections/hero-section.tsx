"use client"

import * as React from "react"

import { TextField } from "@/components/apex"
import type {
  SiteContent,
  SiteContentHero,
} from "@/lib/site-content/types"

import { saveWorksheetSection } from "../actions"
import { SaveButton, SectionShell } from "./section-shell"

interface HeroSectionProps {
  n: number
  sessionId: string
  initial: SiteContentHero | undefined
  locked: boolean
  onSaved: (next: SiteContentHero) => void
}

export function HeroSection({
  n,
  sessionId,
  initial,
  locked,
  onSaved,
}: HeroSectionProps) {
  const [headline, setHeadline] = React.useState(initial?.headline ?? "")
  const [subhead, setSubhead] = React.useState(initial?.subhead ?? "")
  const [ctaLabel, setCtaLabel] = React.useState(initial?.primaryCtaLabel ?? "")
  const [ctaHref, setCtaHref] = React.useState(initial?.primaryCtaHref ?? "")
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  const filled = Boolean(initial?.headline)
  const status = error ? "error" : pending ? "saving" : filled ? "filled" : "empty"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const data: SiteContentHero = {
      headline: headline.trim(),
      subhead: emptyToUndef(subhead),
      primaryCtaLabel: emptyToUndef(ctaLabel),
      primaryCtaHref: emptyToUndef(ctaHref),
    }
    startTransition(async () => {
      const result = await saveWorksheetSection({ sessionId, section: "hero", data })
      if (!result.ok) {
        setError(result.error)
        return
      }
      onSaved(data as NonNullable<SiteContent["hero"]>)
    })
  }

  return (
    <SectionShell
      n={n}
      title="Hero"
      description="The big headline and subhead at the top of your home page. The cobalt action button can point anywhere — a phone number, a quote form, your booking page."
      status={status}
      required
      locked={locked}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Headline"
          required
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="Same-day plumbing repairs in Denver."
          maxLength={140}
          hint="Aim for 6–12 words. State the outcome the customer cares about."
        />
        <TextField
          label="Subhead"
          multiline
          rows={3}
          value={subhead}
          onChange={(e) => setSubhead(e.target.value)}
          placeholder="Licensed, insured, and answering the phone 24/7. Most jobs done in one visit."
          maxLength={280}
          hint="One or two sentences. Optional but recommended."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Primary button label"
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
            placeholder="Call (555) 123-4567"
            maxLength={40}
          />
          <TextField
            label="Primary button link"
            value={ctaHref}
            onChange={(e) => setCtaHref(e.target.value)}
            placeholder="tel:+15551234567"
            hint="Use tel:, mailto:, or https:// — anywhere you'd like clicks to go."
          />
        </div>
        <SaveButton disabled={pending || locked || headline.trim().length < 3}>
          {pending ? "Saving…" : "Save hero"}
        </SaveButton>
      </form>
    </SectionShell>
  )
}

function emptyToUndef(s: string): string | undefined {
  const v = s.trim()
  return v.length === 0 ? undefined : v
}
