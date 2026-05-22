import type { Metadata } from "next"

import {
  Button,
  Container,
  Display,
  Eyebrow,
  HighlightStroke,
  Lede,
  Section,
  SiteFooter,
  SiteHeader,
} from "@/components/apex"
import { FadeUp } from "@/components/apex/motion/fade-up"
import { OpenChatButton } from "@/components/apex/open-chat-button"
import { JsonLd } from "@/components/json-ld"
import { SITE_URL, organizationSchema } from "@/lib/seo"

const ABOUT_URL = `${SITE_URL}/about`

export const metadata: Metadata = {
  title: "About — Your Shopfront",
  description:
    "Your Shopfront is a productized agency for small businesses. 30 designs, 24-hour delivery, no contracts. Built by people who got tired of seeing good operators stuck on bad websites.",
  alternates: { canonical: ABOUT_URL },
  openGraph: {
    title: "About — Your Shopfront",
    description: "A productized agency for small businesses. 30 designs, 24-hour delivery, no contracts.",
    url: ABOUT_URL,
    type: "website",
    siteName: "Your Shopfront",
  },
}

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          organizationSchema(),
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            url: ABOUT_URL,
            name: "About Your Shopfront",
          },
        ]}
      />
      <SiteHeader variant="default" />
      <main id="main" className="flex-1 bg-apx-paper">
        <Section bg="canvas" className="py-20 md:py-28">
          <Container>
            <Eyebrow>About</Eyebrow>
            <Display level="display-2xl" as="h1" className="mt-4 max-w-[18ch]">
              A productized agency for <HighlightStroke>every small business</HighlightStroke>.
            </Display>
            <Lede className="mt-6 max-w-[60ch]">
              We started Your Shopfront because small businesses are underserved by template tools and overcharged by traditional agencies. There is a yawning gap between &ldquo;build it yourself in Squarespace&rdquo; and &ldquo;hire an agency for $15K and wait six months.&rdquo; We sit in that gap.
            </Lede>
          </Container>
        </Section>

        <Section bg="paper">
          <Container>
            <div className="mx-auto grid max-w-3xl gap-10 text-[17px] leading-[1.65] text-apx-ink">
              <FadeUp>
                <p>
                  We&apos;ve designed and prototyped 30 production-grade websites — each one built around how a real business actually gets customers. Laundromats want a clean booking card. Yoga studios want a warm gallery. Law firms want credibility-first copy. Roofers want a storm-damage form.
                </p>
              </FadeUp>
              <FadeUp delay={60}>
                <p>
                  We don&apos;t hand you a blank canvas. We hand you a finished site that already works for your category, with your content swapped in. The whole transaction is built around speed: $299 and a half-hour worksheet on Monday morning, your site live by Tuesday afternoon, indexed by Friday.
                </p>
              </FadeUp>
              <FadeUp delay={120}>
                <p>
                  No contracts. No long onboarding. No design-by-committee. If we don&apos;t earn the second month, you cancel and the site stays online for thirty days while you figure out what&apos;s next. We don&apos;t lock anyone in — we keep customers because the site keeps delivering.
                </p>
              </FadeUp>
            </div>
          </Container>
        </Section>

        <Section bg="tint">
          <Container>
            <div className="mx-auto max-w-3xl">
              <FadeUp>
                <Eyebrow>How we work</Eyebrow>
                <Display level="display-lg" className="mt-4">
                  Three things we won&apos;t do.
                </Display>
              </FadeUp>
              <ul className="mt-8 flex flex-col gap-6 text-[17px] leading-[1.6] text-apx-ink">
                <FadeUp delay={60}>
                  <li>
                    <strong className="font-semibold">We won&apos;t pretend the deliverable is bespoke.</strong>{" "}
                    The 30 designs are the deliverables. You pick one. We swap your content in. If you need something custom, we&apos;ll happily refer you to an agency — Your Shopfront isn&apos;t the right fit for that.
                  </li>
                </FadeUp>
                <FadeUp delay={120}>
                  <li>
                    <strong className="font-semibold">We won&apos;t hide the price.</strong>{" "}
                    $299 setup + $149/mo subscription, or $997 one-time. That&apos;s on the homepage, the pricing page, the checkout, the footer. No discovery call required to find out the number.
                  </li>
                </FadeUp>
                <FadeUp delay={180}>
                  <li>
                    <strong className="font-semibold">We won&apos;t take longer than 24 hours.</strong>{" "}
                    From the moment you submit your content worksheet, the clock starts. If we don&apos;t ship in 24 hours, the first month is free.
                  </li>
                </FadeUp>
              </ul>
            </div>
          </Container>
        </Section>

        <Section bg="primary-soft">
          <Container>
            <FadeUp>
              <div className="mx-auto max-w-3xl text-center">
                <Display level="display-xl">
                  Got a question first?
                </Display>
                <Lede className="mx-auto mt-5">
                  Open the chat — the concierge has the full design catalog, pricing, and partner-marketing details on tap. No call, no email tag, no waiting.
                </Lede>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <OpenChatButton variant="primary" size="lg">
                    Open the chat →
                  </OpenChatButton>
                  <Button href="/portfolio" variant="secondary" size="lg">
                    See the 30 designs
                  </Button>
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
