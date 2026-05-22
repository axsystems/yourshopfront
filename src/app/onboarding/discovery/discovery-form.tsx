"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"

import { TextField } from "@/components/apex"
import type {
  Discovery,
  PreferredTone,
} from "@/lib/site-content/schema"

import { submitDiscovery } from "./actions"

interface DiscoveryFormProps {
  sessionId: string
  /** Pre-filled values if the customer is returning to an existing draft. */
  initial: Discovery | null
}

const MIN_SERVICES = 3
const MAX_SERVICES = 8

const TONE_OPTIONS: { value: PreferredTone; label: string; hint: string }[] = [
  {
    value: "professional",
    label: "Professional",
    hint: "Polished, credible, button-up.",
  },
  {
    value: "friendly",
    label: "Friendly",
    hint: "Warm, neighborly, easy.",
  },
  {
    value: "premium",
    label: "Premium",
    hint: "Restrained, confident, less-is-more.",
  },
  {
    value: "direct",
    label: "Direct",
    hint: "No filler, action-first, tradesperson voice.",
  },
]

export function DiscoveryForm({ sessionId, initial }: DiscoveryFormProps) {
  const router = useRouter()
  const [yearsInBusiness, setYearsInBusiness] = React.useState(
    initial?.yearsInBusiness ?? ""
  )
  const [whatMakesYouDifferent, setWhatMakesYouDifferent] = React.useState(
    initial?.whatMakesYouDifferent ?? ""
  )
  const [services, setServices] = React.useState<string[]>(
    initial && initial.topServices.length >= MIN_SERVICES
      ? initial.topServices
      : ["", "", ""]
  )
  const [targetCustomer, setTargetCustomer] = React.useState(
    initial?.targetCustomer ?? ""
  )
  const [preferredTone, setPreferredTone] = React.useState<PreferredTone>(
    initial?.preferredTone ?? "professional"
  )
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const cleanedServices = services.map((s) => s.trim()).filter(Boolean)
  const valid =
    yearsInBusiness.trim().length >= 1 &&
    whatMakesYouDifferent.trim().length >= 20 &&
    cleanedServices.length >= MIN_SERVICES &&
    cleanedServices.every((s) => s.length >= 2 && s.length <= 80) &&
    targetCustomer.trim().length >= 10

  const updateService = (i: number, value: string) => {
    setServices((arr) => arr.map((s, idx) => (idx === i ? value : s)))
  }
  const addService = () => {
    if (services.length >= MAX_SERVICES) return
    setServices((arr) => [...arr, ""])
  }
  const removeService = (i: number) => {
    if (services.length <= MIN_SERVICES) return
    setServices((arr) => arr.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid || pending) return
    setError(null)
    setPending(true)

    const payload: Discovery = {
      yearsInBusiness: yearsInBusiness.trim(),
      whatMakesYouDifferent: whatMakesYouDifferent.trim(),
      topServices: cleanedServices,
      targetCustomer: targetCustomer.trim(),
      preferredTone,
    }

    try {
      const result = await submitDiscovery({
        sessionId,
        discovery: payload,
      })
      if (!result.ok) {
        setError(result.error)
        setPending(false)
        return
      }
      // On success, route back to the onboarding hub — the page will pick
      // up the new status and render the "we're reviewing your draft" state.
      router.push(`/onboarding?session_id=${encodeURIComponent(sessionId)}`)
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error
          ? `Network error: ${err.message}`
          : "Network error. Please try again."
      )
      setPending(false)
    }
  }

  if (pending) {
    return <DraftingState />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Years in business" required>
        <TextField
          label="How long have you been doing this?"
          required
          value={yearsInBusiness}
          onChange={(e) => setYearsInBusiness(e.target.value)}
          placeholder="3 years"
          maxLength={120}
          hint="Plain English. e.g. '3 years', 'Just starting', 'Family business since 1987'."
        />
      </Field>

      <Field label="What makes you different?" required>
        <TextField
          label="If you had a billboard, what would it say?"
          required
          multiline
          rows={4}
          value={whatMakesYouDifferent}
          onChange={(e) => setWhatMakesYouDifferent(e.target.value)}
          placeholder="We answer every call ourselves — no call center. Same-day service in most cases."
          maxLength={800}
          hint="One or two sentences. The single thing your customers tell their friends about you."
        />
      </Field>

      <Field label="Top services" required>
        <p className="mb-3 text-[12px] text-apx-mute">
          List {MIN_SERVICES}–{MAX_SERVICES}. Just the names — we&apos;ll write the
          blurbs. Pick your highest-margin or most-requested first.
        </p>
        <div className="space-y-2">
          {services.map((value, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1">
                <TextField
                  label={`Service ${i + 1}`}
                  value={value}
                  onChange={(e) => updateService(i, e.target.value)}
                  placeholder={
                    i === 0
                      ? "Roof repair"
                      : i === 1
                        ? "Full re-roofs"
                        : "Storm damage response"
                  }
                  maxLength={80}
                  required={i < MIN_SERVICES}
                />
              </div>
              {services.length > MIN_SERVICES ? (
                <button
                  type="button"
                  onClick={() => removeService(i)}
                  aria-label={`Remove service ${i + 1}`}
                  className="mt-7 text-apx-mute transition hover:text-apx-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addService}
          disabled={services.length >= MAX_SERVICES}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            borderColor: "var(--apex-border)",
            background: "var(--apex-surface)",
            color: "var(--apex-fg)",
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add another ({services.length}/{MAX_SERVICES})
        </button>
      </Field>

      <Field label="Target customer" required>
        <TextField
          label="Describe your ideal customer in a sentence"
          required
          multiline
          rows={3}
          value={targetCustomer}
          onChange={(e) => setTargetCustomer(e.target.value)}
          placeholder="Homeowners in the Phoenix valley who need an honest assessment after a storm."
          maxLength={400}
          hint="Who do you wish would call you tomorrow?"
        />
      </Field>

      <Field label="Preferred tone" required>
        <div className="grid gap-2 sm:grid-cols-2">
          {TONE_OPTIONS.map((opt) => {
            const checked = preferredTone === opt.value
            return (
              <label
                key={opt.value}
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition"
                style={{
                  borderColor: checked
                    ? "var(--apex-primary)"
                    : "var(--apex-border)",
                  background: checked
                    ? "color-mix(in oklab, var(--apex-primary) 8%, var(--apex-surface))"
                    : "var(--apex-surface)",
                  color: "var(--apex-surface-fg)",
                }}
              >
                <input
                  type="radio"
                  name="preferredTone"
                  value={opt.value}
                  checked={checked}
                  onChange={() => setPreferredTone(opt.value)}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 accent-apx-primary"
                />
                <span className="flex-1">
                  <span className="block text-sm font-semibold leading-tight">
                    {opt.label}
                  </span>
                  <span
                    className="mt-0.5 block text-[12px] leading-snug"
                    style={{ color: "var(--apex-muted-fg)" }}
                  >
                    {opt.hint}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      </Field>

      {error ? (
        <p
          className="rounded-lg border px-4 py-3 text-sm"
          role="alert"
          style={{
            background: "color-mix(in oklab, #DC2626 8%, transparent)",
            borderColor: "color-mix(in oklab, #DC2626 30%, var(--apex-border))",
            color: "#991B1B",
          }}
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!valid || pending}
        className="inline-flex items-center gap-1.5 px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: "var(--apex-primary)",
          color: "var(--apex-primary-fg)",
          borderRadius: "var(--apex-radius-md)",
          fontFamily: "var(--apex-font-display)",
        }}
      >
        Draft my copy
      </button>
    </form>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <fieldset>
      <legend
        className="mb-2 text-xs font-bold uppercase tracking-[0.18em]"
        style={{ color: "var(--apex-muted-fg)" }}
      >
        {label}
        {required ? <span style={{ color: "var(--apex-primary)" }}> *</span> : null}
      </legend>
      {children}
    </fieldset>
  )
}

function DraftingState() {
  return (
    <div
      className="flex flex-col items-center rounded-2xl border px-6 py-12 text-center"
      style={{
        background: "var(--apex-surface)",
        borderColor: "var(--apex-border)",
        color: "var(--apex-surface-fg)",
      }}
    >
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-apx-line border-t-apx-primary" />
      <h2
        className="mt-6 text-xl font-bold leading-tight"
        style={{ fontFamily: "var(--apex-font-display)" }}
      >
        Drafting your copy…
      </h2>
      <p
        className="mt-2 max-w-md text-sm leading-relaxed"
        style={{ color: "var(--apex-muted-fg)" }}
      >
        This takes about 15 seconds. Hang tight — don&apos;t close this tab.
        Once we&apos;re done, you&apos;ll be sent back to the checklist and
        we&apos;ll email you when the draft is ready to review.
      </p>
    </div>
  )
}
