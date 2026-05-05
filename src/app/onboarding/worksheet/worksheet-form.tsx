"use client"

import * as React from "react"
import { Check } from "lucide-react"

import type { Site } from "@/lib/supabase"
import {
  siteContentIsValid,
  type SiteContent,
} from "@/lib/site-content/types"

import { AboutSection } from "./sections/about-section"
import { ContactSection } from "./sections/contact-section"
import { HeroSection } from "./sections/hero-section"
import { ServicesSection } from "./sections/services-section"
import { ServiceAreaSection } from "./sections/service-area-section"

interface WorksheetFormProps {
  site: Site
}

/**
 * Worksheet orchestrator. Holds an optimistic copy of site_content so the
 * status pills + completion banner update immediately on save (the server
 * actions also revalidate the path, but we don't want the UI to wait on
 * the round-trip).
 */
export function WorksheetForm({ site }: WorksheetFormProps) {
  const [content, setContent] = React.useState<SiteContent>(site.site_content ?? {})
  const locked = site.status !== "pending_content"
  const sessionId = site.stripe_session_id
  const complete = siteContentIsValid(content)

  return (
    <div className="space-y-5">
      <CompletionBanner complete={complete} />
      <HeroSection
        n={1}
        sessionId={sessionId}
        initial={content.hero}
        locked={locked}
        onSaved={(hero) => setContent((c) => ({ ...c, hero }))}
      />
      <ContactSection
        n={2}
        sessionId={sessionId}
        initial={content.contact}
        locked={locked}
        onSaved={(contact) => setContent((c) => ({ ...c, contact }))}
      />
      <ServicesSection
        n={3}
        sessionId={sessionId}
        initial={content.services}
        locked={locked}
        onSaved={(services) => setContent((c) => ({ ...c, services }))}
      />
      <AboutSection
        n={4}
        sessionId={sessionId}
        initial={content.about}
        locked={locked}
        onSaved={(about) => setContent((c) => ({ ...c, about }))}
      />
      <ServiceAreaSection
        n={5}
        sessionId={sessionId}
        initial={content.serviceArea}
        locked={locked}
        onSaved={(serviceArea) => setContent((c) => ({ ...c, serviceArea }))}
      />
      <CompletionBanner complete={complete} bottom />
    </div>
  )
}

function CompletionBanner({
  complete,
  bottom,
}: {
  complete: boolean
  bottom?: boolean
}) {
  if (!complete) {
    return bottom ? null : (
      <div
        className="rounded-xl border px-4 py-3 text-sm"
        style={{
          background: "var(--apex-surface)",
          borderColor: "var(--apex-border)",
          color: "var(--apex-muted-fg)",
        }}
      >
        Fill in all five required sections to mark step 2 complete on the
        checklist.
      </div>
    )
  }
  return (
    <div
      className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm"
      style={{
        background: "color-mix(in oklab, var(--apex-primary) 10%, transparent)",
        borderColor: "color-mix(in oklab, var(--apex-primary) 30%, var(--apex-border))",
        color: "var(--apex-fg)",
      }}
    >
      <span
        className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full"
        style={{
          background: "var(--apex-primary)",
          color: "var(--apex-primary-fg)",
        }}
        aria-hidden
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      <span>
        <strong className="font-semibold">All required sections saved.</strong>{" "}
        Step 2 is marked complete on the checklist. You can keep editing as
        long as your status is still pending content.
      </span>
    </div>
  )
}
