"use client"

import * as React from "react"
import { Check, Loader2, AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Site } from "@/lib/supabase"

interface ProvisioningStatusProps {
  initialSite: Site
}

interface PollResponse {
  status: Site["status"]
  live_url: string | null
  failure_reason: string | null
}

const POLL_INTERVAL_MS = 5_000

/**
 * Renders the live status of a site once the customer has finished
 * onboarding. Polls /api/onboarding/status?site_id=... every 5s until
 * the site reaches a terminal state ('live', 'cancelled', 'refunded',
 * 'failed'). Each visible state has its own card.
 */
export function ProvisioningStatus({ initialSite }: ProvisioningStatusProps) {
  const [status, setStatus] = React.useState<Site["status"]>(initialSite.status)
  const [liveUrl, setLiveUrl] = React.useState<string | null>(
    initialSite.live_url
  )
  const [failureReason, setFailureReason] = React.useState<string | null>(
    initialSite.failure_reason
  )

  React.useEffect(() => {
    if (isTerminal(status)) return
    let cancelled = false

    async function poll() {
      try {
        const res = await fetch(
          `/api/onboarding/status?site_id=${initialSite.id}`,
          { cache: "no-store" }
        )
        if (!res.ok) return
        const data = (await res.json()) as PollResponse
        if (cancelled) return
        setStatus(data.status)
        setLiveUrl(data.live_url)
        setFailureReason(data.failure_reason)
      } catch {
        // Network blip — try again on next tick.
      }
    }

    const interval = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [initialSite.id, status])

  if (status === "ready_to_build" || status === "provisioning") {
    return <Provisioning />
  }
  if (status === "awaiting_approval") {
    return <AwaitingApproval liveUrl={liveUrl} />
  }
  if (status === "live") {
    return <Live liveUrl={liveUrl} />
  }
  if (status === "failed") {
    return <Failed reason={failureReason} />
  }
  if (status === "cancelled" || status === "refunded") {
    return <Closed status={status} />
  }
  return null
}

function isTerminal(status: Site["status"]): boolean {
  return (
    status === "live" ||
    status === "cancelled" ||
    status === "refunded" ||
    status === "failed"
  )
}

function StateShell({
  icon,
  iconBg,
  title,
  body,
  children,
}: {
  icon: React.ReactNode
  iconBg: "primary" | "neutral" | "danger"
  title: React.ReactNode
  body: React.ReactNode
  children?: React.ReactNode
}) {
  const bgVar =
    iconBg === "primary"
      ? "var(--apex-primary)"
      : iconBg === "danger"
        ? "#DC2626"
        : "var(--apex-muted)"
  const fgVar =
    iconBg === "primary"
      ? "var(--apex-primary-fg)"
      : iconBg === "danger"
        ? "#FFFFFF"
        : "var(--apex-muted-fg)"
  return (
    <div className="text-center">
      <div
        className={cn("mx-auto grid h-16 w-16 place-items-center rounded-full")}
        style={{ background: bgVar, color: fgVar }}
      >
        {icon}
      </div>
      <h1
        className="mt-6 text-3xl font-bold leading-tight tracking-tight md:text-5xl"
        style={{
          color: "var(--apex-fg)",
          fontFamily: "var(--apex-font-display)",
        }}
      >
        {title}
      </h1>
      <p
        className="mx-auto mt-4 max-w-xl text-lg leading-relaxed"
        style={{ color: "var(--apex-muted-fg)" }}
      >
        {body}
      </p>
      {children}
    </div>
  )
}

function Provisioning() {
  return (
    <StateShell
      iconBg="neutral"
      icon={<Loader2 className="h-8 w-8 animate-spin" />}
      title="We're setting up your site."
      body="Reserving your subdomain and pointing DNS at our build cluster — usually under a minute. We'll keep this page updated."
    />
  )
}

function AwaitingApproval({ liveUrl }: { liveUrl: string | null }) {
  return (
    <StateShell
      iconBg="primary"
      icon={<Check className="h-8 w-8" strokeWidth={3} />}
      title="Your staging URL is ready."
      body="A real human is finishing the build and will email you when it's ready to review. Most sites are reviewed-and-flipped within 24 hours of arriving here."
    >
      {liveUrl && (
        <div
          className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-mono"
          style={{
            background: "var(--apex-surface)",
            borderColor: "var(--apex-border)",
          }}
        >
          <span style={{ color: "var(--apex-muted-fg)" }}>Staging:</span>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener"
            className="font-semibold underline-offset-2 hover:underline"
            style={{ color: "var(--apex-fg)" }}
          >
            {liveUrl.replace(/^https?:\/\//, "")}
          </a>
        </div>
      )}
    </StateShell>
  )
}

function Live({ liveUrl }: { liveUrl: string | null }) {
  return (
    <StateShell
      iconBg="primary"
      icon={<Check className="h-8 w-8" strokeWidth={3} />}
      title="Your site is live."
      body="It's officially out there. Share the URL with your customers, and reply to any of our emails to push edits."
    >
      {liveUrl && (
        <div className="mt-8">
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-transform hover:-translate-y-0.5"
            style={{
              background: "var(--apex-primary)",
              color: "var(--apex-primary-fg)",
            }}
          >
            Visit {liveUrl.replace(/^https?:\/\//, "")} →
          </a>
        </div>
      )}
    </StateShell>
  )
}

function Failed({ reason }: { reason: string | null }) {
  return (
    <StateShell
      iconBg="danger"
      icon={<AlertCircle className="h-8 w-8" />}
      title="We hit a snag."
      body="Something went wrong while setting up your subdomain. We've been alerted and are looking at it now — no action needed on your end."
    >
      {reason && (
        <p
          className="mx-auto mt-6 max-w-md font-mono text-xs"
          style={{ color: "var(--apex-muted-fg)" }}
        >
          {reason}
        </p>
      )}
    </StateShell>
  )
}

function Closed({ status }: { status: "cancelled" | "refunded" }) {
  return (
    <StateShell
      iconBg="neutral"
      icon={<AlertCircle className="h-8 w-8" />}
      title={
        status === "refunded"
          ? "This order was refunded."
          : "This order was cancelled."
      }
      body="If this is a mistake, reply to your purchase confirmation and we'll sort it out within the day."
    />
  )
}
