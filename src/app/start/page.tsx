import type { Metadata } from "next"

import {
  Button,
  Container,
  Display,
  Eyebrow,
  Lede,
  Section,
  SiteFooter,
  SiteHeader,
} from "@/components/apex"
import { MobileStickyCTA, MobileStickySpacer } from "@/components/apex/mobile-sticky-cta"
import { TradePicker } from "@/components/apex/start/trade-picker"
import { FadeUp } from "@/components/apex/motion/fade-up"
import { RotatingPreview } from "@/components/apex/home/rotating-preview"
import { JsonLd } from "@/components/json-ld"
import { SITE_URL, organizationSchema } from "@/lib/seo"
import { featuredThemeSlugs } from "@/lib/themes"
import {
  FIRST_PERIOD_SAVINGS,
  MONTHLY_SAVINGS,
  ONE_TIME,
  PROMO_FIRST_PERIOD_TOTAL,
  PROMO_MONTHLY,
  PROMO_MONTHS,
  PROMO_DISCOUNT_ROWS_LABEL,
  PROMO_OFFER_DETAIL,
  PROMO_OFFER_HEADLINE,
  PROMO_SETUP,
  PROMO_SETUP_PRICE,
  PROMO_STANDARD_ROW_LABEL,
  PROMO_TRIAL_DAYS,
  PROMO_TRIAL_ROW_AMOUNT,
  PROMO_TRIAL_ROW_LABEL,
  SETUP_SAVINGS,
  STANDARD_FIRST_PERIOD_TOTAL,
  STANDARD_MONTHLY,
  STANDARD_SETUP,
} from "@/lib/pricing-constants"

const URL = `${SITE_URL}/start`

export const metadata: Metadata = {
  title: `Launch Special: ${PROMO_SETUP} to Start, ${PROMO_MONTHLY} for ${PROMO_MONTHS} Months`,
  description:
    `Launch promo: ${PROMO_SETUP} setup + ${PROMO_MONTHLY} for your first ${PROMO_MONTHS} months on Your Shopfront. After that, ${STANDARD_MONTHLY}. Cancel anytime. Site live in 24 hours.`,
  alternates: { canonical: URL },
  openGraph: {
    title: "Your Shopfront: Launch Special",
    description:
      `${PROMO_SETUP} setup + ${PROMO_MONTHLY} for the first ${PROMO_MONTHS} months. Pick from 30 designs. Site live in 24 hours.`,
    url: URL,
    type: "website",
    siteName: "Your Shopfront",
    images: [
      {
        url: "/og-v3.png",
        width: 1200,
        height: 630,
        alt: "Your Shopfront: Launch Special",
      },
    ],
  },
}

// This page is the shared promo landing for every trade (painters,
// electricians, roofers, ...). Attaching a single fixed theme (e.g. a
// plumbing brand) to the CTA mis-branded checkout for everyone outside that
// trade. /checkout requires a `demo` theme slug and already redirects to
// /portfolio when one isn't supplied, so send the primary CTA straight to
// the design picker instead of faking a demo.
const START_CTA_HREF = "/portfolio"

export default function StartPage() {
  return (
    <>
      <JsonLd data={[organizationSchema()]} />
      <SiteHeader variant="default" />
      <main id="main" className="flex-1 bg-apx-paper">
        <PromoHero />
        <PricingBreakdown />
        <ComparisonStrip />
        <WhatsIncluded />
        <DemoGallery />
        <PromoFaq />
        <FinalCta />
        <MobileStickySpacer />
      </main>
      <SiteFooter variant="default" />
      <MobileStickyCTA
        href="#pick"
        label={`Start my site for ${PROMO_SETUP} →`}
        subLabel="30-day money-back · cancel anytime"
      />
    </>
  )
}

function PromoHero() {
  return (
    // Tighter than the default py-24/32: this is the entry page for 14 of
    // the 18 real visitors on record, almost all of them on a phone, and the
    // default section padding pushed the offer and the CTA below the fold.
    <Section bg="paper" className="pt-10 pb-16 md:pt-16 md:pb-24">
      <Container>
        <FadeUp>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow tone="cobalt">Launch special</Eyebrow>
            <Display level="display-xl" className="mt-4">
              Your shopfront, live in 24 hours.{" "}
              <span className="text-apx-primary">{PROMO_OFFER_HEADLINE}</span>
            </Display>
            <Lede className="mt-5">{PROMO_OFFER_DETAIL}</Lede>
          </div>
          {/* Wider than the copy column above it: the tiles are screenshots
              of real sites, and at the 3xl prose measure they shrink to
              ~190px on desktop — too small to judge a design by, which is
              the only reason a prospect is on this page. */}
          <div id="pick" className="mx-auto mt-8 max-w-5xl scroll-mt-24">
            <TradePicker />
          </div>
          <div className="mx-auto max-w-3xl text-center">
            <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-apx-mute">
              ${PROMO_SETUP_PRICE} today · first month free · then {PROMO_MONTHLY} × {PROMO_MONTHS} · then {STANDARD_MONTHLY} · cancel anytime · 30-day money-back
            </p>
          </div>
        </FadeUp>
      </Container>
    </Section>
  )
}

