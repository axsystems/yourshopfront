import * as React from "react"

import { Button, Container, Display, Eyebrow, Lede, Section } from "@/components/apex"
import { FadeUp } from "@/components/apex/motion/fade-up"

const AXON_GROWTH_URL = "https://axongrowth.ai/?ref=apexsites"

const PILLARS: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: "Google Ads on autopilot",
    body: "Daily bid + keyword optimization across Local Services, Search, and Performance Max — without the agency markup.",
  },
  {
    title: "Local SEO that ranks",
    body: "GBP optimization, citations, review velocity, and on-site schema wired into the site we just built for you.",
  },
  {
    title: "Lead → call attribution",
    body: "Every lead routed, scored, and tied back to the channel that delivered it. So you keep what works and cut what doesn't.",
  },
] as const

export function HomePartnerAxonGrowth() {
  return (
    <Section bg="canvas" aria-labelledby="partner-heading">
      <Container>
        <FadeUp>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow tone="cobalt">Partner — Marketing</Eyebrow>
            <Display id="partner-heading" level="display-xl" className="mt-5">
              We build the site. <span className="text-apx-primary">Axon Growth</span> fills it with leads.
            </Display>
            <Lede className="mx-auto mt-5">
              A great site is the deliverable, not the destination. Our sister company runs Google Ads, Local SEO, and lead attribution for trades — so the phone actually rings the day after launch.
            </Lede>
          </div>
        </FadeUp>

        <FadeUp delay={120}>
          <ul className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
            {PILLARS.map((pillar) => (
              <li
                key={pillar.title}
                className="rounded-2xl border border-apx-border bg-apx-paper p-6 text-left"
              >
                <h3 className="font-sans text-[18px] font-semibold leading-[1.2] tracking-[-0.01em] text-apx-ink">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.55] text-apx-mute">
                  {pillar.body}
                </p>
              </li>
            ))}
          </ul>
        </FadeUp>

        <FadeUp delay={200}>
          <div className="mt-10 flex flex-col items-center gap-3">
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                href={AXON_GROWTH_URL}
                variant="primary"
                size="lg"
                target="_blank"
                rel="noopener"
              >
                See Axon Growth →
              </Button>
              <Button href="/contact?ref=axongrowth" variant="ghost" size="lg">
                Bundle it with my site
              </Button>
            </div>
            <p className="text-[13px] text-apx-mute">
              Sold separately. Apex Sites customers get priority onboarding.
            </p>
          </div>
        </FadeUp>
      </Container>
    </Section>
  )
}
