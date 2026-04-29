import type { Theme } from "@/lib/themes/types"
import { ApexButton, Container, Display } from "./primitives"

interface FinalCTAProps {
  theme: Theme
}

export function FinalCTA({ theme }: FinalCTAProps) {
  return (
    <section
      className="py-24"
      style={{
        background: "var(--apex-fg)",
        color: "var(--apex-bg)",
      }}
    >
      <Container className="grid items-center gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <Display as="h2" className="text-4xl sm:text-5xl lg:text-6xl">
            Pick a style.{" "}
            <span style={{ color: "var(--apex-primary)" }}>Get a site that books jobs.</span>
          </Display>
          <p className="mt-5 max-w-xl text-lg leading-relaxed opacity-80">
            Browse the showcase, click the demo that feels right for your trade, and we&apos;ll
            launch your site within 24 hours. Cancel anytime.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-col lg:items-end">
          <ApexButton theme={theme} variant="primary" size="lg" asChildHref="#demos">
            Pick a style →
          </ApexButton>
          <ApexButton
            theme={theme}
            variant="outline"
            size="lg"
            asChildHref="https://cal.com/apexsites/intro"
            className="!border-current"
          >
            Book a 15-min call
          </ApexButton>
        </div>
      </Container>
    </section>
  )
}
