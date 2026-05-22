import type { Theme } from "@/lib/themes/types"
import { FinalCtaChatCard } from "./final-cta-chat-card"
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
      <Container className="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <Display as="h2" className="text-4xl sm:text-5xl lg:text-6xl">
            Ready to{" "}
            <span style={{ color: "var(--apex-primary)" }}>book more jobs?</span>
          </Display>
          <p className="mt-5 max-w-xl text-lg leading-relaxed opacity-80">
            Pick a style, send us your content, and we&apos;ll launch your
            site within 24 hours. Cancel anytime — no calls, no contracts.
          </p>
          <div className="mt-8">
            <ApexButton theme={theme} variant="primary" size="lg" asChildHref="#showcase">
              Pick your style →
            </ApexButton>
          </div>
        </div>
        <FinalCtaChatCard theme={theme} />
      </Container>
    </section>
  )
}
