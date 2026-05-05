"use client"

import * as React from "react"

import { TextField } from "@/components/apex"
import type {
  DayHours,
  HoursMode,
  SiteContentContact,
  WeekHours,
} from "@/lib/site-content/types"

import { saveWorksheetSection } from "../actions"
import { SaveButton, SectionShell } from "./section-shell"

interface ContactSectionProps {
  n: number
  sessionId: string
  initial: SiteContentContact | undefined
  locked: boolean
  onSaved: (next: SiteContentContact) => void
}

const DAYS: Array<{ key: keyof WeekHours; label: string }> = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
]

export function ContactSection({
  n,
  sessionId,
  initial,
  locked,
  onSaved,
}: ContactSectionProps) {
  const [phone, setPhone] = React.useState(initial?.phone ?? "")
  const [email, setEmail] = React.useState(initial?.email ?? "")
  const [address, setAddress] = React.useState(initial?.address ?? "")
  const [hoursMode, setHoursMode] = React.useState<HoursMode>(
    initial?.hoursMode ?? "hours"
  )
  const [hours, setHours] = React.useState<WeekHours>(
    initial?.hours ?? defaultHours()
  )
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  const filled = Boolean(initial?.phone && initial.hoursMode)
  const status = error ? "error" : pending ? "saving" : filled ? "filled" : "empty"

  const updateDay = (key: keyof WeekHours, patch: Partial<DayHours>) => {
    setHours((h) => ({ ...h, [key]: { ...h[key], ...patch } }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const data: SiteContentContact = {
      phone: phone.trim(),
      email: emptyToUndef(email),
      address: emptyToUndef(address),
      hoursMode,
      hours: hoursMode === "hours" ? hours : undefined,
    }
    startTransition(async () => {
      const result = await saveWorksheetSection({
        sessionId,
        section: "contact",
        data,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      onSaved(data)
    })
  }

  return (
    <SectionShell
      n={n}
      title="Contact"
      description="How customers reach you. Phone is required. Hours can be 24/7 or per-day open/close times."
      status={status}
      required
      locked={locked}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Phone"
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            inputMode="tel"
            autoComplete="tel"
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hello@yourbusiness.com"
            autoComplete="email"
          />
        </div>
        <TextField
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="123 Main St, Denver, CO 80202"
          autoComplete="street-address"
          hint="Optional. Shown in the footer."
        />

        <div>
          <span className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-apx-mute">
            Hours <span className="text-apx-primary">*</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {(["24/7", "hours"] as HoursMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setHoursMode(mode)}
                aria-pressed={hoursMode === mode}
                className="rounded-full border px-4 py-1.5 text-sm font-semibold transition"
                style={{
                  background:
                    hoursMode === mode ? "var(--apex-primary)" : "var(--apex-bg)",
                  color:
                    hoursMode === mode
                      ? "var(--apex-primary-fg)"
                      : "var(--apex-fg)",
                  borderColor:
                    hoursMode === mode
                      ? "var(--apex-primary)"
                      : "var(--apex-border)",
                }}
              >
                {mode === "24/7" ? "Open 24/7" : "Set per-day hours"}
              </button>
            ))}
          </div>
        </div>

        {hoursMode === "hours" ? (
          <div className="space-y-2">
            {DAYS.map(({ key, label }) => {
              const day = hours[key] ?? {}
              const closed = day.closed === true
              return (
                <div
                  key={key}
                  className="flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2"
                  style={{
                    borderColor: "var(--apex-border)",
                    background: "var(--apex-bg)",
                  }}
                >
                  <span className="w-12 font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-apx-mute">
                    {label}
                  </span>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={closed}
                      onChange={(e) =>
                        updateDay(key, {
                          closed: e.target.checked,
                          open: e.target.checked ? undefined : day.open ?? "08:00",
                          close: e.target.checked ? undefined : day.close ?? "17:00",
                        })
                      }
                      className="accent-[var(--apex-primary)]"
                    />
                    Closed
                  </label>
                  <input
                    type="time"
                    aria-label={`${label} open`}
                    value={day.open ?? ""}
                    onChange={(e) => updateDay(key, { open: e.target.value })}
                    disabled={closed}
                    className="rounded-md border px-2 py-1 text-sm"
                    style={{
                      borderColor: "var(--apex-border)",
                      background: "var(--apex-bg)",
                      color: "var(--apex-fg)",
                    }}
                  />
                  <span className="text-apx-mute">–</span>
                  <input
                    type="time"
                    aria-label={`${label} close`}
                    value={day.close ?? ""}
                    onChange={(e) => updateDay(key, { close: e.target.value })}
                    disabled={closed}
                    className="rounded-md border px-2 py-1 text-sm"
                    style={{
                      borderColor: "var(--apex-border)",
                      background: "var(--apex-bg)",
                      color: "var(--apex-fg)",
                    }}
                  />
                </div>
              )
            })}
          </div>
        ) : null}

        <SaveButton disabled={pending || locked || phone.trim().length < 7}>
          {pending ? "Saving…" : "Save contact"}
        </SaveButton>
      </form>
    </SectionShell>
  )
}

function defaultHours(): WeekHours {
  return {
    mon: { open: "08:00", close: "17:00" },
    tue: { open: "08:00", close: "17:00" },
    wed: { open: "08:00", close: "17:00" },
    thu: { open: "08:00", close: "17:00" },
    fri: { open: "08:00", close: "17:00" },
    sat: { closed: true },
    sun: { closed: true },
  }
}

function emptyToUndef(s: string): string | undefined {
  const v = s.trim()
  return v.length === 0 ? undefined : v
}
