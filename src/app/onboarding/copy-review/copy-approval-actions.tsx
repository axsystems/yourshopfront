"use client"

import * as React from "react"

import { Button } from "@/components/apex"

import { approveCopy, requestChanges } from "./actions"

interface CopyApprovalActionsProps {
  sessionId: string
  alreadyApproved: boolean
}

/**
 * Approve / Request-changes pair shown beneath the draft preview. State is
 * fully local — server actions update the row and we surface success +
 * error inline. On approve-success the customer sees a "building" banner
 * (the page-level checklist on /onboarding handles the longer-running
 * status display, so here we just show a confirmation and stop the user
 * from double-submitting).
 */
export function CopyApprovalActions({
  sessionId,
  alreadyApproved,
}: CopyApprovalActionsProps) {
  const [mode, setMode] = React.useState<"idle" | "requesting">("idle")
  const [feedback, setFeedback] = React.useState("")
  const [submitting, setSubmitting] = React.useState<null | "approve" | "request">(null)
  const [error, setError] = React.useState<string | null>(null)
  const [approved, setApproved] = React.useState(alreadyApproved)
  const [requestedAt, setRequestedAt] = React.useState<string | null>(null)

  async function handleApprove() {
    setError(null)
    setSubmitting("approve")
    try {
      const res = await approveCopy({ sessionId })
      if (res.ok) {
        setApproved(true)
      } else {
        setError(res.error)
      }
    } finally {
      setSubmitting(null)
    }
  }

  async function handleRequestChanges(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting("request")
    try {
      const res = await requestChanges({ sessionId, feedback })
      if (res.ok) {
        setRequestedAt(new Date().toISOString())
        setFeedback("")
        setMode("idle")
      } else {
        setError(res.error)
      }
    } finally {
      setSubmitting(null)
    }
  }

  if (approved) {
    return (
      <div
        className="rounded-xl border-2 px-5 py-5 text-sm leading-relaxed"
        style={{
          background: "color-mix(in oklab, var(--apex-primary) 10%, transparent)",
          borderColor: "color-mix(in oklab, var(--apex-primary) 35%, var(--apex-border))",
          color: "var(--apex-fg)",
        }}
      >
        <p className="font-semibold">Building your site.</p>
        <p
          className="mt-2"
          style={{ color: "var(--apex-muted-fg)" }}
        >
          We&apos;ll email you the moment it&apos;s live — typically within
          24-48 hours. You can close this tab.
        </p>
      </div>
    )
  }

  if (mode === "requesting") {
    return (
      <form onSubmit={handleRequestChanges} className="space-y-4">
        <label className="block">
          <span
            className="mb-2 block text-sm font-semibold"
            style={{ color: "var(--apex-fg)" }}
          >
            What would you like us to change?
          </span>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={6}
            required
            minLength={5}
            maxLength={5000}
            className="w-full rounded-md border bg-white px-3 py-2 text-sm leading-relaxed text-slate-900 shadow-sm outline-none focus:ring-2"
            style={{ borderColor: "var(--apex-border)" }}
            placeholder="Tell us what to tweak — tone, specific lines, missing services, anything."
          />
        </label>
        {error && (
          <p
            className="rounded-md border px-4 py-3 text-sm"
            style={{
              background: "color-mix(in oklab, red 8%, transparent)",
              borderColor: "color-mix(in oklab, red 25%, var(--apex-border))",
              color: "var(--apex-fg)",
            }}
          >
            {error}
          </p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setMode("idle")
              setError(null)
            }}
            disabled={submitting !== null}
            className="text-sm font-semibold underline underline-offset-2 disabled:opacity-50"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            Cancel
          </button>
          <Button type="submit" variant="primary" size="md" loading={submitting === "request"}>
            {submitting === "request" ? "Sending…" : "Send change request"}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-4">
      {requestedAt && (
        <div
          className="rounded-md border px-4 py-3 text-sm"
          style={{
            background: "color-mix(in oklab, var(--apex-primary) 8%, transparent)",
            borderColor: "color-mix(in oklab, var(--apex-primary) 25%, var(--apex-border))",
            color: "var(--apex-fg)",
          }}
        >
          Thanks — we&apos;ve got your feedback and will send a revised draft
          within one business day.
        </div>
      )}
      {error && (
        <p
          className="rounded-md border px-4 py-3 text-sm"
          style={{
            background: "color-mix(in oklab, red 8%, transparent)",
            borderColor: "color-mix(in oklab, red 25%, var(--apex-border))",
            color: "var(--apex-fg)",
          }}
        >
          {error}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setMode("requesting")}
          disabled={submitting !== null}
          className="text-sm font-semibold underline underline-offset-2 disabled:opacity-50"
          style={{ color: "var(--apex-muted-fg)" }}
        >
          Request changes
        </button>
        <Button
          variant="primary"
          size="lg"
          loading={submitting === "approve"}
          onClick={handleApprove}
        >
          {submitting === "approve" ? "Approving…" : "Looks great — build my site"}
        </Button>
      </div>
    </div>
  )
}
