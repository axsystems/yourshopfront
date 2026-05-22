"use client"

import * as React from "react"
import { ArrowRight, Check, PenLine } from "lucide-react"

import type { Site } from "@/lib/supabase"
import {
  siteContentIsValid,
  type SiteContent,
} from "@/lib/site-content/types"

import { AboutSection } from "./sections/about-section"
import { ContactSection } from "./sections/contact-section"
import { HeroSection } from "./sections/hero-section"
import { MediaSection } from "./sections/media-section"
import { ReviewsSection } from "./sections/reviews-section"
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
  // Empty-string fallback for type-safety on the upgrade-button POST.
  // CopyServiceBanner internally disables the upgrade button when sessionId
  // is empty so a malformed POST never reaches /api/checkout/copy-upgrade.
  const sessionId = site.stripe_session_id || ""
  const complete = siteContentIsValid(content)

  return (
    <div className="space-y-5">
      <CopyServiceBanner copyAddon={site.copy_addon} sessionId={sessionId} />
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
      <ReviewsSection
        n={6}
        sessionId={sessionId}
        initial={content.reviews}
        locked={locked}
        onSaved={(reviews) => setContent((c) => ({ ...c, reviews }))}
      />
      <MediaSection
        n={7}
        sessionId={sessionId}
        initial={content.media}
        locked={locked}
        onSaved={(media) => setContent((c) => ({ ...c, media }))}
      />
      <CompletionBanner complete={complete} bottom />
    </div>
  )
}

function CopyServiceBanner({
  copyAddon,
  sessionId,
}: {
  copyAddon: boolean
  sessionId: string
}) {
  const [pending, setPending] = React.useState(false)
  const [upgradeError, setUpgradeError] = React.useState<string | null>(null)

  if (copyAddon) {
    return (
      <div
        className="flex items-start gap-3 rounded-xl border-2 px-5 py-4 text-sm leading-relaxed"
        style={{
          background: "color-mix(in oklab, #3b6eff 6%, transparent)",
          borderColor: "color-mix(in oklab, #3b6eff 30%, var(--apex-border))",
          color: "var(--apex-fg)",
        }}
      >
        <PenLine
          className="mt-0.5 h-5 w-5 flex-shrink-0"
          style={{ color: "#3b6eff" }}
          aria-hidden
        />
        <span>
          <strong className="font-semibold">Copy service active.</strong>{" "}
          You only need to fill in: logo, hero image, gallery photos, plus the
          5 discovery facts below. We&apos;ll draft the rest.
        </span>
      </div>
    )
  }

  async function handleUpgrade() {
    setPending(true)
    setUpgradeError(null)
    try {
      const res = await fetch("/api/checkout/copy-upgrade", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null
        setUpgradeError(
          body?.error ??
            `Request failed (HTTP ${res.status}). Please try again.`
        )
        setPending(false)
        return
      }
      const { url } = (await res.json()) as { url?: string }
      if (!url) {
        setUpgradeError("No redirect URL returned. Please try again.")
        setPending(false)
        return
      }
      window.location.assign(url)
    } catch (err) {
      setUpgradeError(
        err instanceof Error
          ? `Network error: ${err.message}`
          : "Network error. Please try again."
      )
      setPending(false)
    }
  }

  return (
    <div
      className="rounded-xl border-2 px-5 py-4 text-sm"
      style={{
        background: "color-mix(in oklab, #3b6eff 6%, transparent)",
        borderColor: "color-mix(in oklab, #3b6eff 30%, var(--apex-border))",
        color: "var(--apex-fg)",
      }}
    >
      <p className="font-semibold">Stuck on copy? Have us write it for $199.</p>
      <p className="mt-1" style={{ color: "var(--apex-muted-fg)" }}>
        Industry-tested copy that converts — we know what wording books jobs in
        your industry. Skip the worksheet, answer 5 facts instead.
      </p>
      {upgradeError && (
        <p className="mt-2 text-xs text-red-700">{upgradeError}</p>
      )}
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={pending || !sessionId}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: "#3b6eff",
          color: "#ffffff",
          fontFamily: "var(--apex-font-display)",
        }}
      >
        {pending ? (
          <>
            <Spinner /> Redirecting to Stripe…
          </>
        ) : (
          <>
            Upgrade — add copy service <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>
    </div>
  )
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
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
