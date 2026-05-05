import * as React from "react"
import { Phone } from "lucide-react"

import type { Theme } from "@/lib/themes/types"
import type {
  SiteContentContact,
  SiteContentHero,
} from "@/lib/site-content/types"

import { Container, Display } from "@/components/home/primitives"

interface CustomerHeroProps {
  hero: SiteContentHero
  contact: SiteContentContact
  theme: Theme
}

/**
 * Customer hero. Theme tokens carry the visual style; copy comes from
 * site_content.hero. Right-side card always shows the contact essentials
 * (phone + hours preview) so first-paint = immediate path to conversion.
 *
 * Theme.hero patterns (phone-first, calculator, gallery, etc.) are NOT
 * used here — those are demo/marketing affordances. A real customer site
 * needs a single reliable CTA: call.
 */
export function CustomerHero({ hero, contact, theme }: CustomerHeroProps) {
  const telHref = `tel:${stripPhoneFormatting(contact.phone)}`
  const explicitHref = sanitizeHref(hero.primaryCtaHref)
  const ctaHref = explicitHref ?? telHref
  const ctaLabel = hero.primaryCtaLabel?.trim() || `Call ${contact.phone}`

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "var(--apex-bg)",
        color: "var(--apex-fg)",
        paddingTop: "60px",
        paddingBottom: "100px",
      }}
    >
      {theme.vibe === "bold-industrial" ? <HazardStripes /> : null}
      <Container className="relative grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div className="max-w-2xl">
          {theme.heroEyebrow ? (
            <span
              className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{
                background: "var(--apex-accent)",
                color: "var(--apex-accent-fg)",
                borderRadius: "var(--apex-radius-pill)",
              }}
            >
              {theme.heroEyebrow}
            </span>
          ) : null}
          <Display
            as="h1"
            className="text-5xl sm:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--apex-font-display)" }}
          >
            {hero.headline}
          </Display>
          {hero.subhead ? (
            <p
              className="mt-6 max-w-xl text-lg leading-relaxed"
              style={{ color: "var(--apex-muted-fg)" }}
            >
              {hero.subhead}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={ctaHref}
              className="inline-flex items-center gap-2 px-7 py-4 text-base font-bold transition hover:-translate-y-0.5"
              style={{
                background: "var(--apex-primary)",
                color: "var(--apex-primary-fg)",
                borderRadius: "var(--apex-radius-md)",
                fontFamily: "var(--apex-font-display)",
              }}
            >
              <Phone className="h-4 w-4" aria-hidden />
              {ctaLabel}
            </a>
            <a
              href="#services"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-bold transition hover:-translate-y-0.5"
              style={{
                background: "transparent",
                color: "var(--apex-fg)",
                border: "1.5px solid var(--apex-fg)",
                borderRadius: "var(--apex-radius-md)",
                fontFamily: "var(--apex-font-display)",
              }}
            >
              See services
            </a>
          </div>
        </div>
        <ContactCard contact={contact} />
      </Container>
    </section>
  )
}

function ContactCard({ contact }: { contact: SiteContentContact }) {
  const telHref = `tel:${stripPhoneFormatting(contact.phone)}`
  return (
    <aside
      className="w-full max-w-md justify-self-end"
      style={{
        background: "var(--apex-surface)",
        color: "var(--apex-surface-fg)",
        borderRadius: "var(--apex-radius-lg)",
        padding: "32px",
        boxShadow:
          "0 30px 60px -24px color-mix(in oklab, var(--apex-fg) 25%, transparent)",
        border: "1px solid var(--apex-border)",
      }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-[0.18em]"
        style={{
          color: "var(--apex-muted-fg)",
          fontFamily: "var(--apex-font-mono)",
        }}
      >
        Reach us
      </p>
      <a
        href={telHref}
        className="mt-3 block text-3xl font-extrabold leading-none tracking-tight"
        style={{
          fontFamily: "var(--apex-font-display)",
          color: "var(--apex-fg)",
        }}
      >
        {contact.phone}
      </a>
      <p
        className="mt-3 text-sm"
        style={{ color: "var(--apex-muted-fg)" }}
      >
        {contact.hoursMode === "24/7" ? "Open 24/7" : hoursOneLine(contact)}
      </p>
      {contact.email ? (
        <a
          href={`mailto:${contact.email}`}
          className="mt-4 block text-sm font-semibold underline underline-offset-2"
          style={{ color: "var(--apex-fg)" }}
        >
          {contact.email}
        </a>
      ) : null}
      {contact.address ? (
        <p
          className="mt-2 text-sm"
          style={{ color: "var(--apex-muted-fg)" }}
        >
          {contact.address}
        </p>
      ) : null}
    </aside>
  )
}

function hoursOneLine(contact: SiteContentContact): string {
  if (!contact.hours) return "Call for hours"
  const days = contact.hours
  const weekdayKeys = ["mon", "tue", "wed", "thu", "fri"] as const
  const allWeekdaySame = weekdayKeys.every((k) => {
    const ref = days.mon
    const d = days[k]
    if (!ref || !d) return false
    return d.open === ref.open && d.close === ref.close && d.closed === ref.closed
  })
  if (allWeekdaySame && days.mon && !days.mon.closed) {
    const wd = `Mon–Fri ${days.mon.open}–${days.mon.close}`
    return wd
  }
  return "See hours below"
}

function HazardStripes() {
  const stripe = {
    backgroundImage:
      "repeating-linear-gradient(45deg, var(--apex-primary) 0 16px, var(--apex-fg) 16px 32px)",
  } as const
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-0 h-2"
        style={stripe}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 bottom-0 h-2"
        style={stripe}
      />
    </>
  )
}

function stripPhoneFormatting(phone: string): string {
  return phone.replace(/[^\d+]/g, "")
}

/** Reject javascript: and data: URIs even though Zod allowed them. */
function sanitizeHref(href: string | undefined): string | undefined {
  if (!href) return undefined
  const trimmed = href.trim()
  const lower = trimmed.toLowerCase()
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:")
  ) {
    return undefined
  }
  return trimmed
}
