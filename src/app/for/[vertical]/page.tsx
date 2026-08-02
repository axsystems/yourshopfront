import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Check } from "lucide-react"

import {
  Button,
  Container,
  Display,
  Eyebrow,
  Lede,
  PriceTag,
  Section,
  SiteFooter,
  SiteHeader,
} from "@/components/apex"
import { DemoCard } from "@/components/apex/demo-card"
import { FadeUp } from "@/components/apex/motion/fade-up"
import { JsonLd } from "@/components/json-ld"
import { SITE_NAME, SITE_URL, breadcrumbSchema, organizationSchema } from "@/lib/seo"
import { getTheme } from "@/lib/themes"
import { getVertical, verticals, type Vertical } from "@/lib/verticals"
import {
  PROMO_MONTHLY,
  PROMO_MONTHS,
  PROMO_PERIOD_LABEL,
  PROMO_SETUP,
  STANDARD_MONTHLY,
  STANDARD_MONTHLY_PRICE,
  STANDARD_SETUP,
} from "@/lib/pricing-constants"

interface PageProps {
  params: Promise<{ vertical: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return verticals.map((v) => ({ vertical: v.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { vertical: slug } = await params
  const v = getVertical(slug)
  if (!v) return {}
  const url = `${SITE_URL}/for/${v.slug}`
  const ogImage = `${SITE_URL}/api/og/${v.themeSlug}`

  return {
    title: v.metaTitle,
    description: v.metaDescription,
    alternates: { canonical: url },
    // openGraph/twitter titles aren't covered by the root layout's title
    // template, so the brand is appended here explicitly (once).
    openGraph: {
      title: `${v.metaTitle} — Your Shopfront`,
      description: v.metaDescription,
      url,
      type: "website",
      siteName: "Your Shopfront",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${v.name} website design — Your Shopfront` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${v.metaTitle} — Your Shopfront`,
      description: v.metaDescription,
      images: [ogImage],
    },
  }
}

export default async function VerticalPage({ params }: PageProps) {
  const { vertical: slug } = await params
  const v = getVertical(slug)
  if (!v) notFound()
  const theme = getTheme(v.themeSlug)
  if (!theme) notFound()

  const pageUrl = `${SITE_URL}/for/${v.slug}`
  const checkoutHref = `/checkout?tier=subscription&promo=launch&demo=${theme.slug}`

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: `Website design for ${v.nameLower}`,
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    areaServed: "United States",
    description: v.metaDescription,
    offers: {
      "@type": "Offer",
      price: String(STANDARD_MONTHLY_PRICE),
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: String(STANDARD_MONTHLY_PRICE),
        priceCurrency: "USD",
        billingDuration: "P1M",
      },
      description: v.metaDescription,
    },
  }

  return (
    <>
      <JsonLd
        data={[
          organizationSchema(),
          breadcrumbSchema([
            { name: "Home", url: SITE_URL },
            { name: "For", url: `${SITE_URL}/for` },
            { name: v.name, url: pageUrl },
          ]),
          serviceSchema,
        ]}
      />
      <SiteHeader variant="default" />
      <main id="main" className="flex-1 bg-apx-paper">
        <Hero vertical={v} checkoutHref={checkoutHref} />
        <DemoSection vertical={v} themeSlug={theme.slug} themeName={theme.name} />
        <NeedsSection vertical={v} />
        <IncludedSection vertical={v} />
        <HowItWorksSection vertical={v} />
        <PricingSection vertical={v} checkoutHref={checkoutHref} />
        <FaqSection vertical={v} />
        <FinalCta vertical={v} checkoutHref={checkoutHref} />
      </main>
      <SiteFooter variant="default" />
    </>
  )
}

function Breadcrumb({ vertical }: { vertical: Vertical }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-apx-mute"
    >
      <Link href="/" className="transition-colors hover:text-apx-ink">
        Home
      </Link>
      <span aria-hidden>/</span>
      <Link href="/for" className="transition-colors hover:text-apx-ink">
        For
      </Link>
      <span aria-hidden>/</span>
      <span className="text-apx-ink">{vertical.name}</span>
    </nav>
  )
}

function Hero({ vertical, checkoutHref }: { vertical: Vertical; checkoutHref: string }) {
  return (
    <Section bg="paper" className="pt-10 pb-16 md:pt-16 md:pb-20">
      <Container>
        <FadeUp>
          <Breadcrumb vertical={vertical} />
          <div className="max-w-3xl">
            <Eyebrow tone="cobalt">Websites for {vertical.plural}</Eyebrow>
            <Display as="h1" level="display-2xl" className="mt-4">
              Websites for {vertical.nameLower}.
            </Display>
            <Lede className="mt-5 max-w-2xl">{vertical.heroSub}</Lede>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button href={checkoutHref} variant="primary" size="lg">
                Start for {PROMO_SETUP} →
              </Button>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-apx-mute">
                {PROMO_PERIOD_LABEL}
              </p>
            </div>
          </div>
        </FadeUp>
      </Container>
    </Section>
  )
}

function DemoSection({
  vertical,
  themeSlug,
  themeName,
}: {
  vertical: Vertical
  themeSlug: string
  themeName: string
}) {
  return (
    <Section bg="canvas">
      <Container>
        <FadeUp>
          <div className="max-w-2xl">
            <Eyebrow>Live demo</Eyebrow>
            <Display level="display-lg" className="mt-4">
              {themeName}, one of our 30 designs.
            </Display>
            <Lede className="mt-4">
              {`${vertical.demoDescription.charAt(0).toUpperCase()}${vertical.demoDescription.slice(1)} A house-built design template — not a client's site.`}
            </Lede>
          </div>
        </FadeUp>
        <FadeUp delay={100}>
          <div className="mx-auto mt-10 max-w-xl">
            <DemoCard slug={themeSlug} eager />
          </div>
        </FadeUp>
      </Container>
    </Section>
  )
}

function NeedsSection({ vertical }: { vertical: Vertical }) {
  return (
    <Section bg="paper">
      <Container>
        <FadeUp>
          <div className="max-w-3xl">
            <Eyebrow>What {vertical.nameLower} actually need</Eyebrow>
            <Display level="display-lg" className="mt-4">
              This isn&apos;t a generic template with your name swapped in.
            </Display>
            <div className="mt-6 flex flex-col gap-5">
              {vertical.needs.map((paragraph, i) => (
                <p key={i} className="text-[16px] leading-[1.65] text-apx-mute md:text-[17px]">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </FadeUp>
      </Container>
    </Section>
  )
}

function IncludedSection({ vertical }: { vertical: Vertical }) {
  return (
    <Section bg="tint">
      <Container>
        <FadeUp>
          <div className="max-w-2xl">
            <Eyebrow>What&apos;s included</Eyebrow>
            <Display level="display-lg" className="mt-4">
              Built for how {vertical.plural} actually get hired.
            </Display>
          </div>
        </FadeUp>
        <FadeUp delay={100}>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {vertical.included.map((item) => (
              <li
                key={item.title}
                className="flex items-start gap-3 rounded-xl border border-apx-line bg-apx-paper p-5"
              >
                <span
                  aria-hidden
                  className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-apx-mint-soft text-apx-mint"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span>
                  <p className="font-sans text-[15px] font-semibold text-apx-ink">{item.title}</p>
                  <p className="mt-1.5 text-[14px] leading-[1.5] text-apx-mute">{item.body}</p>
                </span>
              </li>
            ))}
          </ul>
        </FadeUp>
      </Container>
    </Section>
  )
}

// OUR process, stated in our own voice.
//
// This section previously rendered the mapped theme's `content.howItWorks.steps`,
// which is the DEMO BUSINESS's copy — Angelo's "We've been taking orders since
// 1956", the florist's "Hudson Valley studio", the plumber's "1-year warranty".
// Rendered under "Pick the design. We build the site." those read as Your
// Shopfront's own first-person claims: a fabricated 70-year history and a
// warranty we don't offer, on a company with no customers. It also duplicated
// ~140 words verbatim from /portfolio/<slug>, diluting the uniqueness these
// pages exist to create. Never render demo-business copy as our own voice.
const PROCESS_STEPS = [
  {
    title: "Pick your design",
    body: "Choose the design shown on this page or any of the other 29. They're all the same price.",
  },
  {
    title: "Send us your content",
    body: "One worksheet: business name, services, hours, service area, and any photos you have. No photos yet is fine.",
  },
  {
    title: "We build it",
    body: "We put your content into the design, set up your domain, SSL, and hosting, and send you a preview link.",
  },
  {
    title: "Live in 24 hours",
    body: "Approve it and it goes live. On the subscription plan, edits after launch are unlimited.",
  },
] as const

function HowItWorksSection({ vertical }: { vertical: Vertical }) {
  return (
    <Section bg="paper">
      <Container>
        <FadeUp>
          <div className="max-w-2xl">
            <Eyebrow>How it works</Eyebrow>
            <Display level="display-lg" className="mt-4">
              Pick the design. We build the site.
            </Display>
            <Lede className="mt-4">{vertical.howItWorksIntro}</Lede>
          </div>
        </FadeUp>
        <FadeUp delay={100}>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step, i) => (
                <li key={step.title} className="rounded-xl border border-apx-line bg-apx-elev p-5">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-apx-primary">
                    Step {i + 1}
                  </span>
                  <p className="mt-2 font-sans text-[15px] font-semibold text-apx-ink">{step.title}</p>
                  <p className="mt-1.5 text-[14px] leading-[1.5] text-apx-mute">{step.body}</p>
                </li>
            ))}
          </ol>
        </FadeUp>
      </Container>
    </Section>
  )
}

function PricingSection({ vertical, checkoutHref }: { vertical: Vertical; checkoutHref: string }) {
  return (
    <Section bg="canvas">
      <Container>
        <FadeUp>
          <div className="mx-auto max-w-xl rounded-2xl border border-apx-line bg-apx-paper p-8 text-center md:p-10">
            <Eyebrow tone="cobalt">Launch promo</Eyebrow>
            <div className="mt-4 flex items-center justify-center">
              <PriceTag value={PROMO_SETUP} originalValue={STANDARD_SETUP} period="setup" large />
            </div>
            <p className="mt-3 text-[15px] text-apx-mute">
              First month free, then {PROMO_MONTHLY} for {PROMO_MONTHS} months, then {STANDARD_MONTHLY}. Cancel any
              time.
            </p>
            <ul className="mx-auto mt-6 flex max-w-sm flex-col gap-2.5 text-left text-[14px] text-apx-ink">
              <PriceFeature>Pick the design shown above, or any of our 30</PriceFeature>
              <PriceFeature>We swap in your content within 24 hours</PriceFeature>
              <PriceFeature>Hosting, SSL, backups, and unlimited edits included</PriceFeature>
              <PriceFeature>30-day money-back guarantee</PriceFeature>
            </ul>
            <div className="mt-7 flex flex-col items-center gap-3">
              <Button href={checkoutHref} variant="primary" size="lg" className="w-full">
                Start for {PROMO_SETUP} →
              </Button>
              <Link
                href="/pricing"
                className="text-[13px] font-semibold text-apx-mute underline underline-offset-2 hover:text-apx-ink"
              >
                See full pricing, incl. one-time build →
              </Link>
            </div>
          </div>
        </FadeUp>
      </Container>
    </Section>
  )
}

function PriceFeature({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <Check className="mt-0.5 h-4 w-4 flex-none text-apx-mint" strokeWidth={3} aria-hidden />
      <span>{children}</span>
    </li>
  )
}

function FaqSection({ vertical }: { vertical: Vertical }) {
  return (
    <Section bg="paper">
      <Container>
        <FadeUp>
          <div className="max-w-2xl">
            <Eyebrow>FAQ</Eyebrow>
            <Display level="display-lg" className="mt-4">
              Questions {vertical.nameLower} actually ask.
            </Display>
          </div>
        </FadeUp>
        <dl className="mt-10 flex max-w-3xl flex-col gap-7">
          {vertical.faq.map((item, i) => (
            <FadeUp key={item.q} delay={i * 60}>
              <div className="border-b border-apx-line pb-7">
                <dt className="font-sans text-[17px] font-bold text-apx-ink">{item.q}</dt>
                <dd className="mt-2 text-[15px] leading-[1.55] text-apx-mute">{item.a}</dd>
              </div>
            </FadeUp>
          ))}
        </dl>
      </Container>
    </Section>
  )
}

function FinalCta({ vertical, checkoutHref }: { vertical: Vertical; checkoutHref: string }) {
  return (
    <Section bg="primary-soft">
      <Container>
        <FadeUp>
          <div className="mx-auto max-w-2xl text-center">
            <Display level="display-xl">Your {vertical.singular} site can be live tomorrow.</Display>
            <Lede className="mx-auto mt-5">
              {PROMO_SETUP} to start. We build it around the design shown above — or any of our 30. Live
              by tomorrow morning.
            </Lede>
            <div className="mt-8 flex flex-col items-center gap-3">
              <Button href={checkoutHref} variant="primary" size="lg">
                Start for {PROMO_SETUP} →
              </Button>
              <div className="flex flex-wrap justify-center gap-4 text-[13px] font-semibold text-apx-mute">
                <Link href="/for" className="underline underline-offset-2 hover:text-apx-ink">
                  ← All business types
                </Link>
                <Link href="/portfolio" className="underline underline-offset-2 hover:text-apx-ink">
                  Browse all 30 designs →
                </Link>
              </div>
            </div>
          </div>
        </FadeUp>
      </Container>
    </Section>
  )
}
