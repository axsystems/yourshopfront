import type { Theme } from "@/lib/themes/types"
import { ApexButton, Container, Display, Eyebrow, Section } from "./primitives"

interface PricingProps {
  theme: Theme
  demoSlug?: string
}

const SUB_FEATURES = [
  "Pick from any of our 10 theme options",
  "We swap in your content within 24 hours",
  "Unlimited edits, forever",
  "We host it (fast Vercel + Cloudflare)",
  "SSL, backups, security updates",
  "Google Business profile management",
  "Cancel anytime — site stays online for 30 days",
]

const ONETIME_FEATURES = [
  "Pick from any of our 10 theme options",
  "We swap in your content within 24 hours",
  "30 days of free edits after launch",
  "Full source code handed over",
  "Self-host on your own Vercel / Netlify",
  "Optional hosting & maintenance: +$29/mo",
]

const CUSTOM_FEATURES = [
  "Unique design — not a theme variant",
  "Copywriting consultation included",
  "3 design rounds, unlimited copy revisions",
  "Custom integrations (booking, CRM, payment)",
  "Full source code handed over",
  "Optional hosting & maintenance: +$199/mo",
  "Inspired by any piece in our 24-design portfolio",
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
            Three ways to buy.{" "}
            <span style={{ color: "var(--apex-primary)" }}>Pick the one that fits.</span>
          </Display>
          <p
            className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            The average home-service customer is worth $400–800. Apex Sites pays for itself the
            first time it books you a job you wouldn&apos;t have gotten otherwise.
          </p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <PriceCard
            theme={theme}
            variant="featured"
            tagline="MOST POPULAR · CANCEL ANYTIME"
            title="Subscription"
            price="$499"
            priceDetail="setup"
            recurring="+ $199/mo"
            sub="We host it. Unlimited edits."
            features={SUB_FEATURES}
            ctaLabel="Start subscription →"
            ctaHref={subHref}
          />
          <PriceCard
            theme={theme}
            variant="default"
            tagline="YOURS FOREVER · NO RECURRING"
            title="One-time build"
            price="$2,997"
            priceDetail="once"
            sub="Full source code. Self-host or +$29/mo."
            features={ONETIME_FEATURES}
            ctaLabel="Buy one-time →"
            ctaHref={oneHref}
          />
          <PriceCard
            theme={theme}
            variant="custom"
            tagline="FOR BUSINESSES OUTSIDE OUR CATEGORIES"
            title="Fully Custom"
            price="$4,997+"
            priceDetail="starting"
            sub="Designed from scratch. Built for you."
            features={CUSTOM_FEATURES}
            ctaLabel="Talk to us →"
            ctaHref="/contact?ref=custom-tier"
          />
        </div>
        <p
          className="mx-auto mt-8 max-w-2xl text-center text-sm"
          style={{ color: "var(--apex-muted-fg)" }}
        >
          Most clients see their first booking from the new site within 7 days of launch.
          30-day money-back guarantee on every plan.
        </p>
      </Container>
    </Section>
  )
}

interface PriceCardProps {
  theme: Theme
  variant: "featured" | "default" | "custom"
  tagline: string
  title: string
  price: string
  priceDetail: string
  recurring?: string
  sub: string
  features: string[]
  ctaLabel: string
  ctaHref: string
}

function PriceCard(props: PriceCardProps) {
  const { theme, variant, tagline, title, price, priceDetail, recurring, sub, features, ctaLabel, ctaHref } = props
  const featured = variant === "featured"
  const custom = variant === "custom"
  return (
    <div
      className="relative flex flex-col p-8 sm:p-10"
      style={{
        background: featured
          ? "var(--apex-fg)"
          : custom
            ? "color-mix(in oklab, var(--apex-accent) 18%, var(--apex-surface))"
            : "var(--apex-surface)",
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
          background: featured
            ? "var(--apex-primary)"
            : custom
              ? "var(--apex-accent)"
              : "var(--apex-muted)",
          color: featured
            ? "var(--apex-primary-fg)"
            : custom
              ? "var(--apex-accent-fg)"
              : "var(--apex-fg)",
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
      <div className="mt-4 flex items-baseline gap-2">
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
                background: featured
                  ? "var(--apex-primary)"
                  : custom
                    ? "var(--apex-accent)"
                    : "var(--apex-accent)",
                color: featured
                  ? "var(--apex-primary-fg)"
                  : custom
                    ? "var(--apex-accent-fg)"
                    : "var(--apex-accent-fg)",
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
          variant={featured ? "primary" : custom ? "accent" : "outline"}
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
