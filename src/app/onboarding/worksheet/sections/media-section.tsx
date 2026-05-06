"use client"

import * as React from "react"

import { AssetUploader } from "@/components/upload/asset-uploader"
import type { SiteContentMedia } from "@/lib/site-content/types"

import { saveWorksheetSection } from "../actions"
import { SectionShell } from "./section-shell"

interface MediaSectionProps {
  n: number
  sessionId: string
  initial: SiteContentMedia | undefined
  locked: boolean
  onSaved: (next: SiteContentMedia) => void
}

/**
 * Optional hero-image picker. Logo + gallery are owned by AssetsStep on
 * the main checklist (so onboarding step 3 has somewhere to live); this
 * section is purely for the big hero photo on the customer's home page.
 *
 * Saves auto-merge with logo/gallery — saveWorksheetSection({section:
 * "media"}) writes the full media object, so we always pass the existing
 * logoUrl + gallery alongside heroUrl to avoid clobbering them.
 */
export function MediaSection({
  n,
  sessionId,
  initial,
  locked,
  onSaved,
}: MediaSectionProps) {
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const filled = Boolean(initial?.heroUrl)
  const status = error ? "error" : pending ? "saving" : filled ? "filled" : "empty"

  const persist = async (next: SiteContentMedia) => {
    setError(null)
    setPending(true)
    try {
      const result = await saveWorksheetSection({
        sessionId,
        section: "media",
        // Drop empty fields so Zod's optional rules apply cleanly.
        data: {
          ...(next.logoUrl ? { logoUrl: next.logoUrl } : {}),
          ...(next.heroUrl ? { heroUrl: next.heroUrl } : {}),
          ...(next.gallery && next.gallery.length > 0
            ? { gallery: next.gallery }
            : {}),
        },
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      onSaved(next)
    } finally {
      setPending(false)
    }
  }

  const heroValue = initial?.heroUrl ? [initial.heroUrl] : []

  return (
    <SectionShell
      n={n}
      title="Hero photo"
      description="Optional. The big image on your home page. Skip this and we'll use a clean color-block hero based on your theme. JPG/PNG/WebP, up to 10MB."
      status={status}
      locked={locked}
    >
      <AssetUploader
        sessionId={sessionId}
        kind="hero"
        value={heroValue}
        disabled={locked}
        onChange={(urls) =>
          void persist({
            ...initial,
            heroUrl: urls[0] ?? undefined,
          })
        }
      />
    </SectionShell>
  )
}
