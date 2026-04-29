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
      <Container className="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <Display as="h2" className="text-4xl sm:text-5xl lg:text-6xl">
            Ready to{" "}
            <span style={{ color: "var(--apex-primary)" }}>book more jobs?</span>
          </Display>
          <p className="mt-5 max-w-xl text-lg leading-relaxed opacity-80">
            Pick a style from the 10 theme options, send us your content, and we&apos;ll
            launch your site within 24 hours. Cancel anytime.
          </p>
          <div className="mt-8">
            <ApexButton theme={theme} variant="primary" size="lg" asChildHref="#showcase">
              Pick your style →
            </ApexButton>
          </div>
        </div>
        <div
          className="flex flex-col justify-center gap-4 border-l-2 lg:pl-12"
          style={{ borderColor: "color-mix(in oklab, var(--apex-bg) 18%, transparent)" }}
        >
          <p
            className="text-xs font-bold uppercase tracking-[0.18em]"
            style={{ color: "color-mix(in oklab, var(--apex-bg) 60%, transparent)" }}
          >
            Or talk to a human
          </p>
          <Display as="h3" className="text-2xl sm:text-3xl">
            Book a 15-minute call.
          </Display>
          <p className="max-w-md text-base leading-relaxed opacity-80">
            We&apos;ll walk you through the 10 themes, your industry fit, and whether you
            should go subscription, one-time, or fully-custom. No pitch deck.
          </p>
          <div className="mt-2">
            <ApexButton
              theme={theme}
              variant="outline"
              size="lg"
              asChildHref="/contact?ref=final-cta"
              className="!border-current"
            >
              Book a 15-min call →
            </ApexButton>
          </div>
        </div>
      </Container>
    </section>
  )
}
