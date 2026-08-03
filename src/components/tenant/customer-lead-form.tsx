"use client"

import * as React from "react"
import { Check, Loader2 } from "lucide-react"

import { formatEstimate, LEAD_FORM_DEFAULTS } from "@/lib/site-content/types"

interface CustomerLeadFormProps {
  /** Public subdomain slug. The API resolves the real site row from it. */
  siteSlug: string
  heading?: string
  blurb?: string
  /**
   * Unit count from the estimator, when one is on the page. Sent as a
   * number only — the dollar figure is recomputed server-side, so nothing
   * here can influence what gets stored.
   */
  calculatorUnits?: number | null
  /** Free-text origin marker stored with the lead, e.g. "estimate-form". */
  sourcePage: string
}

type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string }
  /** `estimate` is the figure the SERVER computed and recorded, not the one
   * this component rendered. Echoing the server's number back means the
   * confirmation can never quote something the owner didn't receive. */
  | { kind: "success"; estimate: number | null }

interface LeadResponse {
  ok?: boolean
  error?: string
  estimate?: number | null
  issues?: { path: string; message: string }[]
}

/** Stable no-op subscribe for the hydration probe below: the "store" never
 * emits, the only thing needed is the server-vs-client snapshot split. */
const neverChanges = () => () => {}

/**
 * Lead capture on a delivered tenant site. Posts to /api/leads, which is
 * the only place the submission is trusted: this component sends a slug
 * and a unit count, never a site id and never a price.
 */
export function CustomerLeadForm({
  siteSlug,
  heading,
  blurb,
  calculatorUnits,
  sourcePage,
}: CustomerLeadFormProps) {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [state, setState] = React.useState<FormState>({ kind: "idle" })
  /**
   * False until hydration finishes. `onSubmit` is React-only, so before the
   * client bundle attaches, a press on a non-`disabled` submit button is a
   * NATIVE form submission — a GET navigation that throws away everything
   * the visitor typed. Keeping the button truly `disabled` for that window
   * is the only thing that can stop it, and it costs nothing: nobody, AT
   * users included, can be told what's missing before the JS that composes
   * that message has loaded.
   */
  const hydrated = React.useSyncExternalStore(
    neverChanges,
    () => true,
    () => false
  )

  const submitting = state.kind === "submitting"
  const hasContactMethod = Boolean(email.trim() || phone.trim())
  const canSubmit = Boolean(name.trim()) && hasContactMethod && !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    // The button stays focusable (aria-disabled, not disabled), so an invalid
    // submit is reachable by keyboard and by Enter in a text field. The form
    // is noValidate, so nothing else would tell the visitor what is missing —
    // this is the only place that answers "why isn't it sending?".
    if (!name.trim()) {
      setState({ kind: "error", message: "Add your name so we know who we're replying to." })
      return
    }
    if (!hasContactMethod) {
      setState({
        kind: "error",
        message: "Add an email address or a phone number so we can reply.",
      })
      return
    }
    setState({ kind: "submitting" })
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          siteSlug,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
          sourcePage,
          ...(typeof calculatorUnits === "number"
            ? { calculator: { units: calculatorUnits } }
            : {}),
        }),
      })
      const body = (await res.json().catch(() => null)) as LeadResponse | null
      if (!res.ok || !body?.ok) {
        setState({
          kind: "error",
          message:
            body?.issues?.[0]?.message ??
            body?.error ??
            `Something went wrong (HTTP ${res.status}). Please try again.`,
        })
        return
      }
      setState({
        kind: "success",
        estimate: typeof body.estimate === "number" ? body.estimate : null,
      })
    } catch {
      setState({
        kind: "error",
        message:
          "We couldn't reach the server. Check your connection and try again.",
      })
    }
  }

  if (state.kind === "success") {
    return <SuccessPanel name={name.trim()} estimate={state.estimate} />
  }

  return (
    <div
      className="p-7"
      style={{
        background: "var(--apex-surface)",
        color: "var(--apex-surface-fg)",
        border: "1px solid var(--apex-border)",
        borderRadius: "var(--apex-radius-lg)",
      }}
    >
      <h3
        className="text-2xl font-bold leading-tight"
        style={{
          fontFamily: "var(--apex-font-display)",
          letterSpacing: "-0.015em",
        }}
      >
        {heading?.trim() || LEAD_FORM_DEFAULTS.heading}
      </h3>
      <p
        className="mt-2 text-sm leading-relaxed"
        style={{ color: "var(--apex-muted-fg)" }}
      >
        {blurb?.trim() || LEAD_FORM_DEFAULTS.blurb}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <TenantField
          label="Your name"
          required
          value={name}
          onChange={setName}
          autoComplete="name"
          maxLength={120}
          disabled={submitting}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TenantField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            maxLength={254}
            disabled={submitting}
          />
          <TenantField
            label="Phone"
            type="tel"
            value={phone}
            onChange={setPhone}
            autoComplete="tel"
            maxLength={40}
            disabled={submitting}
          />
        </div>
        <p className="text-[12px]" style={{ color: "var(--apex-muted-fg)" }}>
          Email or phone — whichever you&apos;d rather we use.
        </p>
        <TenantField
          label="What do you need?"
          multiline
          value={message}
          onChange={setMessage}
          maxLength={2000}
          disabled={submitting}
        />

        {state.kind === "error" ? (
          /* Opaque red with white text, NOT a tinted wash over the surface.
             The tint composited against var(--apex-surface), which is near
             black on several shipped themes, so dark-red-on-dark landed at
             ~1.6:1. There is no theme token for an error state, and one
             borrowed from the palette can't be trusted to contrast either —
             a fixed pair that is legible on any surface is the honest fix. */
          <p
            role="alert"
            className="px-4 py-3 text-sm font-semibold"
            style={{
              background: "#B91C1C",
              color: "#FFFFFF",
              borderRadius: "var(--apex-radius-md)",
            }}
          >
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          /* aria-disabled, not disabled: a disabled button leaves the tab
             order, so a keyboard or screen-reader visitor could neither
             reach it nor learn why it wasn't working. handleSubmit does the
             actual blocking and names the missing field. `disabled` is used
             only pre-hydration, where React cannot intercept the submit. */
          disabled={!hydrated}
          aria-disabled={!canSubmit}
          className={`inline-flex w-full items-center justify-center gap-2 px-7 py-4 text-base font-bold transition sm:w-auto ${
            canSubmit ? "hover:-translate-y-0.5" : "cursor-not-allowed opacity-55"
          }`}
          style={{
            background: "var(--apex-primary)",
            color: "var(--apex-primary-fg)",
            borderRadius: "var(--apex-radius-md)",
            fontFamily: "var(--apex-font-display)",
            border: "none",
          }}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Sending…
            </>
          ) : (
            "Send my request"
          )}
        </button>
      </form>
    </div>
  )
}

