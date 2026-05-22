import * as React from "react"

import { Container, Display, Eyebrow, Lede, Section } from "@/components/apex"
import { FadeUp } from "@/components/apex/motion/fade-up"

interface Step {
  n: string
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    n: "01",
    title: "Pick a style",
    body: "Browse the 30 designs in the portfolio. Click the one that fits your business — every detail re-skins to that style instantly.",
  },
  {
    n: "02",
    title: "Send your content",
    body: "Logo, photos, copy, services, contact info, hours. We provide a fillable worksheet that takes about 30 minutes to complete.",
  },
  {
    n: "03",
    title: "We swap it in",
    body: "Within 24 hours of receipt, we rebuild your site in your chosen style with your content. No agency timelines, no design-by-committee delay.",
  },
  {
    n: "04",
    title: "Review and launch",
    body: "You approve via a private staging URL. We launch on your domain (or our subdomain while DNS propagates). Done.",
  },
]

export function HomeHowItWorks() {
  return (
    <Section bg="paper">
      <Container>
        <div className="max-w-[760px]">
          <Eyebrow>How it works</Eyebrow>
          <Display level="display-xl" className="mt-5">
            Four steps, your site live by the end of the week.
          </Display>
          <Lede className="mt-5">
            We don&apos;t disappear into a six-week design process. You see progress every day, and most sites launch in under a week from the day you sign up.
          </Lede>
        </div>
        <div className="relative mt-14 grid gap-x-10 gap-y-8 md:grid-cols-12 md:gap-y-16">
          {STEPS.map((step, i) => {
            const colSpan = i % 2 === 0 ? "md:col-span-7" : "md:col-span-5 md:col-start-8"
            return (
              <FadeUp key={step.n} delay={i * 80} className={colSpan}>
                <article className="flex gap-5 md:gap-7">
                  <p
                    aria-hidden
                    className="flex-none font-mono text-[40px] font-bold leading-none tracking-tight text-apx-primary md:text-[56px]"
                  >
                    {step.n}
                  </p>
                  <div>
                    <h3 className="font-sans text-[22px] font-bold leading-[1.1] tracking-[-0.01em] text-apx-ink md:text-[28px]">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-[420px] text-[15px] leading-[1.55] text-apx-mute md:text-[16px]">
                      {step.body}
                    </p>
                  </div>
                </article>
              </FadeUp>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
