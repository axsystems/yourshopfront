"use client"

import { useState } from "react"

// =============================================================================
// BillingActions — client component for deep-link Stripe portal buttons
// =============================================================================
// Rendered inside /app/billing (server component). Each button POSTs to
// /api/billing-portal-deep-link and navigates the browser to the returned
// Stripe portal URL.
//
// Error states:
//   409 (no_active_subscription) → inline message, no navigation
//   502 (stripe_unavailable)     → inline message, no navigation
//   other network errors         → inline message, no navigation
//
// Loading state is per-button so multiple concurrent clicks can't fire.
// =============================================================================

type Flow = "payment_method_update" | "subscription_cancel" | "default"

type BillingActionsProps = {
  /** Passed from the server component. True when the customer has a
   *  recurring charge (subscription tier or onetime+hosting). */
  showCancelButton: boolean
}

type ButtonState = "idle" | "loading" | "error_stripe" | "error_no_sub"

function usePortalRedirect() {
  const [state, setState] = useState<ButtonState>("idle")
  const [activeFlow, setActiveFlow] = useState<Flow | null>(null)

  async function openPortal(flow: Flow) {
    if (state === "loading") return
    setState("loading")
    setActiveFlow(flow)

    try {
      const res = await fetch("/api/billing-portal-deep-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow }),
      })

      if (res.ok) {
        const json = (await res.json()) as { ok: boolean; url: string }
        window.location.assign(json.url)
        // Keep loading state — the browser is navigating away.
        return
      }

      if (res.status === 409) {
        setState("error_no_sub")
        setActiveFlow(null)
        return
      }

      // 429, 400, 502, or any other non-OK response
      setState("error_stripe")
      setActiveFlow(null)
    } catch {
      setState("error_stripe")
      setActiveFlow(null)
    }
  }

  function reset() {
    setState("idle")
    setActiveFlow(null)
  }

  return { state, activeFlow, openPortal, reset }
}

export function BillingActions({ showCancelButton }: BillingActionsProps) {
  const { state, activeFlow, openPortal, reset } = usePortalRedirect()

  const isLoading = state === "loading"

  return (
    <div className="flex flex-col gap-3">
      {/* Update payment method */}
      <ActionButton
        label="Update payment method"
        flow="payment_method_update"
        loading={isLoading && activeFlow === "payment_method_update"}
        disabled={isLoading}
        onClick={() => { void openPortal("payment_method_update") }}
      />

      {/* View invoices */}
      <ActionButton
        label="View invoices"
        flow="default"
        loading={isLoading && activeFlow === "default"}
        disabled={isLoading}
        onClick={() => { void openPortal("default") }}
      />

      {/* Cancel subscription — only rendered when customer has recurring billing */}
      {showCancelButton && (
        <ActionButton
          label="Cancel subscription"
          flow="subscription_cancel"
          loading={isLoading && activeFlow === "subscription_cancel"}
          disabled={isLoading}
          onClick={() => { void openPortal("subscription_cancel") }}
          variant="destructive"
        />
      )}

      {/* Error banners */}
      {state === "error_no_sub" && (
        <ErrorBanner onDismiss={reset}>
          No active subscription to cancel.
        </ErrorBanner>
      )}
      {state === "error_stripe" && (
        <ErrorBanner onDismiss={reset}>
          Billing portal temporarily unavailable. Please try again in a minute.
        </ErrorBanner>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

type ActionButtonProps = {
  label: string
  flow: Flow
  loading: boolean
  disabled: boolean
  onClick: () => void
  variant?: "default" | "destructive"
}

function ActionButton({
  label,
  loading,
  disabled,
  onClick,
  variant = "default",
}: ActionButtonProps) {
  const base =
    "inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

  const variantCls =
    variant === "destructive"
      ? "border border-apx-coral bg-apx-coral-soft text-apx-coral hover:bg-apx-coral hover:text-white"
      : "border border-apx-line bg-apx-paper text-apx-ink hover:bg-apx-tint"

  return (
    <button
      type="button"
      className={`${base} ${variantCls}`}
      onClick={onClick}
      disabled={disabled}
      aria-busy={loading}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <SpinnerIcon />
          Opening portal…
        </span>
      ) : (
        label
      )}
    </button>
  )
}

function ErrorBanner({
  children,
  onDismiss,
}: {
  children: React.ReactNode
  onDismiss: () => void
}) {
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-3 rounded-xl border border-apx-coral-soft bg-apx-coral-soft px-4 py-3 text-sm text-apx-coral"
    >
      <span>{children}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 font-semibold hover:underline"
      >
        Dismiss
      </button>
    </div>
  )
}

function SpinnerIcon() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
