import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { ContactForm } from "./contact-form"
import { JsonLd } from "@/components/json-ld"
import { SiteShellFooter, SiteShellHeader } from "@/components/site-shell"
import { SITE_URL, organizationSchema } from "@/lib/seo"

const CONTACT_URL = `${SITE_URL}/contact`

export const metadata: Metadata = {
  title: "Talk to us — Custom Builds and Questions",
  description:
    "Get a custom-build quote, ask about pricing, or send any other question. We reply within 24 hours.",
  alternates: { canonical: CONTACT_URL },
  openGraph: {
    title: "Talk to us — Apex Sites",
    description: "Custom-build quotes, pricing questions, and general inquiries.",
    url: CONTACT_URL,
    type: "website",
    siteName: "Apex Sites",
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
            name: "Talk to us — Apex Sites",
          },
        ]}
      />
      <SiteShellHeader />
      <main className="bg-white">
        <section className="mx-auto grid max-w-[1100px] gap-12 px-6 py-16 md:grid-cols-[1fr_1.4fr] md:px-10 md:py-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
              Contact
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-neutral-900 md:text-5xl">
              Tell us about your business.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-neutral-700">
              Custom-build quotes, pricing questions, partnerships, technical questions about an
              existing site — all of it lands in the same inbox. A real person replies within
              24 hours.
            </p>
            <ul className="mt-8 space-y-3 border-t border-neutral-200 pt-6 text-sm text-neutral-600">
              <li>
                <strong className="text-neutral-900">For custom builds:</strong> tell us your
                industry and which design (if any) inspired you.
              </li>
              <li>
                <strong className="text-neutral-900">For theme-option sites:</strong>{" "}
                <Link className="underline" href="/#demos">
                  pick a style
                </Link>{" "}
                — those go straight to checkout.
              </li>
              <li>
                <strong className="text-neutral-900">Existing customer?</strong>{" "}
                Email{" "}
                <a className="underline" href="mailto:hello@apexsites.com">
                  hello@apexsites.com
                </a>{" "}
                directly for fastest reply.
              </li>
            </ul>
          </div>
          <Suspense
            fallback={
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-500">
                Loading form…
              </div>
            }
          >
            <ContactForm />
          </Suspense>
        </section>
      </main>
      <SiteShellFooter />
    </>
  )
}
