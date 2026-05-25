import type { Theme } from "@/lib/themes/types"
import { FadeUp } from "@/components/apex/motion/fade-up"
import { ApexButton, Container, Display, Eyebrow, Section } from "./primitives"

interface PricingProps {
  theme: Theme
  demoSlug?: string
}

const SUB_FEATURES = [
  "Pick from any of our 30 theme designs",
  "We swap in your content within 24 hours",
  "Unlimited edits, forever",
  "We host it (fast Vercel + Cloudflare)",
  "SSL, backups, security updates",
  "Cancel anytime — site stays online for 30 days",
]

const ONETIME_FEATURES = [
  "Pick from any of our 30 theme designs",
  "We swap in your content within 24 hours",
  "30 days of free edits after launch",
  "Full source code handed over",
  "Self-host on your own Vercel / Netlify",
  "Optional hosting & maintenance: +$49/mo (unlimited small edits + monthly SEO check)",
]

export function Pricing({ theme, demoSlug }: PricingProps) {
  void theme
  const subHref = demoSlug
    ? `/checkout?tier=subscription&demo=${demoSlug}`
    : "/checkout?tier=subscription"
  const oneHref = demoSlug
    ? `/checkout?tier=onetime&demo=${demoSlug}`
    : "/checkout?tier=onetime"
  return (
    <Section surface>
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Pricing</Eyebrow>
          <Display as="h2" className="mt-5 text-4xl sm:text-5xl">
            Two ways to buy.{" "}
            <span style={{ color: "var(--apex-primary)" }}>Pick the one that fits.</span>
          </Display>
          <p
            className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            A single new customer often pays for a full year of subscription. Built to capture inquiries from day one.
          </p>
        </div>
        <div className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-2">
          <FadeUp delay={50}>
            <PriceCard
              theme={theme}
              variant="featured"
              tagline="LAUNCH PROMO · CANCEL ANYTIME"
              title="Subscription"
              price="$99"
              originalPrice="$299"
              priceDetail="setup"
              recurring="+ $99/mo"
              originalRecurring="$149/mo"
              sub="$99/mo for 3 months, then $149/mo standard · cancel anytime."
              features={SUB_FEATURES}
              ctaLabel="Start subscription →"
              ctaHref={subHref}
            />
          </FadeUp>
          <FadeUp delay={150}>
            <PriceCard
              theme={theme}
              variant="default"
              tagline="YOURS FOREVER · NO RECURRING"
              title="One-time build"
              price="$997"
              priceDetail="once"
              sub="Full source code. Self-host or +$49/mo."
              features={ONETIME_FEATURES}
              ctaLabel="Buy one-time →"
              ctaHref={oneHref}
            />
          </FadeUp>
        </div>
        <p
          className="mx-auto mt-8 max-w-2xl text-center text-sm"
          style={{ color: "var(--apex-muted-fg)" }}
        >
          30-day money-back guarantee on every plan.
        </p>
      </Container>
    </Section>
  )
}

interface PriceCardProps {
  theme: Theme
  variant: "featured" | "default"
  tagline: string
  title: string
  price: string
  /** Pre-sale price — renders strikethrough above the sale price. */
  originalPrice?: string
  priceDetail: string
  recurring?: string
  /** Pre-sale recurring — strikethrough next to the discounted recurring. */
  originalRecurring?: string
  sub: string
  features: string[]
  ctaLabel: string
  ctaHref: string
}

function PriceCard(props: PriceCardProps) {
  const { theme, variant, tagline, title, price, originalPrice, priceDetail, recurring, originalRecurring, sub, features, ctaLabel, ctaHref } = props
  const featured = variant === "featured"
  return (
    <div
      className="relative flex flex-col p-8 sm:p-10"
      style={{
        background: featured ? "var(--apex-fg)" : "var(--apex-surface)",
        color: featured ? "var(--apex-bg)" : "var(--apex-surface-fg)",
        border: featured ? "none" : "1px solid var(--apex-border)",
        borderRadius: "var(--apex-radius-lg)",
        boxShadow: featured
          ? "0 30px 60px -24px color-mix(in oklab, var(--apex-fg) 35%, transparent)"
          : undefined,
      }}
    >
      <span
        className="self-start px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
        style={{
          background: featured ? "var(--apex-primary)" : "var(--apex-muted)",
          color: featured ? "var(--apex-primary-fg)" : "var(--apex-fg)",
          borderRadius: "var(--apex-radius-pill)",
        }}
      >
        {tagline}
      </span>
      <h3
        className="mt-5 text-3xl"
        style={{
          fontFamily: "var(--apex-font-display)",
          fontWeight: 700,
          letterSpacing: "-0.015em",
        }}
      >
        {title}
      </h3>
      <div className="mt-4 flex flex-wrap items-baseline gap-2">
        {originalPrice && (
          <p
            className="text-2xl line-through"
            style={{
              fontFamily: "var(--apex-font-display)",
              fontWeight: 600,
              opacity: 0.55,
            }}
          >
            {originalPrice}
          </p>
        )}
        <p
          className="text-5xl"
          style={{
            fontFamily: "var(--apex-font-display)",
            fontWeight: 800,
            letterSpacing: "-0.025em",
          }}
        >
          {price}
        </p>
        <p className="text-sm" style={{ opacity: 0.7 }}>
          {priceDetail}
        </p>
        {recurring && (
          <p
            className="ml-2 text-base"
            style={{
              fontFamily: "var(--apex-font-display)",
              color: featured ? "var(--apex-primary)" : "var(--apex-fg)",
              fontWeight: 600,
            }}
          >
            {originalRecurring && (
              <span className="mr-1.5 line-through" style={{ opacity: 0.55, fontWeight: 500 }}>
                {originalRecurring}
              </span>
            )}
            {recurring}
          </p>
        )}
      </div>
      <p className="mt-2 text-sm" style={{ opacity: 0.75 }}>
        {sub}
      </p>
      <ul className="mt-7 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-[15px] leading-snug">
            <span
              className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center text-[11px] font-bold"
              style={{
                background: featured ? "var(--apex-primary)" : "var(--apex-accent)",
                color: featured ? "var(--apex-primary-fg)" : "var(--apex-accent-fg)",
                borderRadius: "var(--apex-radius-pill)",
              }}
            >
              ✓
            </span>
            <span style={{ opacity: 0.92 }}>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <ApexButton
          theme={theme}
          variant={featured ? "primary" : "outline"}
          size="lg"
          asChildHref={ctaHref}
          className="w-full"
        >
          {ctaLabel}
        </ApexButton>
      </div>
    </div>
  )
}