function SuccessPanel({
  name,
  estimate,
}: {
  name: string
  estimate: number | null
}) {
  return (
    <div
      className="p-7"
      role="status"
      style={{
        background: "var(--apex-surface)",
        color: "var(--apex-surface-fg)",
        border: "1px solid color-mix(in oklab, var(--apex-primary) 45%, var(--apex-border))",
        borderRadius: "var(--apex-radius-lg)",
      }}
    >
      <span
        className="grid h-11 w-11 place-items-center"
        style={{
          background: "var(--apex-primary)",
          color: "var(--apex-primary-fg)",
          borderRadius: "var(--apex-radius-pill)",
        }}
        aria-hidden
      >
        <Check className="h-5 w-5" strokeWidth={3} />
      </span>
      <h3
        className="mt-5 text-2xl font-bold leading-tight"
        style={{
          fontFamily: "var(--apex-font-display)",
          letterSpacing: "-0.015em",
        }}
      >
        {name ? `Thanks, ${name}.` : "Thanks — we got it."}
      </h3>
      <p
        className="mt-2 text-sm leading-relaxed"
        style={{ color: "var(--apex-muted-fg)" }}
      >
        {typeof estimate === "number"
          ? `Your request is in, along with the ${formatEstimate(estimate)} ballpark you worked out. We'll be in touch shortly with a firm price.`
          : "Your request is in. We'll be in touch shortly."}
      </p>
      <p
        className="mt-6 border-t pt-5 text-[13px] leading-relaxed"
        style={{
          borderColor: "var(--apex-border)",
          color: "var(--apex-muted-fg)",
        }}
      >
        Need it sooner? Calling is always faster than a form.
      </p>
    </div>
  )
}

interface TenantFieldProps {
  label: string
  value: string
  onChange: (next: string) => void
  type?: "text" | "email" | "tel"
  multiline?: boolean
  required?: boolean
  autoComplete?: string
  maxLength?: number
  disabled?: boolean
}

/**
 * Themed input. Deliberately not the marketing `TextField` from
 * @/components/apex — that one is hard-wired to the apex-* Tailwind palette,
 * which is the Your Shopfront brand, not the customer's theme tokens.
 */
function TenantField({
  label,
  value,
  onChange,
  type = "text",
  multiline,
  required,
  autoComplete,
  maxLength,
  disabled,
}: TenantFieldProps) {
  const id = React.useId()
  const style: React.CSSProperties = {
    background: "var(--apex-bg)",
    color: "var(--apex-fg)",
    border: "1px solid var(--apex-border)",
    borderRadius: "var(--apex-radius-md)",
  }
  const cls =
    "w-full px-4 py-3 text-[16px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[color:var(--apex-primary)] disabled:cursor-not-allowed disabled:opacity-60"
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em]"
        style={{
          color: "var(--apex-muted-fg)",
          fontFamily: "var(--apex-font-mono)",
        }}
      >
        {label}
        {required ? <span aria-hidden> *</span> : null}
      </label>
      {multiline ? (
        <textarea
          id={id}
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          disabled={disabled}
          className={cls}
          style={style}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          maxLength={maxLength}
          required={required}
          disabled={disabled}
          className={cls}
          style={style}
        />
      )}
    </div>
  )
}
