import type { Metadata } from "next"
import Link from "next/link"

import { Button, Container, Display, Eyebrow, Lede, Section, SiteFooter, SiteHeader } from "@/components/apex"
import { DemoCard } from "@/components/apex/demo-card"
import { FadeUp } from "@/components/apex/motion/fade-up"
import { JsonLd } from "@/components/json-ld"
import { SITE_URL, breadcrumbSchema, organizationSchema } from "@/lib/seo"
import { verticals } from "@/lib/verticals"

const HUB_URL = `${SITE_URL}/for`

export const metadata: Metadata = {
  title: "Websites by Trade",
  description:
    "Website design tuned to how your trade actually gets booked, quoted, and paid — plumbers, electricians, HVAC, cleaning, restaurants, photographers, florists, and yoga studios.",
  alternates: { canonical: HUB_URL },
  openGraph: {
    title: "Websites by Trade — Your Shopfront",
    description:
      "The same 30 designs, mapped to how 8 specific trades actually get booked, quoted, and paid.",
    url: HUB_URL,
    type: "website",
    siteName: "Your Shopfront",
    images: [{ url: "/og-v3.png", width: 1200, height: 630, alt: "Your Shopfront — Websites by Trade" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Websites by Trade — Your Shopfront",
    description: "The same 30 designs, mapped to how 8 specific trades actually get booked, quoted, and paid.",
  },
}

export default function ForHubPage() {
  return (
    <>
      <JsonLd
        data={[
          organizationSchema(),
          breadcrumbSchema([
            { name: "Home", url: SITE_URL },
            { name: "For", url: HUB_URL },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Your Shopfront — Websites by Trade",
            url: HUB_URL,
            description:
              "Website design mapped to 8 specific trades — the same 30 designs, tuned to how each trade actually gets booked, quoted, and paid.",
            isPartOf: { "@type": "WebSite", name: "Your Shopfront", url: SITE_URL },
            hasPart: verticals.map((v) => ({
              "@type": "WebPage",
              name: v.name,
              url: `${SITE_URL}/for/${v.slug}`,
            })),
          },
        ]}
      />
      <SiteHeader variant="default" />
      <main id="main" className="flex-1 bg-apx-paper">
        <Section bg="paper" className="pt-10 pb-16 md:pt-16 md:pb-20">
          <Container>
            <FadeUp>
              <div className="mx-auto max-w-3xl text-center">
                <Eyebrow tone="cobalt">By trade</Eyebrow>
                <Display as="h1" level="display-2xl" className="mt-4">
                  Websites for your trade, not just any business.
                </Display>
                <Lede className="mx-auto mt-6">
                  The same 30 designs, tuned to how your specific trade actually gets booked, quoted, and paid. Pick
                  your line of work below.
                </Lede>
              </div>
            </FadeUp>
          </Container>
        </Section>

        <Section bg="canvas">
          <Container>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {verticals.map((v, i) => (
                <FadeUp key={v.slug} delay={Math.min(i * 40, 240)}>
                  <div className="flex flex-col gap-3">
                    <DemoCard slug={v.themeSlug} href={`/for/${v.slug}`} eager={i < 4} />
                    <div className="px-1">
                      <p className="font-sans text-[15px] font-semibold text-apx-ink">{v.name}</p>
                      <p className="mt-1 text-[13px] leading-[1.45] text-apx-mute">{v.heroSub}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </Container>
        </Section>

        <Section bg="primary-soft">
          <Container>
            <FadeUp>
              <div className="mx-auto max-w-2xl text-center">
                <Display level="display-xl">Don&apos;t see your trade?</Display>
                <Lede className="mx-auto mt-5">
                  All 30 designs are available to any small business, at the same price. Browse the full portfolio
                  and pick whichever fits.
                </Lede>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button href="/portfolio" variant="primary" size="lg">
                    Browse all 30 designs →
                  </Button>
                  <Link
                    href="/pricing"
                    className="inline-flex h-14 items-center justify-center px-2 text-[15px] font-semibold text-apx-ink underline underline-offset-4 hover:text-apx-primary"
                  >
                    See pricing →
                  </Link>
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
