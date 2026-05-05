import * as React from "react"

import type { SiteContentService } from "@/lib/site-content/types"
import { Container, Display, Eyebrow, Section } from "@/components/home/primitives"

interface CustomerServicesProps {
  services: SiteContentService[]
}

export function CustomerServices({ services }: CustomerServicesProps) {
  return (
    <Section id="services" surface>
      <Container>
        <div className="max-w-3xl">
          <Eyebrow>Services</Eyebrow>
          <Display as="h2" className="mt-5 text-4xl sm:text-5xl">
            What we do.
          </Display>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <article
              key={`${s.title}-${i}`}
              className="flex flex-col p-7"
              style={{
                background: "var(--apex-bg)",
                color: "var(--apex-fg)",
                border: "1px solid var(--apex-border)",
                borderRadius: "var(--apex-radius-lg)",
              }}
            >
              <p
                className="text-xs"
                style={{
                  color: "var(--apex-muted-fg)",
                  fontFamily: "var(--apex-font-mono)",
                  letterSpacing: "0.18em",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3
                className="mt-3 text-xl font-bold leading-tight"
                style={{
                  fontFamily: "var(--apex-font-display)",
                  letterSpacing: "-0.015em",
                }}
              >
                {s.title}
              </h3>
              <p
                className="mt-3 flex-1 text-sm leading-relaxed"
                style={{ color: "var(--apex-muted-fg)" }}
              >
                {s.blurb}
              </p>
              {s.priceFrom ? (
                <p
                  className="mt-5 inline-flex w-fit items-center px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
                  style={{
                    background: "color-mix(in oklab, var(--apex-primary) 14%, transparent)",
                    color: "var(--apex-fg)",
                    borderRadius: "var(--apex-radius-pill)",
                    fontFamily: "var(--apex-font-mono)",
                  }}
                >
                  {s.priceFrom}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </Container>
    </Section>
  )
}
