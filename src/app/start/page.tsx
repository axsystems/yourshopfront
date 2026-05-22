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
import { FadeUp } from "@/components/apex/motion/fade-up"
import { RotatingPreview } from "@/components/apex/home/rotating-preview"
import { JsonLd } from "@/components/json-ld"
import { SITE_URL, organizationSchema } from "@/lib/seo"
import { featuredThemeSlugs } from "@/lib/themes"

const URL = `${SITE_URL}/start`

export const metadata: Metadata = {
  title: "Launch Special — $99 to Start, $99/mo for 3 Months",
  description:
    "Launch promo: $99 setup + $99/mo for your first 3 months on Your Shopfront. After that, $149/mo. Cancel anytime. Site live in 24 hours.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Your Shopfront — Launch Special",
    description:
      "$99 setup + $99/mo for the first 3 months. Pick from 30 designs. Site live in 24 hours.",
    url: URL,
    type: "website",
    siteName: "Your Shopfront",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Your Shopfront — Launch Special",
      },
    ],
  },
}

const PROMO_CHECKOUT_HREF = "/checkout?tier=subscription&promo=launch&demo=premium-trade"

export default function StartPage() {
  return (
    <>
      <JsonLd data={[organizationSchema()]} />
      <SiteHeader variant="default" />
      <main id="main" className="flex-1 bg-apx-paper">
        <PromoHero />
        <PricingBreakdown />
        <WhatsIncluded />
        <DemoGallery />
        <PromoFaq />
        <FinalCta />
      </main>
      <SiteFooter variant="default" />
    </>
  )
}

function PromoHero() {
  return (
    <Section bg="paper">
      <Container>
        <FadeUp>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow tone="cobalt">Launch special</Eyebrow>
            <Display level="display-xl" className="mt-5">
              Your shopfront, live in 24 hours —{" "}
              <span className="text-apx-primary">starting at $99</span>.
            </Display>
            <Lede className="mt-6">
              For your first 3 months, pay $99 setup and $99/month. After
              that, you&apos;re on our standard $149/month plan. Cancel any
              time, no contract.
            </Lede>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                href={PROMO_CHECKOUT_HREF}
                variant="primary"
                size="lg"
              >
                Get started for $99 →
              </Button>
              <Button href="/portfolio" variant="ghost" size="lg">
                Browse the 30 designs
              </Button>
            </div>
            <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-apx-mute">
              $99 setup + $99/mo × 3 months · then $149/mo · cancel anytime
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
              value="$99"
              note="Standard rate is $299 — save $200 today"
            />
            <Divider />
            <PriceRow
              label="Months 1, 2, 3"
              value="$99/mo"
              note="Standard rate is $149/mo — save $50/mo for 3 months"
            />
            <Divider />
            <PriceRow
              label="Month 4 onward"
              value="$149/mo"
              note="Standard subscription rate — cancel any time"
            />
            <hr className="my-6 border-apx-line" />
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[14px] text-apx-mute">
                First-3-months total
              </span>
              <strong className="font-mono text-[20px] text-apx-ink">
                $396
              </strong>
            </div>
            <p className="mt-2 text-[12px] text-apx-mute">
              vs. $746 at standard rates · you save $350 over the first 3
              months.
            </p>
          </div>
        </FadeUp>
      </Container>
    </Section>
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
              body="Pick one. Send your content. We build it — you don't pick a template, we build the site."
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
    <Section bg="canvas">
      <Container>
        <FadeUp>
          <div className="max-w-2xl">
            <Eyebrow>The 30 designs</Eyebrow>
            <Display level="display-xl" className="mt-4">
              Pick one. Send your content. We build it.
            </Display>
            <Lede className="mt-4">
              Designs work for every kind of small business — from
              neighborhood barbers and yoga studios to law firms,
              contractors, and growing trades.
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
              a="Your monthly rate steps up to our standard $149/mo. You can cancel any time from your portal, or stay on for unlimited edits, hosting, and ongoing support."
            />
            <FaqRow
              q="Is the $99 setup refundable?"
              a="Yes — before you submit your content worksheet. Once you submit and our team starts building, the setup fee covers that work and becomes non-refundable. Same rules as our standard $299 setup."
            />
            <FaqRow
              q="Can I cancel during the 3-month promo?"
              a="Yes. Your first month is fully refundable within 30 days. After that, you can cancel any time — you just won't be charged again. Your site stays online for a 30-day grace period."
            />
            <FaqRow
              q="Do I own the site?"
              a="On the subscription tier, you can export your content + design at any time. If you want full source-code ownership, our one-time build ($997, separate offer) ships you the code on launch."
            />
            <FaqRow
              q="What if I don't see a design I like?"
              a="We have 30 designs, every one buyable under this promo. If none fits, email hello@yourshopfront.com — we add new themes regularly."
            />
            <FaqRow
              q="Why is this promo a thing?"
              a="We're new, and we're stacking the first 100 happy customers. The promo is our bet that once you see what we build, you'll stay past the 3-month mark."
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
              Ready to be online tomorrow?
            </Display>
            <Lede className="mt-6">
              $99 to start. Live by tomorrow morning. Cancel any time.
            </Lede>
            <div className="mt-8">
              <Button
                href={PROMO_CHECKOUT_HREF}
                variant="primary"
                size="lg"
              >
                Get started for $99 →
              </Button>
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
