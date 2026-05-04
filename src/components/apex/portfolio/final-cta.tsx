import * as React from "react"

import { Button, Container, Display, Eyebrow, Lede, Section } from "@/components/apex"
import { FadeUp } from "@/components/apex/motion/fade-up"

/**
 * Bottom CTA on /portfolio. "Suggest a design" path for industries we don't
 * cover yet. Replaces the audit-flagged hard-coded bg-neutral-900 text-emerald
 * strip — uses the standard --apx-primary-soft band pattern.
 */
export function PortfolioFinalCta() {
  return (
    <Section bg="primary-soft">
      <Container>
        <FadeUp>
          <div className="grid gap-8 md:grid-cols-[1.5fr_1fr] md:items-center">
            <div>
              <Eyebrow tone="cobalt">Don&apos;t see your industry?</Eyebrow>
              <Display level="display-xl" className="mt-4">
                Suggest a design — we add new themes regularly.
              </Display>
              <Lede className="mt-5">
                If your industry, vibe, or hero pattern isn&apos;t represented in our 24, send a quick note. We may have something in the pipeline that suits you, or we&apos;ll add yours to the queue.
              </Lede>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Button
                href="/contact?ref=portfolio-suggestion"
                variant="primary"
                size="lg"
              >
                Suggest a design →
              </Button>
              <Button href="/pricing" variant="ghost" size="md">
                Compare both tiers
              </Button>
            </div>
          </div>
        </FadeUp>
      </Container>
    </Section>
  )
}
