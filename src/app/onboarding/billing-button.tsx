"use client"

import * as React from "react"
import { CreditCard, Loader2 } from "lucide-react"

interface BillingButtonProps {
  sessionId: string
}

interface PortalResponse {
  ok: boolean
  url?: string
  error?: string
}

/**
 * Triggers /api/billing-portal, then redirects the browser to the hosted
 * Stripe Customer Portal. Rendered inside a labelled section on the
 * onboarding page; only mounted for sites with a recurring charge
 * (subscription or one-time + hosting add-on) — see page.tsx.
 *
 * Error region uses aria-live="polite" so screen readers announce the
 * failure without stealing focus mid-flow.
 */
export function BillingButton({ sessionId }: BillingButtonProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/billing-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
      const data = (await res.json()) as PortalResponse
      if (!res.ok || !data.ok || !data.url) {
        setError(
          friendlyError(data.error) ??
            "We couldn't open the billing portal. Try again in a moment."
        )
        setLoading(false)
        return
      }
      // Hand off the tab to Stripe's hosted UI. Don't clear loading — the
      // navigation tears down this component anyway, and clearing it would
      // briefly flash the button as re-enabled.
      window.location.assign(data.url)
    } catch {
      setError("Network error. Check your connection and try again.")
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-px disabled:pointer-events-none disabled:opacity-60"
        style={{
          border: "1.5px solid var(--apex-border)",
          background: "var(--apex-surface)",
          color: "var(--apex-fg)",
          fontFamily: "var(--apex-font-display)",
        }}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <CreditCard className="h-4 w-4" aria-hidden />
        )}
        {loading ? "Opening portal…" : "Manage billing"}
      </button>
      <p
        role="status"
        aria-live="polite"
        className="min-h-[1.25rem] text-sm"
        style={{ color: "#b91c1c" }}
      >
        {error}
      </p>
    </div>
  )
}

function friendlyError(code: string | undefined): string | null {
  switch (code) {
    case "rate_limited":
      return "Too many requests. Wait a minute and try again."
    case "session_not_found":
      return "We couldn't find your purchase. Refresh the page and try again."
    case "stripe_unavailable":
      return "Stripe is unreachable right now. Try again in a moment, or email hello@yourshopfront.com."
    default:
      return null
  }
}
