import * as React from "react"
import { Check } from "lucide-react"

import { Button, Card, Container, Display, Eyebrow, Lede, PriceTag, Section } from "@/components/apex"
import { FadeUp } from "@/components/apex/motion/fade-up"
import { cn } from "@/lib/utils"

interface TierCardProps {
  recommended?: boolean
  tagline: string
  title: string
  price: string
  period: string
  sub: string
  features: string[]
  ctaLabel: string
  ctaHref: string
}

const SUB_FEATURES = [
  "Pick from any of our 30 designs",
  "Live within 24 hours of content receipt",
  "Unlimited edits, forever",
  "We host it (Vercel + Cloudflare)",
  "Cancel anytime — site stays online for 30 days",
]

const ONE_FEATURES = [
  "Pick from any of our 30 designs",
  "Live within 24 hours of content receipt",
  "30 days of free edits after launch",
  "Full source code handed over",
  "Optional hosting & maintenance: +$49/mo (unlimited small edits + monthly SEO check)",
]

export function HomePricingTeaser() {
  return (
    <Section bg="tint">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Pricing</Eyebrow>
          <Display level="display-xl" className="mt-5">
            Two ways to buy. Pick the one that fits.
          </Display>
          <Lede className="mx-auto mt-5">
            A single new customer often pays for a full year of subscription. Built to capture inquiries from day one.
          </Lede>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-2">
          <FadeUp>
            <TierCard
              recommended
              tagline="Most popular · Cancel anytime"
              title="Subscription"
              price="$299"
              period="setup, then $149/mo"
              sub="We host it. Unlimited edits."
              features={SUB_FEATURES}
              ctaLabel="Start subscription →"
              ctaHref="/checkout?tier=subscription"
            />
          </FadeUp>
          <FadeUp delay={80}>
            <TierCard
              tagline="Yours forever · No recurring"
              title="One-time build"
              price="$997"
              period="once"
              sub="Full source code. Self-host or +$49/mo."
              features={ONE_FEATURES}
              ctaLabel="Buy one-time →"
              ctaHref="/checkout?tier=onetime"
            />
          </FadeUp>
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-[14px] text-apx-mute">
          30-day money-back guarantee on every plan.{" "}
          <a href="/pricing" className="font-semibold text-apx-ink underline-offset-4 hover:underline">
            See full pricing →
          </a>
        </p>
      </Container>
    </Section>
  )
}

function TierCard({
  recommended,
  tagline,
  title,
  price,
  period,
  sub,
  features,
  ctaLabel,
  ctaHref,
}: TierCardProps) {
  return (
    <Card
      className={cn(
        "relative flex flex-col gap-6 p-8 md:p-10",
        recommended ? "border-2 border-apx-primary" : ""
      )}
    >
      {recommended ? (
        <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-apx-primary px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-apx-primary-fg">
          Recommended
        </span>
      ) : null}
      <div>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-apx-mute">
          {tagline}
        </p>
        <h3 className="mt-3 font-sans text-[28px] font-bold tracking-[-0.015em] text-apx-ink">
          {title}
        </h3>
        <div className="mt-4 flex items-baseline gap-3">
          <PriceTag value={price} period={period} large />
        </div>
        <p className="mt-2 text-[14px] text-apx-mute">{sub}</p>
      </div>
      <ul className="flex flex-col gap-3 border-t border-apx-line pt-5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-[15px] leading-snug text-apx-ink">
            <span
              aria-hidden
              className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-apx-mint-soft text-apx-mint"
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button href={ctaHref} variant={recommended ? "primary" : "secondary"} size="lg" className="w-full">
        {ctaLabel}
      </Button>
    </Card>
  )
}
