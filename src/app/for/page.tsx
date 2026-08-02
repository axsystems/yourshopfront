import type { Metadata } from "next"
import Link from "next/link"

import { Button, Container, Display, Eyebrow, Lede, Section, SiteFooter, SiteHeader } from "@/components/apex"
import { DemoCard } from "@/components/apex/demo-card"
import { FadeUp } from "@/components/apex/motion/fade-up"
import { JsonLd } from "@/components/json-ld"
import { SITE_URL, breadcrumbSchema, organizationSchema } from "@/lib/seo"
import { verticals } from "@/lib/verticals"

const HUB_URL = `${SITE_URL}/for`

// Derived from verticals.ts so this copy can't drift out of sync with the
// list again — it previously hardcoded "8" and named only the batch-1
// verticals, which went stale the moment batch 2 shipped.
const VERTICAL_COUNT = verticals.length
const VERTICAL_NAMES_LOWER = verticals.map((v) => v.nameLower)
const VERTICAL_NAME_LIST =
  VERTICAL_NAMES_LOWER.length > 1
    ? `${VERTICAL_NAMES_LOWER.slice(0, -1).join(", ")}, and ${VERTICAL_NAMES_LOWER.at(-1)}`
    : VERTICAL_NAMES_LOWER.join("")

export const metadata: Metadata = {
  title: "Websites by Business Type",
  description: `Website design tuned to how your business actually gets booked, quoted, and paid — ${VERTICAL_NAME_LIST}.`,
  alternates: { canonical: HUB_URL },
  openGraph: {
    title: "Websites by Business Type — Your Shopfront",
    description: `The same 30 designs, mapped to how ${VERTICAL_COUNT} specific kinds of business actually get booked, quoted, and paid.`,
    url: HUB_URL,
    type: "website",
    siteName: "Your Shopfront",
    images: [{ url: "/og-v3.png", width: 1200, height: 630, alt: "Your Shopfront — Websites by Business Type" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Websites by Business Type — Your Shopfront",
    description: `The same 30 designs, mapped to how ${VERTICAL_COUNT} specific kinds of business actually get booked, quoted, and paid.`,
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
            name: "Your Shopfront — Websites by Business Type",
            url: HUB_URL,
            description: `Website design mapped to ${VERTICAL_COUNT} specific kinds of business — the same 30 designs, tuned to how each one actually gets booked, quoted, and paid.`,
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
                <Eyebrow tone="cobalt">By business type</Eyebrow>
                <Display as="h1" level="display-2xl" className="mt-4">
                  Websites built for what you actually do.
                </Display>
                <Lede className="mx-auto mt-6">
                  The same 30 designs, tuned to how your kind of business actually gets booked, quoted, and paid. Pick
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
                <Display level="display-xl">Don&apos;t see your line of work?</Display>
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
