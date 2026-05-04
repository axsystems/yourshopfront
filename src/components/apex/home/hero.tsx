import * as React from "react"

import { Button, Container, Eyebrow, HeroFrame, HighlightStroke, Lede } from "@/components/apex"
import { RotatingPreview } from "./rotating-preview"

const PREVIEW_SLUGS = ["heritage-painters", "ironside-plumbing", "voltcraft-electric"]

export function HomeHero() {
  return (
    <section className="bg-apx-paper py-20 md:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="max-w-[640px]">
            <Eyebrow tone="cobalt">Productized websites for trades</Eyebrow>
            <h1 className="mt-5 font-sans text-[44px] font-bold leading-[0.98] tracking-[-0.025em] text-apx-ink md:text-[76px]">
              Websites that{" "}
              <HighlightStroke>book</HighlightStroke>{" "}
              more jobs.
            </h1>
            <Lede className="mt-6">
              Pick one of 24 designs, send us your content, your site is live in 24 hours. Subscription or one-time. Built for plumbers, painters, roofers, electricians — and anyone selling a service that needs the phone to ring.
            </Lede>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/portfolio" variant="primary" size="lg">
                See the 24 designs →
              </Button>
              <Button href="/pricing" variant="ghost" size="lg">
                Pricing
              </Button>
            </div>
            <p className="mt-7 max-w-md font-mono text-[12px] uppercase tracking-[0.12em] text-apx-mute">
              $499 setup + $199/mo · or $2,997 once · live in 24h
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <HeroFrame offset={10} className="w-full max-w-[560px]">
              <RotatingPreview slugs={PREVIEW_SLUGS} />
            </HeroFrame>
          </div>
        </div>
      </Container>
    </section>
  )
}
