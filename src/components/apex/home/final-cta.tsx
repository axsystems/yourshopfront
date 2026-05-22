import * as React from "react"

import { Button, Container, HighlightStroke, Section } from "@/components/apex"
import { FadeUp } from "@/components/apex/motion/fade-up"
import { OpenChatButton } from "@/components/apex/open-chat-button"

export function HomeFinalCta() {
  return (
    <Section bg="primary-soft">
      <Container>
        <FadeUp>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-sans text-[36px] font-bold leading-[0.98] tracking-[-0.025em] text-apx-ink md:text-[64px]">
              Ready to get your{" "}
              <HighlightStroke>site</HighlightStroke> live?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-[18px] leading-[1.55] text-apx-mute md:text-[20px]">
              Pick a design, send us your content, and we&apos;ll launch your site within 24 hours. Cancel anytime — no calls, no contracts.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/portfolio" variant="primary" size="lg">
                Pick your style →
              </Button>
              <OpenChatButton variant="secondary" size="lg">
                Ask the concierge
              </OpenChatButton>
            </div>
          </div>
        </FadeUp>
      </Container>
    </Section>
  )
}
