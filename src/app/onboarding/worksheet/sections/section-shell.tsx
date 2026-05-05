"use client"

import * as React from "react"
import { Check, Circle } from "lucide-react"

export type SectionStatus = "empty" | "filled" | "saving" | "error"

interface SectionShellProps {
  n: number
  title: string
  description: React.ReactNode
  status: SectionStatus
  required?: boolean
  locked?: boolean
  error?: string | null
  children: React.ReactNode
}

/**
 * Shared visual shell for every worksheet section. Mirrors the chrome of
 * the onboarding checklist `<Step>` so the two surfaces feel like one
 * flow.
 */
export function SectionShell({
  n,
  title,
  description,
  status,
  required,
  locked,
  error,
  children,
}: SectionShellProps) {
  const filled = status === "filled"
  return (
    <section
      className="rounded-2xl border p-5 sm:p-6"
      style={{
        background: filled
          ? "color-mix(in oklab, var(--apex-primary) 8%, var(--apex-surface))"
          : "var(--apex-surface)",
        color: "var(--apex-surface-fg)",
        borderColor: filled
          ? "color-mix(in oklab, var(--apex-primary) 30%, var(--apex-border))"
          : "var(--apex-border)",
      }}
    >
      <header className="flex items-start gap-4">
        <div
          className="mt-0.5 grid h-9 w-9 flex-shrink-0 place-items-center rounded-full"
          style={{
            background: filled
              ? "var(--apex-primary)"
              : "color-mix(in oklab, var(--apex-fg) 8%, transparent)",
            color: filled ? "var(--apex-primary-fg)" : "var(--apex-muted-fg)",
          }}
          aria-hidden
        >
          {filled ? (
            <Check className="h-4 w-4" strokeWidth={3} />
          ) : (
            <span className="text-sm font-bold">{n}</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              className="text-lg font-bold leading-tight"
              style={{ fontFamily: "var(--apex-font-display)" }}
            >
              {title}
            </h2>
            {required ? (
              <StatusPill status={status} />
            ) : (
              <span
                className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]"
                style={{
                  background: "color-mix(in oklab, var(--apex-fg) 8%, transparent)",
                  color: "var(--apex-muted-fg)",
                }}
              >
                Optional
              </span>
            )}
          </div>
          <div
            className="mt-1 text-sm leading-relaxed"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            {description}
          </div>
        </div>
      </header>
      <div className="mt-5">
        <fieldset disabled={locked} className="space-y-4">
          {children}
        </fieldset>
      </div>
      {error ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  )
}

function StatusPill({ status }: { status: SectionStatus }) {
  const config: Record<
    SectionStatus,
    { label: string; bg: string; fg: string; icon?: React.ReactNode }
  > = {
    empty: {
      label: "Required",
      bg: "color-mix(in oklab, var(--apex-fg) 6%, transparent)",
      fg: "var(--apex-muted-fg)",
      icon: <Circle className="h-3 w-3" />,
    },
    filled: {
      label: "Saved",
      bg: "var(--apex-primary)",
      fg: "var(--apex-primary-fg)",
      icon: <Check className="h-3 w-3" strokeWidth={3} />,
    },
    saving: {
      label: "Saving…",
      bg: "color-mix(in oklab, var(--apex-fg) 6%, transparent)",
      fg: "var(--apex-muted-fg)",
    },
    error: {
      label: "Error",
      bg: "color-mix(in oklab, #DC2626 16%, transparent)",
      fg: "#991B1B",
    },
  }
  const c = config[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]"
      style={{ background: c.bg, color: c.fg }}
    >
      {c.icon}
      {c.label}
    </span>
  )
}

/**
 * Standardized save button reused by every section form. The disabled state
 * is delegated by the parent (validation + locked check).
 */
export function SaveButton({
  disabled,
  children = "Save section",
}: {
  disabled?: boolean
  children?: React.ReactNode
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      style={{
        background: "var(--apex-primary)",
        color: "var(--apex-primary-fg)",
        borderRadius: "var(--apex-radius-md)",
        fontFamily: "var(--apex-font-display)",
      }}
    >
      {children}
    </button>
  )
}
