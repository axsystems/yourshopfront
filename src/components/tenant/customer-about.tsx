import * as React from "react"

import type { SiteContentAbout } from "@/lib/site-content/types"
import { Container, Display, Eyebrow, Section } from "@/components/home/primitives"

interface CustomerAboutProps {
  about: SiteContentAbout
}

export function CustomerAbout({ about }: CustomerAboutProps) {
  return (
    <Section id="about">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div>
            <Eyebrow>About</Eyebrow>
            <Display as="h2" className="mt-5 text-3xl sm:text-4xl">
              {about.heading}
            </Display>
          </div>
          <div
            className="space-y-4 text-lg leading-relaxed"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            {about.body
              .split(/\n{2,}/)
              .map((p) => p.trim())
              .filter(Boolean)
              .map((p, i) => (
                <p key={i}>{p}</p>
              ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
