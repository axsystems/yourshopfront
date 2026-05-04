import * as React from "react"

import { Container, Display, Eyebrow, Lede, Section } from "@/components/apex"

export function PortfolioHero({ count }: { count: number }) {
  return (
    <Section bg="canvas" className="py-20 md:py-28">
      <Container>
        <Eyebrow>Portfolio · 2025–2026</Eyebrow>
        <Display level="display-2xl" as="h1" className="mt-4 max-w-[14ch]">
          Every design we ship.
        </Display>
        <Lede className="mt-6 max-w-[60ch]">
          {count} production-grade home-service site designs across 3 design rounds — every one is available as a theme option. Pick any of the {count}, send us your content, we launch in 24 hours.
        </Lede>
      </Container>
    </Section>
  )
}
