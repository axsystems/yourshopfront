import type { Metadata } from "next"
import { Check, Minus } from "lucide-react"

import {
  Button,
  Card,
  Container,
  Display,
  Eyebrow,
  Lede,
  PriceTag,
  Section,
  SiteFooter,
  SiteHeader,
} from "@/components/apex"
import { FadeUp } from "@/components/apex/motion/fade-up"
import { OpenChatButton } from "@/components/apex/open-chat-button"
import { JsonLd } from "@/components/json-ld"
import { SITE_URL, organizationSchema, serviceSchema } from "@/lib/seo"
import { cn } from "@/lib/utils"

const PRICING_URL = `${SITE_URL}/pricing`

export const metadata: Metadata = {
  title: "Pricing — Subscription or one-time",
  description:
    "Two ways to buy Your Shopfront: $299 setup + $149/mo subscription with unlimited edits, or $997 one-time build with full source code. 30-day money-back guarantee.",
  alternates: { canonical: PRICING_URL },
  openGraph: {
    title: "Pricing — Your Shopfront",
    description: "Subscription ($299 + $149/mo) or one-time ($997). Pick what fits.",
    url: PRICING_URL,
    type: "website",
    siteName: "Your Shopfront",
  },
}

interface ComparisonRow {
  label: string
  subscription: string | true
  onetime: string | true
}

const COMPARISON: ComparisonRow[] = [
  { label: "Setup fee", subscription: "$299", onetime: "Included" },
  { label: "Recurring", subscription: "$149/mo", onetime: "$0 (or +$49/mo hosting)" },
  { label: "Hosting included", subscription: true, onetime: "Optional" },
  { label: "Unlimited edits", subscription: true, onetime: "30 days, then read-only" },
  { label: "Source code delivered", subscription: "On request", onetime: true },
  { label: "Cancel anytime", subscription: true, onetime: "n/a — paid once" },
  { label: "30-day money-back", subscription: true, onetime: true },
  { label: "GBP profile management", subscription: true, onetime: "Add-on" },
]

const FAQ = [
  {
    q: "Subscription or one-time — how do I decide?",
    a: "Subscription if you want unlimited edits and don't want to manage hosting. One-time if you want to own the source code outright. Most small businesses go subscription because their site changes regularly — offers, photos, holiday hours, new services.",
  },
  {
    q: "Can I switch from subscription to one-time later?",
    a: "Yes — your $299 setup credits toward a one-time license at any point in the first year. After that, switching costs the full $997 one-time price.",
  },
  {
    q: "What does the $49/mo hosting addon include?",
    a: "Vercel + Cloudflare hosting, SSL renewal, weekly backups, security patches, uptime monitoring, unlimited small edits, a monthly SEO check, and a Slack channel for issues — same as what we run for subscription customers.",
  },
  {
    q: "Where do I see the designs?",
    a: "Our portfolio shows all 30 designs across 3 design rounds. Every one is buyable under either tier — the 10 featured on the homepage are our front-of-store picks; the other 20 are equally available, just one click deeper.",
  },
  {
    q: "What if none of the 30 designs fits my business?",
    a: "Send us a note via contact and we'll suggest the closest fit, or queue your industry for a future design round. We add new themes regularly.",
  },
]