function PricingBreakdown() {
  return (
    <Section bg="canvas">
      <Container>
        <FadeUp>
          <div className="mx-auto max-w-2xl">
            <Eyebrow>What you pay</Eyebrow>
            <Display level="display-xl" className="mt-4">
              No surprise charges. Here&apos;s the math.
            </Display>
          </div>
        </FadeUp>
        <FadeUp delay={120}>
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-apx-line bg-apx-paper p-8">
            <PriceRow
              label="Setup (one-time)"
              value={PROMO_SETUP}
              note={`Standard rate is ${STANDARD_SETUP}. Save ${SETUP_SAVINGS} today.`}
            />
            <Divider />
            <Divider />
            <PriceRow
              label={PROMO_TRIAL_ROW_LABEL}
              value={PROMO_TRIAL_ROW_AMOUNT}
              note={`Your subscription starts after a ${PROMO_TRIAL_DAYS}-day free trial. Nothing is charged until then.`}
            />
            <Divider />
            <PriceRow
              label={PROMO_DISCOUNT_ROWS_LABEL}
              value={PROMO_MONTHLY}
              note={`Standard rate is ${STANDARD_MONTHLY}. Save ${MONTHLY_SAVINGS}/mo for ${PROMO_MONTHS} months.`}
            />
            <Divider />
            <PriceRow
              label={PROMO_STANDARD_ROW_LABEL}
              value={STANDARD_MONTHLY}
              note="Standard subscription rate. Cancel any time."
            />
            <hr className="my-6 border-apx-line" />
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[14px] text-apx-mute">
                Total over the first {PROMO_MONTHS + 1} months
              </span>
              <strong className="font-mono text-[20px] text-apx-ink">
                ${PROMO_FIRST_PERIOD_TOTAL}
              </strong>
            </div>
            <p className="mt-2 text-[12px] text-apx-mute">
              vs. ${STANDARD_FIRST_PERIOD_TOTAL} at standard rates · you save $
              {FIRST_PERIOD_SAVINGS}, and only ${PROMO_SETUP_PRICE} of it is due today.
            </p>
          </div>
        </FadeUp>
      </Container>
    </Section>
  )
}

function ComparisonStrip() {
  return (
    <Section bg="tint">
      <Container>
        <FadeUp>
          <div className="mx-auto max-w-3xl">
            <Eyebrow>How we compare</Eyebrow>
            <Display level="display-xl" className="mt-4">
              You&apos;ve got options. Here&apos;s the honest breakdown.
            </Display>
          </div>
        </FadeUp>
        <FadeUp delay={100}>
          <div className="mx-auto mt-10 max-w-3xl grid gap-4 sm:grid-cols-3">
            <CompareCard
              label="Wix / Squarespace"
              cost="$23/mo + your weekend"
              note="You build it. You maintain it. You fix it when it breaks."
            />
            <CompareCard
              label="Local agency"
              cost="$5K–15K + 6 weeks"
              note="Bespoke design. Long timeline. Invoice before launch."
              muted
            />
            <CompareCard
              label="Your Shopfront"
              cost={`${PROMO_SETUP} + 30 minutes`}
              note="We build it. You launch tomorrow. Unlimited edits included."
              highlight
            />
          </div>
        </FadeUp>
      </Container>
    </Section>
  )
}

