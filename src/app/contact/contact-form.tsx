"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { ArrowRight } from "lucide-react"

import { allThemes } from "@/lib/themes"

type Status = "idle" | "submitting" | "success" | "error"

export function ContactForm() {
  const params = useSearchParams()
  const ref = params.get("ref") ?? ""
  const piece = params.get("piece") ?? ""
  const referencedTheme = piece ? allThemes[piece] : undefined

  const initialMessage = React.useMemo(() => {
    // Specific design referenced — buyer-intent message matching the
    // standard "I want this look" purchase flow.
    if (referencedTheme) {
      return `I want to launch a site in the ${referencedTheme.name} style. My business is in [industry]. Anything I should know before I start checkout?`
    }
    // "Suggest a design" path from the portfolio footer CTA.
    if (ref === "portfolio-suggestion") {
      return "I'm interested in a design that's not in your current 24 themes. My business is in [industry] and I'm looking for [describe style]."
    }
    if (ref === "portfolio") {
      return "I'd like to talk about which of your 24 designs would fit my business best."
    }
    if (ref === "pricing") {
      return "I have a question about your pricing. "
    }
    if (ref === "final-cta") {
      return "I'd like to book a 15-minute call to walk through Apex Sites and figure out which design fits my business. "
    }
    return ""
  }, [ref, referencedTheme])

  const initialIndustry = referencedTheme?.industry ?? ""

  // ContactForm is mounted inside a Suspense boundary in page.tsx, so
  // useSearchParams resolves before first render and we can use the
  // derived initial values directly as initial state.
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [business, setBusiness] = React.useState("")
  const [industry, setIndustry] = React.useState(initialIndustry)
  const [message, setMessage] = React.useState(initialMessage)
  const [status, setStatus] = React.useState<Status>("idle")
  const [errors, setErrors] = React.useState<string[]>([])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("submitting")
    setErrors([])
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          business,
          industry,
          message,
          ref,
          piece,
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { issues?: { path: string; message: string }[]; error?: string }
          | null
        const msgs = data?.issues?.map((i) => i.message) ?? [
          data?.error ?? "Something went wrong. Try again.",
        ]
        setErrors(msgs)
        setStatus("error")
        return
      }
      setStatus("success")
    } catch {
      setErrors(["Network error. Try again."])
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-emerald-900">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
          Message received
        </p>
        <h2 className="mt-3 text-2xl font-bold">We&apos;ll be in touch within 24 hours.</h2>
        <p className="mt-3 text-emerald-900/80">
          Most replies come faster — we read every inbound, and a real person responds. If
          you don&apos;t hear from us by tomorrow, email{" "}
          <a href="mailto:hello@apexsites.com" className="font-semibold underline">
            hello@apexsites.com
          </a>{" "}
          and we&apos;ll dig it out of spam.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {referencedTheme && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p>
            <strong>Reference:</strong> custom build inspired by{" "}
            <strong>{referencedTheme.name}</strong> ({referencedTheme.industry}).
          </p>
        </div>
      )}
      <Field label="Your name">
        <input
          type="text"
          required
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 outline-none transition focus:border-neutral-900"
        />
      </Field>
      <Field label="Email">
        <input
          type="email"
          required
          maxLength={200}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 outline-none transition focus:border-neutral-900"
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Business name">
          <input
            type="text"
            required
            maxLength={200}
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            autoComplete="organization"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 outline-none transition focus:border-neutral-900"
          />
        </Field>
        <Field label="Industry / trade">
          <input
            type="text"
            maxLength={120}
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Plumbing, HVAC, dog walking…"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 outline-none transition focus:border-neutral-900"
          />
        </Field>
      </div>
      <Field label="Message">
        <textarea
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 outline-none transition focus:border-neutral-900"
        />
      </Field>
      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          <ul className="list-disc pl-5">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-neutral-900 px-5 py-3 text-base font-bold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? "Sending…" : "Send message"}
        {status !== "submitting" && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  )
}
