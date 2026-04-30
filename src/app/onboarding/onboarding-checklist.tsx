"use client"

import * as React from "react"
import { ArrowRight, Check, Circle, Lock } from "lucide-react"

import type { OnboardingState, Site } from "@/lib/supabase"
import { setAssetsSent, setContentSent, setDomain } from "./actions"

interface OnboardingChecklistProps {
  site: Site
}

export function OnboardingChecklist({ site }: OnboardingChecklistProps) {
  const state = site.onboarding_state ?? {}
  const sessionId = site.stripe_session_id
  const locked = site.status !== "pending_content"

  return (
    <div className="space-y-4">
      <Step
        n={1}
        title="Purchase confirmed"
        description={`We received your ${site.tier === "subscription" ? "subscription" : "one-time"} payment for the ${site.demo_slug} style.`}
        complete
        locked
      />
      <ContentStep sessionId={sessionId} state={state} locked={locked} />
      <AssetsStep sessionId={sessionId} state={state} locked={locked} />
      <DomainStep sessionId={sessionId} state={state} locked={locked} />
    </div>
  )
}

// -----------------------------------------------------------------------------

interface StepProps {
  n: number
  title: string
  description: React.ReactNode
  complete: boolean
  locked?: boolean
  children?: React.ReactNode
  error?: string | null
  pending?: boolean
}

function Step({ n, title, description, complete, locked, children, error, pending }: StepProps) {
  return (
    <div
      className="rounded-2xl border p-5 sm:p-6"
      style={{
        background: complete
          ? "color-mix(in oklab, var(--apex-primary) 8%, var(--apex-surface))"
          : "var(--apex-surface)",
        color: "var(--apex-surface-fg)",
        borderColor: complete
          ? "color-mix(in oklab, var(--apex-primary) 30%, var(--apex-border))"
          : "var(--apex-border)",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="mt-0.5 grid h-9 w-9 flex-shrink-0 place-items-center rounded-full"
          style={{
            background: complete
              ? "var(--apex-primary)"
              : "color-mix(in oklab, var(--apex-fg) 8%, transparent)",
            color: complete ? "var(--apex-primary-fg)" : "var(--apex-muted-fg)",
          }}
          aria-hidden
        >
          {complete ? (
            <Check className="h-4 w-4" strokeWidth={3} />
          ) : locked ? (
            <Lock className="h-3.5 w-3.5" />
          ) : (
            <span className="text-sm font-bold">{n}</span>
          )}
        </div>
        <div className="flex-1">
          <h3
            className="text-lg font-bold leading-tight"
            style={{ fontFamily: "var(--apex-font-display)" }}
          >
            {title}
          </h3>
          <div
            className="mt-1 text-sm leading-relaxed"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            {description}
          </div>
          {children && <div className="mt-4">{children}</div>}
          {error && (
            <p className="mt-3 text-sm text-red-700">{error}</p>
          )}
          {pending && (
            <p
              className="mt-3 text-xs"
              style={{ color: "var(--apex-muted-fg)" }}
            >
              Saving…
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------

function ContentStep({
  sessionId,
  state,
  locked,
}: {
  sessionId: string
  state: OnboardingState
  locked: boolean
}) {
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)
  const complete = state.content_sent?.complete ?? false

  const toggle = () => {
    setError(null)
    startTransition(async () => {
      const result = await setContentSent({ sessionId, complete: !complete })
      if (!result.ok) setError(result.error)
    })
  }

  return (
    <Step
      n={2}
      title="Send us your content"
      description={
        <>
          Use the worksheet to fill in your business info, services, and
          contact details. Takes about 30 minutes.{" "}
          <a
            href="#"
            className="underline underline-offset-2"
            style={{ color: "var(--apex-fg)" }}
          >
            Open the worksheet →
          </a>
        </>
      }
      complete={complete}
      locked={locked}
      error={error}
      pending={pending}
    >
      <button
        type="button"
        onClick={toggle}
        disabled={pending || locked}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: complete ? "transparent" : "var(--apex-primary)",
          color: complete ? "var(--apex-fg)" : "var(--apex-primary-fg)",
          border: complete ? "1.5px solid var(--apex-border)" : "none",
          borderRadius: "var(--apex-radius-md)",
          fontFamily: "var(--apex-font-display)",
        }}
      >
        {complete ? (
          <>
            <Circle className="h-3.5 w-3.5" /> Mark as not sent
          </>
        ) : (
          <>
            <Check className="h-3.5 w-3.5" strokeWidth={3} /> Mark as sent
          </>
        )}
      </button>
    </Step>
  )
}

function AssetsStep({
  sessionId,
  state,
  locked,
}: {
  sessionId: string
  state: OnboardingState
  locked: boolean
}) {
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)
  const complete = state.assets_sent?.complete ?? false

  const toggle = () => {
    setError(null)
    startTransition(async () => {
      const result = await setAssetsSent({ sessionId, complete: !complete })
      if (!result.ok) setError(result.error)
    })
  }

  return (
    <Step
      n={3}
      title="Send us your logo and photos"
      description={
        <>
          Drag-and-drop or email{" "}
          <a
            href="mailto:hello@apexsites.com"
            className="underline underline-offset-2"
            style={{ color: "var(--apex-fg)" }}
          >
            hello@apexsites.com
          </a>{" "}
          your logo + ~10 representative photos (JPG/PNG, any resolution).
        </>
      }
      complete={complete}
      locked={locked}
      error={error}
      pending={pending}
    >
      <div
        className="mb-4 grid place-items-center rounded-lg border-2 border-dashed p-6 text-sm"
        style={{
          borderColor: "var(--apex-border)",
          color: "var(--apex-muted-fg)",
        }}
      >
        <p>Drop zone (we&apos;ll wire up uploads soon — for now, email is fine)</p>
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={pending || locked}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: complete ? "transparent" : "var(--apex-primary)",
          color: complete ? "var(--apex-fg)" : "var(--apex-primary-fg)",
          border: complete ? "1.5px solid var(--apex-border)" : "none",
          borderRadius: "var(--apex-radius-md)",
          fontFamily: "var(--apex-font-display)",
        }}
      >
        {complete ? (
          <>
            <Circle className="h-3.5 w-3.5" /> Mark as not sent
          </>
        ) : (
          <>
            <Check className="h-3.5 w-3.5" strokeWidth={3} /> Mark as sent
          </>
        )}
      </button>
    </Step>
  )
}