function CompareCard({
  label,
  cost,
  note,
  highlight,
  muted,
}: {
  label: string
  cost: string
  note: string
  highlight?: boolean
  muted?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        highlight
          ? "border-apx-primary bg-apx-paper"
          : muted
          ? "border-apx-line bg-apx-tint opacity-70"
          : "border-apx-line bg-apx-paper"
      }`}
    >
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-apx-mute">
        {label}
      </p>
      <p className={`mt-2 font-sans text-[20px] font-bold leading-tight ${highlight ? "text-apx-primary" : "text-apx-ink"}`}>
        {cost}
      </p>
      <p className="mt-2 text-[13px] leading-[1.5] text-apx-mute">{note}</p>
    </div>
  )
}

function WhatsIncluded() {
  return (
    <Section bg="paper">
      <Container>
        <FadeUp>
          <div className="max-w-2xl">
            <Eyebrow>What&apos;s included</Eyebrow>
            <Display level="display-xl" className="mt-4">
              Everything you need. Nothing you don&apos;t.
            </Display>
          </div>
        </FadeUp>
        <FadeUp delay={100}>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Feature
              title="30 production-grade designs"
              body="Pick one. Send your content. We build it. You don't pick a template; we build the whole site."
            />
            <Feature
              title="Live in 24 hours"
              body="Submit your worksheet today, your site is live by tomorrow morning."
            />
            <Feature
              title="Unlimited edits"
              body="Email any copy, color, photo, or layout change. We handle it same-day, every day."
            />
            <Feature
              title="Hosting + SSL + domain"
              body="Vercel + Cloudflare. Fast, secure, renewed for you. Use your own domain or one we register."
            />
            <Feature
              title="Mobile-perfect, SEO-ready"
              body="Every design is responsive, accessibility-checked, with structured data baked in."
            />
            <Feature
              title="No contracts"
              body="Cancel any time from your customer portal. Your site stays online 30 days as a grace period."
            />
          </ul>
        </FadeUp>
      </Container>
    </Section>
  )
}

function DemoGallery() {
  return (
    <Section bg="canvas" id="designs">
      <Container>
        <FadeUp>
          <div className="max-w-2xl">
            <Eyebrow>The 30 designs</Eyebrow>
            <Display level="display-xl" className="mt-4">
              Pick one. Send your content. We build it.
            </Display>
            <Lede className="mt-4">
              Designs work for every kind of small business: neighborhood
              barbers, yoga studios, law firms, contractors, growing
              trades.
            </Lede>
          </div>
        </FadeUp>
        <FadeUp delay={120}>
          <div className="mt-12 flex justify-center">
            <RotatingPreview slugs={featuredThemeSlugs.slice(0, 4)} />
          </div>
        </FadeUp>
        <FadeUp delay={200}>
          <div className="mt-8 text-center">
            <Button href="/portfolio" variant="ghost" size="md">
              Browse all 30 designs →
            </Button>
          </div>
        </FadeUp>
      </Container>
    </Section>
  )
}

function PromoFaq() {
  return (
    <Section bg="paper">
      <Container>
        <FadeUp>
          <div className="max-w-3xl">
            <Eyebrow>Quick questions</Eyebrow>
            <Display level="display-xl" className="mt-4">
              Things you&apos;d actually ask.
            </Display>
          </div>
        </FadeUp>
        <FadeUp delay={100}>
          <dl className="mt-10 max-w-3xl space-y-8">
            <FaqRow
              q="What happens after the first 3 months?"
              a={`Your monthly rate steps up to our standard ${STANDARD_MONTHLY}. You can cancel any time from your portal, or stay on for unlimited edits, hosting, and ongoing support.`}
            />
            <FaqRow
              q={`Is the ${PROMO_SETUP} setup refundable?`}
              a={`Yes. Before you submit your content worksheet. Once you submit and our team starts building, the setup fee covers that work and becomes non-refundable. Same rules as our standard ${STANDARD_SETUP} setup.`}
            />
            <FaqRow
              q={`Can I cancel during the ${PROMO_MONTHS}-month promo?`}
              a="Yes. Your first month is fully refundable within 30 days. After that, you can cancel any time. You just won't be charged again. Your site stays online for a 30-day grace period."
            />
            <FaqRow
              q="Do I own the site?"
              a={`On the subscription tier, you can export your content + design at any time. If you want full source-code ownership, our one-time build (${ONE_TIME}, separate offer) ships you the code on launch.`}
            />
            <FaqRow
              q="What if I don't see a design I like?"
              a="We have 30 designs, every one buyable under this promo. If none fits, email hello@yourshopfront.com. We add new themes regularly."
            />
            <FaqRow
              q="Why is this promo a thing?"
              a="We want the first 100 customers cheap so we can refine the build and gather case studies. Be one of them."
            />
          </dl>
        </FadeUp>
      </Container>
    </Section>
  )
}

function FinalCta() {
  return (
    <Section bg="primary-soft">
      <Container>
        <FadeUp>
          <div className="mx-auto max-w-2xl text-center">
            <Display level="display-xl">
              Your site can be live tomorrow.
            </Display>
            <Lede className="mt-6">
              {PROMO_SETUP} to start. Live by tomorrow morning. Cancel any time.
            </Lede>
            <div className="mt-8 flex flex-col items-center gap-3">
              <Button
                href={START_CTA_HREF}
                variant="primary"
                size="lg"
              >
                Start my site for {PROMO_SETUP} →
              </Button>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-apx-mute">
                30-day money-back · cancel anytime
              </p>
            </div>
          </div>
        </FadeUp>
      </Container>
    </Section>
  )
}

function PriceRow({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="font-semibold text-apx-ink">{label}</p>
        <p className="mt-1 text-[13px] text-apx-mute">{note}</p>
      </div>
      <p className="whitespace-nowrap font-mono text-[18px] font-semibold text-apx-ink">
        {value}
      </p>
    </div>
  )
}

function Divider() {
  return <hr className="border-apx-line" />
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <li className="rounded-2xl border border-apx-line bg-apx-paper p-6">
      <h3 className="font-sans text-[16px] font-semibold leading-[1.25] text-apx-ink">
        {title}
      </h3>
      <p className="mt-2 text-[14px] leading-[1.5] text-apx-mute">{body}</p>
    </li>
  )
}

function FaqRow({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <dt className="text-[17px] font-semibold text-apx-ink">{q}</dt>
      <dd className="mt-2 text-[15px] leading-[1.55] text-apx-mute">{a}</dd>
    </div>
  )
}