export default function PricingPage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), serviceSchema()]} />
      <SiteHeader variant="default" />
      <main id="main" className="flex-1 bg-apx-paper">
        <Section bg="canvas" className="py-20 md:py-28">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <Eyebrow>Pricing</Eyebrow>
              <Display level="display-2xl" as="h1" className="mt-4">
                Two ways to buy. Pick the one that fits.
              </Display>
              <Lede className="mx-auto mt-6">
                Designed to capture inquiries from day one — lead form, click-to-call, and Google Business hooks built in.
              </Lede>
            </div>
          </Container>
        </Section>

        <Section bg="paper">
          <Container>
            <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
              <FadeUp>
                <TierCard
                  recommended
                  tagline="Most popular · Cancel anytime"
                  title="Subscription"
                  price="$299"
                  period="setup, then $149/mo"
                  sub="We host it. Unlimited edits."
                  features={[
                    "Pick from any of our 30 theme designs",
                    "We swap in your content within 24 hours",
                    "Unlimited edits, forever",
                    "We host it (fast Vercel + Cloudflare)",
                    "SSL, backups, security updates",
                    "Google Business profile management",
                    "Cancel anytime — site stays online for 30 days",
                  ]}
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
                  features={[
                    "Pick from any of our 30 theme designs",
                    "We swap in your content within 24 hours",
                    "30 days of free edits after launch",
                    "Full source code handed over",
                    "Self-host on your own Vercel / Netlify",
                    "Optional hosting & maintenance: +$49/mo (unlimited small edits + monthly SEO check)",
                  ]}
                  ctaLabel="Buy one-time →"
                  ctaHref="/checkout?tier=onetime"
                />
              </FadeUp>
            </div>
          </Container>
        </Section>

        {/* Desktop-only comparison table */}
        <Section bg="tint" className="hidden md:block">
          <Container>
            <FadeUp>
              <div className="mx-auto max-w-4xl">
                <Eyebrow>Side-by-side</Eyebrow>
                <Display level="display-lg" className="mt-4">
                  How they compare.
                </Display>
                <div className="mt-8 overflow-hidden rounded-2xl border border-apx-line bg-apx-paper">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-apx-line bg-apx-canvas">
                        <th className="px-6 py-4 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-apx-mute">
                          Feature
                        </th>
                        <th className="px-6 py-4 text-left font-sans text-[15px] font-bold text-apx-ink">
                          Subscription
                        </th>
                        <th className="px-6 py-4 text-left font-sans text-[15px] font-bold text-apx-ink">
                          One-time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARISON.map((row, i) => (
                        <tr
                          key={row.label}
                          className={i % 2 === 0 ? "bg-apx-paper" : "bg-apx-tint"}
                        >
                          <td className="px-6 py-3 font-sans text-[14px] font-medium text-apx-ink">
                            {row.label}
                          </td>
                          <td className="px-6 py-3 font-sans text-[14px] text-apx-mute">
                            <ComparisonValue value={row.subscription} />
                          </td>
                          <td className="px-6 py-3 font-sans text-[14px] text-apx-mute">
                            <ComparisonValue value={row.onetime} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeUp>
          </Container>
        </Section>

        <Section bg="paper">
          <Container>
            <div className="mx-auto max-w-3xl">
              <FadeUp>
                <Eyebrow>FAQ</Eyebrow>
                <Display level="display-lg" className="mt-4">
                  Common questions.
                </Display>
              </FadeUp>
              <dl className="mt-10 flex flex-col gap-7">
                {FAQ.map((item, i) => (
                  <FadeUp key={item.q} delay={i * 60}>
                    <div className="border-b border-apx-line pb-7">
                      <dt className="font-sans text-[18px] font-bold text-apx-ink">
                        {item.q}
                      </dt>
                      <dd className="mt-2 text-[16px] leading-[1.55] text-apx-mute">
                        {item.a}
                      </dd>
                    </div>
                  </FadeUp>
                ))}
              </dl>
            </div>
          </Container>
        </Section>

        <Section bg="primary-soft">
          <Container>
            <FadeUp>
              <div className="mx-auto max-w-3xl text-center">
                <Display level="display-xl">
                  Ready to pick a design?
                </Display>
                <Lede className="mx-auto mt-5">
                  Browse the 30, find one that fits your trade, and we&apos;ll launch your site in 24 hours.
                </Lede>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <Button href="/portfolio" variant="primary" size="lg">
                    Browse the 30 designs →
                  </Button>
                  <OpenChatButton variant="secondary" size="lg">
                    Ask the concierge
                  </OpenChatButton>
                </div>
              </div>
            </FadeUp>
          </Container>
        </Section>
      </main>
      <SiteFooter variant="default" />
    </>
  )
}

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
        <h2 className="mt-3 font-sans text-[28px] font-bold tracking-[-0.015em] text-apx-ink">
          {title}
        </h2>
        <div className="mt-4 flex items-baseline gap-3">
          <PriceTag value={price} period={period} large />
        </div>
        <p className="mt-2 text-[14px] text-apx-mute">{sub}</p>
      </div>
      <ul className="flex flex-col gap-3 border-t border-apx-line pt-5">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-3 text-[15px] leading-snug text-apx-ink"
          >
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
      <Button
        href={ctaHref}
        variant={recommended ? "primary" : "secondary"}
        size="lg"
        className="w-full"
      >
        {ctaLabel}
      </Button>
      <p className="text-center font-mono text-[10px] uppercase tracking-[0.12em] text-apx-mute">
        30-day money-back · cancel anytime
      </p>
    </Card>
  )
}

function ComparisonValue({ value }: { value: string | true }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1.5 text-apx-mint">
        <Check className="h-4 w-4" strokeWidth={3} />
        <span className="text-apx-ink">Included</span>
      </span>
    )
  }
  if (value.startsWith("n/a")) {
    return (
      <span className="inline-flex items-center gap-1.5 text-apx-soft">
        <Minus className="h-4 w-4" />
        <span>{value}</span>
      </span>
    )
  }
  return <span className="text-apx-ink">{value}</span>
}