function DomainStep({
  sessionId,
  state,
  locked,
}: {
  sessionId: string
  state: OnboardingState
  locked: boolean
}) {
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)
  const complete = state.domain?.complete ?? false
  const initialType = state.domain?.type ?? "subdomain"
  const initialCustom = state.domain?.custom_domain ?? ""

  const [type, setType] = React.useState<"custom" | "subdomain">(initialType)
  const [customDomain, setCustomDomain] = React.useState(initialCustom)

  const save = () => {
    setError(null)
    startTransition(async () => {
      const input =
        type === "custom"
          ? { sessionId, type: "custom" as const, customDomain }
          : { sessionId, type: "subdomain" as const }
      const result = await setDomain(input)
      if (!result.ok) setError(result.error)
    })
  }

  return (
    <Step
      n={4}
      title="Pick your domain"
      description="Use a domain you already own, or get an Apex subdomain (free, instant)."
      complete={complete}
      locked={locked}
      error={error}
      pending={pending}
    >
      <fieldset className="space-y-3" disabled={locked || pending}>
        <label
          className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm"
          style={{
            background: type === "subdomain" ? "color-mix(in oklab, var(--apex-primary) 8%, transparent)" : "transparent",
            borderColor: type === "subdomain" ? "var(--apex-primary)" : "var(--apex-border)",
          }}
        >
          <input
            type="radio"
            name="domain-type"
            checked={type === "subdomain"}
            onChange={() => setType("subdomain")}
            className="mt-0.5 accent-[var(--apex-primary)]"
          />
          <span>
            <strong>Use an Apex subdomain</strong> — free, ready instantly.{" "}
            <span style={{ color: "var(--apex-muted-fg)" }}>
              We&apos;ll pick something based on your business name.
            </span>
          </span>
        </label>
        <label
          className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm"
          style={{
            background: type === "custom" ? "color-mix(in oklab, var(--apex-primary) 8%, transparent)" : "transparent",
            borderColor: type === "custom" ? "var(--apex-primary)" : "var(--apex-border)",
          }}
        >
          <input
            type="radio"
            name="domain-type"
            checked={type === "custom"}
            onChange={() => setType("custom")}
            className="mt-0.5 accent-[var(--apex-primary)]"
          />
          <span className="flex-1">
            <strong>Use my own domain</strong> — we&apos;ll handle DNS setup.
            <input
              type="text"
              placeholder="example.com"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              disabled={type !== "custom"}
              className="mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-[var(--apex-fg)] disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: "var(--apex-bg)",
                color: "var(--apex-fg)",
                borderColor: "var(--apex-border)",
              }}
            />
          </span>
        </label>
      </fieldset>

      <button
        type="button"
        onClick={save}
        disabled={pending || locked || (type === "custom" && customDomain.length < 3)}
        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: "var(--apex-primary)",
          color: "var(--apex-primary-fg)",
          borderRadius: "var(--apex-radius-md)",
          fontFamily: "var(--apex-font-display)",
        }}
      >
        {complete ? "Update my choice" : "Save my choice"}{" "}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </Step>
  )
}
