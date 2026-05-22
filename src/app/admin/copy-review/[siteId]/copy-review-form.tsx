"use client"

import * as React from "react"

import type { PartialSiteContent } from "@/lib/site-content/schema"

import { approveDraft, redraft } from "./actions"

interface CopyReviewFormProps {
  siteId: string
  token: string
  initialDraft: PartialSiteContent
  attemptCount: number
}

interface ServiceRow {
  title: string
  blurb: string
  priceFrom: string
}

interface FormState {
  heroHeadline: string
  heroSubhead: string
  aboutHeading: string
  aboutBody: string
  services: ServiceRow[]
}

const EMPTY_SERVICE: ServiceRow = { title: "", blurb: "", priceFrom: "" }
const MAX_ATTEMPTS = 3

function fromDraft(d: PartialSiteContent): FormState {
  return {
    heroHeadline: d.hero?.headline ?? "",
    heroSubhead: d.hero?.subhead ?? "",
    aboutHeading: d.about?.heading ?? "",
    aboutBody: d.about?.body ?? "",
    services: (d.services?.length ? d.services : [EMPTY_SERVICE, EMPTY_SERVICE, EMPTY_SERVICE]).map(
      (s) => ({
        title: s.title ?? "",
        blurb: s.blurb ?? "",
        priceFrom: s.priceFrom ?? "",
      })
    ),
  }
}

function toEdits(state: FormState): PartialSiteContent {
  const edits: PartialSiteContent = {}
  if (state.heroHeadline.trim() || state.heroSubhead.trim()) {
    edits.hero = {
      headline: state.heroHeadline.trim(),
      ...(state.heroSubhead.trim() ? { subhead: state.heroSubhead.trim() } : {}),
    }
  }
  if (state.aboutHeading.trim() || state.aboutBody.trim()) {
    edits.about = {
      heading: state.aboutHeading.trim(),
      body: state.aboutBody.trim(),
    }
  }
  const services = state.services
    .filter((s) => s.title.trim() && s.blurb.trim())
    .map((s) => ({
      title: s.title.trim(),
      blurb: s.blurb.trim(),
      ...(s.priceFrom.trim() ? { priceFrom: s.priceFrom.trim() } : {}),
    }))
  if (services.length > 0) {
    edits.services = services
  }
  return edits
}

/**
 * Operator edit surface. State lives entirely here — the parent page is a
 * server component that just hands down the initial draft. On submit we
 * either approve (send to customer) or trigger a fresh AI redraft.
 */
export function CopyReviewForm({
  siteId,
  token,
  initialDraft,
  attemptCount,
}: CopyReviewFormProps) {
  const [state, setState] = React.useState<FormState>(() => fromDraft(initialDraft))
  const [submitting, setSubmitting] = React.useState<null | "approve" | "redraft">(null)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  const setHero = (field: "heroHeadline" | "heroSubhead", value: string) =>
    setState((s) => ({ ...s, [field]: value }))
  const setAbout = (field: "aboutHeading" | "aboutBody", value: string) =>
    setState((s) => ({ ...s, [field]: value }))
  const setService = (idx: number, field: keyof ServiceRow, value: string) =>
    setState((s) => ({
      ...s,
      services: s.services.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    }))
  const addService = () =>
    setState((s) => ({ ...s, services: [...s.services, { ...EMPTY_SERVICE }] }))
  const removeService = (idx: number) =>
    setState((s) => ({ ...s, services: s.services.filter((_, i) => i !== idx) }))

  async function handleApprove() {
    setError(null)
    setSuccess(null)
    setSubmitting("approve")
    try {
      const res = await approveDraft({ siteId, token, edits: toEdits(state) })
      if (res.ok) {
        setSuccess("Approved. Customer has been emailed.")
      } else {
        setError(res.error)
      }
    } finally {
      setSubmitting(null)
    }
  }

  async function handleRedraft() {
    if (!window.confirm("Redraft from scratch? This will discard your current edits.")) return
    setError(null)
    setSuccess(null)
    setSubmitting("redraft")
    try {
      const res = await redraft({ siteId, token })
      if (res.ok) {
        setSuccess("Redrafted. Refresh the page to see the new draft.")
      } else {
        setError(res.error)
      }
    } finally {
      setSubmitting(null)
    }
  }

  const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - attemptCount)
  const redraftDisabled = submitting !== null || attemptsRemaining === 0

  return (
    <section className="space-y-8">
      <SectionCard title="Hero">
        <Field label="Headline">
          <input
            type="text"
            value={state.heroHeadline}
            onChange={(e) => setHero("heroHeadline", e.target.value)}
            className={INPUT_CLS}
          />
        </Field>
        <Field label="Subhead">
          <textarea
            rows={2}
            value={state.heroSubhead}
            onChange={(e) => setHero("heroSubhead", e.target.value)}
            className={TEXTAREA_CLS}
          />
        </Field>
      </SectionCard>

      <SectionCard title="Services">
        <div className="space-y-5">
          {state.services.map((row, idx) => (
            <div key={idx} className="rounded-md border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Service {idx + 1}
                </span>
                {state.services.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeService(idx)}
                    className="text-xs font-semibold text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="mt-3 grid gap-3">
                <Field label="Title">
                  <input
                    type="text"
                    value={row.title}
                    onChange={(e) => setService(idx, "title", e.target.value)}
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label="Blurb">
                  <textarea
                    rows={3}
                    value={row.blurb}
                    onChange={(e) => setService(idx, "blurb", e.target.value)}
                    className={TEXTAREA_CLS}
                  />
                </Field>
                <Field label="Price from (optional)">
                  <input
                    type="text"
                    value={row.priceFrom}
                    onChange={(e) => setService(idx, "priceFrom", e.target.value)}
                    className={INPUT_CLS}
                  />
                </Field>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addService}
            className="text-sm font-semibold text-slate-700 underline underline-offset-2 hover:text-slate-900"
          >
            + Add service
          </button>
        </div>
      </SectionCard>

      <SectionCard title="About">
        <Field label="Heading">
          <input
            type="text"
            value={state.aboutHeading}
            onChange={(e) => setAbout("aboutHeading", e.target.value)}
            className={INPUT_CLS}
          />
        </Field>
        <Field label="Body">
          <textarea
            rows={6}
            value={state.aboutBody}
            onChange={(e) => setAbout("aboutBody", e.target.value)}
            className={TEXTAREA_CLS}
          />
        </Field>
      </SectionCard>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleRedraft}
          disabled={redraftDisabled}
          className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting === "redraft" ? "Redrafting…" : `Redraft from scratch (${attemptsRemaining} left)`}
        </button>
        <button
          type="button"
          onClick={handleApprove}
          disabled={submitting !== null}
          className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting === "approve" ? "Sending…" : "Send to customer for approval"}
        </button>
      </div>
    </section>
  )
}

const INPUT_CLS =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
const TEXTAREA_CLS =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-relaxed text-slate-900 shadow-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  )
}
