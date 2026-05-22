import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { ContactForm } from "./contact-form"
import {
  Card,
  Container,
  Display,
  Eyebrow,
  Lede,
  Section,
  SiteFooter,
  SiteHeader,
} from "@/components/apex"
import { JsonLd } from "@/components/json-ld"
import { SITE_URL, organizationSchema } from "@/lib/seo"

const CONTACT_URL = `${SITE_URL}/contact`

export const metadata: Metadata = {
  title: "Talk to us — Custom builds and questions",
  description:
    "Get a custom-build quote, ask about pricing, or send any other question. We reply within 24 hours.",
  alternates: { canonical: CONTACT_URL },
  openGraph: {
    title: "Talk to us — Your Shopfront",
    description: "Custom-build quotes, pricing questions, and general inquiries.",
    url: CONTACT_URL,
    type: "website",
    siteName: "Your Shopfront",
  },
}

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          organizationSchema(),
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            url: CONTACT_URL,
            name: "Talk to us — Your Shopfront",
          },
        ]}
      />
      <SiteHeader variant="default" />
      <main id="main" className="flex-1 bg-apx-paper">
        <Section bg="paper" className="py-20 md:py-24">
          <Container>
            <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:gap-16">
              <div>
                <Eyebrow>Contact</Eyebrow>
                <Display level="display-xl" as="h1" className="mt-4">
                  Talk to us.
                </Display>
                <Lede className="mt-5">
                  Custom-build quotes, pricing questions, partnerships, technical questions about an existing site — all of it lands in the same inbox. A real person replies within 24 hours.
                </Lede>
                <Card className="mt-8 flex flex-col gap-4 p-6">
                  <ContactRow
                    label="For custom builds"
                    body="Tell us your industry and which design (if any) inspired you."
                  />
                  <ContactRow
                    label="For theme-option sites"
                    body={
                      <>
                        <Link
                          href="/#gallery"
                          className="font-semibold text-apx-ink underline underline-offset-2 hover:text-apx-primary"
                        >
                          Pick a style
                        </Link>{" "}
                        — those go straight to checkout.
                      </>
                    }
                  />
                  <ContactRow
                    label="Existing customer?"
                    body={
                      <>
                        Email{" "}
                        <a
                          href="mailto:hello@yourshopfront.com"
                          className="font-semibold text-apx-ink underline underline-offset-2 hover:text-apx-primary"
                        >
                          hello@yourshopfront.com
                        </a>{" "}
                        directly for fastest reply.
                      </>
                    }
                  />
                </Card>
              </div>
              <Suspense
                fallback={
                  <div className="rounded-2xl border border-apx-line bg-apx-tint p-8 text-sm text-apx-mute">
                    Loading form…
                  </div>
                }
              >
                <ContactForm />
              </Suspense>
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter variant="default" />
    </>
  )
}

function ContactRow({
  label,
  body,
}: {
  label: string
  body: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-sans text-[14px] font-bold text-apx-ink">{label}</p>
      <p className="text-[14px] leading-[1.55] text-apx-mute">{body}</p>
    </div>
  )
}
