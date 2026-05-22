import * as React from "react"
import { Phone } from "lucide-react"

import type {
  DayHours,
  SiteContentContact,
  WeekHours,
} from "@/lib/site-content/types"
import { Container, Display, Eyebrow, Section } from "@/components/home/primitives"

interface CustomerContactProps {
  contact: SiteContentContact
  businessName: string
}

const DAYS: Array<{ key: keyof WeekHours; label: string }> = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
]

export function CustomerContact({
  contact,
  businessName,
}: CustomerContactProps) {
  const telHref = `tel:${stripPhoneFormatting(contact.phone)}`
  return (
    <Section id="contact">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <Eyebrow>Contact</Eyebrow>
            <Display as="h2" className="mt-5 text-4xl sm:text-5xl">
              Ready when you are.
            </Display>
            <p
              className="mt-5 max-w-md text-lg leading-relaxed"
              style={{ color: "var(--apex-muted-fg)" }}
            >
              Call {businessName} or send an email — we answer fast.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={telHref}
                className="inline-flex items-center gap-2 px-7 py-4 text-base font-bold transition hover:-translate-y-0.5"
                style={{
                  background: "var(--apex-primary)",
                  color: "var(--apex-primary-fg)",
                  borderRadius: "var(--apex-radius-md)",
                  fontFamily: "var(--apex-font-display)",
                }}
              >
                <Phone className="h-4 w-4" aria-hidden />
                {contact.phone}
              </a>
              {contact.email ? (
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-bold transition hover:-translate-y-0.5"
                  style={{
                    background: "transparent",
                    color: "var(--apex-fg)",
                    border: "1.5px solid var(--apex-fg)",
                    borderRadius: "var(--apex-radius-md)",
                    fontFamily: "var(--apex-font-display)",
                  }}
                >
                  Email us
                </a>
              ) : null}
            </div>
            {contact.address ? (
              <p
                className="mt-6 text-sm"
                style={{ color: "var(--apex-muted-fg)" }}
              >
                {contact.address}
              </p>
            ) : null}
          </div>
          <HoursPanel contact={contact} />
        </div>
      </Container>
    </Section>
  )
}

function HoursPanel({ contact }: { contact: SiteContentContact }) {
  return (
    <aside
      className="self-start p-7"
      style={{
        background: "var(--apex-surface)",
        color: "var(--apex-surface-fg)",
        border: "1px solid var(--apex-border)",
        borderRadius: "var(--apex-radius-lg)",
      }}
    >
      <p
        className="text-[11px] font-bold uppercase tracking-[0.18em]"
        style={{
          color: "var(--apex-muted-fg)",
          fontFamily: "var(--apex-font-mono)",
        }}
      >
        Hours
      </p>
      {contact.hoursMode === "24/7" ? (
        <p
          className="mt-3 text-2xl font-bold"
          style={{ fontFamily: "var(--apex-font-display)" }}
        >
          Open 24/7
        </p>
      ) : (
        <dl className="mt-4 space-y-2">
          {DAYS.map(({ key, label }) => {
            const day: DayHours | undefined = contact.hours?.[key]
            return (
              <div
                key={key}
                className="flex items-center justify-between text-sm"
              >
                <dt className="font-semibold">{label}</dt>
                <dd style={{ color: "var(--apex-muted-fg)" }}>
                  {formatDay(day)}
                </dd>
              </div>
            )
          })}
        </dl>
      )}
    </aside>
  )
}

function formatDay(day: DayHours | undefined): string {
  if (!day) return "Closed"
  if (day.closed) return "Closed"
  if (day.open && day.close) return `${day.open} – ${day.close}`
  return "Closed"
}

function stripPhoneFormatting(phone: string): string {
  return phone.replace(/[^\d+]/g, "")
}
