import * as React from "react"

import type { SiteContentServiceArea } from "@/lib/site-content/types"
import { Container, Display, Eyebrow, Section } from "@/components/home/primitives"

interface CustomerServiceAreaProps {
  serviceArea: SiteContentServiceArea
  businessName: string
}

export function CustomerServiceArea({
  serviceArea,
  businessName,
}: CustomerServiceAreaProps) {
  return (
    <Section id="area" surface>
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>Service area</Eyebrow>
          <Display as="h2" className="mt-5 text-3xl sm:text-4xl">
            Where {businessName} works.
          </Display>
        </div>
        <ul className="mt-10 flex flex-wrap gap-2">
          {serviceArea.cities.map((city, i) => (
            <li
              key={`${city}-${i}`}
              className="inline-flex items-center px-3 py-1.5 text-sm font-semibold"
              style={{
                background: "var(--apex-bg)",
                color: "var(--apex-fg)",
                border: "1px solid var(--apex-border)",
                borderRadius: "var(--apex-radius-pill)",
              }}
            >
              {city}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
