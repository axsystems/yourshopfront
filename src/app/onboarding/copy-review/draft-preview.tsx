import * as React from "react"

import type { PartialSiteContent } from "@/lib/site-content/schema"

interface DraftPreviewProps {
  draft: PartialSiteContent
  businessName: string
}

/**
 * Themed preview of the draft. We can't use CustomerHome here because that
 * requires a fully-valid SiteContent (with contact, serviceArea, etc) and
 * the draft is intentionally PartialSiteContent — copy only, no contact /
 * media. So we render a stripped-down preview that mirrors the live-site
 * sections relevant to copy review: hero, services, about. Uses the same
 * apex theme tokens (--apex-fg, --apex-primary, etc) so the preview feels
 * on-brand without forcing the customer to fill out unrelated sections
 * first.
 */
export function DraftPreview({ draft, businessName }: DraftPreviewProps) {
  const hero = draft.hero
  const services = draft.services ?? []
  const about = draft.about

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        background: "var(--apex-surface)",
        borderColor: "var(--apex-border)",
        color: "var(--apex-surface-fg)",
      }}
    >
      {/* Hero */}
      <section className="px-6 py-10 md:px-10 md:py-12">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "var(--apex-muted-fg)" }}
        >
          {businessName}
        </p>
        {hero?.headline ? (
          <h2
            className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl"
            style={{
              color: "var(--apex-fg)",
              fontFamily: "var(--apex-font-display)",
            }}
          >
            {hero.headline}
          </h2>
        ) : (
          <p
            className="mt-3 text-sm italic"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            (No hero headline drafted yet.)
          </p>
        )}
        {hero?.subhead && (
          <p
            className="mt-4 max-w-2xl text-base leading-relaxed"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            {hero.subhead}
          </p>
        )}
      </section>

      <hr style={{ borderColor: "var(--apex-border)" }} />

      {/* Services */}
      <section className="px-6 py-10 md:px-10 md:py-12">
        <h3
          className="text-xs font-bold uppercase tracking-[0.18em]"
          style={{ color: "var(--apex-muted-fg)" }}
        >
          Services
        </h3>
        {services.length === 0 ? (
          <p
            className="mt-3 text-sm italic"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            (No services drafted yet.)
          </p>
        ) : (
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {services.map((service, idx) => (
              <li
                key={idx}
                className="rounded-lg border p-5"
                style={{
                  borderColor: "var(--apex-border)",
                  background: "var(--apex-paper)",
                }}
              >
                <h4
                  className="text-base font-semibold leading-snug"
                  style={{
                    color: "var(--apex-fg)",
                    fontFamily: "var(--apex-font-display)",
                  }}
                >
                  {service.title}
                </h4>
                {service.priceFrom && (
                  <p
                    className="mt-1 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--apex-primary)" }}
                  >
                    From {service.priceFrom}
                  </p>
                )}
                <p
                  className="mt-3 text-sm leading-relaxed"
                  style={{ color: "var(--apex-muted-fg)" }}
                >
                  {service.blurb}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <hr style={{ borderColor: "var(--apex-border)" }} />

      {/* About */}
      <section className="px-6 py-10 md:px-10 md:py-12">
        <h3
          className="text-xs font-bold uppercase tracking-[0.18em]"
          style={{ color: "var(--apex-muted-fg)" }}
        >
          About
        </h3>
        {about?.heading ? (
          <h4
            className="mt-3 text-2xl font-bold leading-tight tracking-tight md:text-3xl"
            style={{
              color: "var(--apex-fg)",
              fontFamily: "var(--apex-font-display)",
            }}
          >
            {about.heading}
          </h4>
        ) : (
          <p
            className="mt-3 text-sm italic"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            (No about heading drafted yet.)
          </p>
        )}
        {about?.body && (
          <p
            className="mt-4 whitespace-pre-wrap text-base leading-relaxed"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            {about.body}
          </p>
        )}
      </section>
    </div>
  )
}
