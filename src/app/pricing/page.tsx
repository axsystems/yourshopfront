import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

import { JsonLd } from "@/components/json-ld"
import { SiteShellFooter, SiteShellHeader } from "@/components/site-shell"
import { SITE_URL, organizationSchema, serviceSchema } from "@/lib/seo"

const PRICING_URL = `${SITE_URL}/pricing`

export const metadata: Metadata = {
  title: "Pricing — Subscription or One-Time",
  description:
    "Two ways to buy Apex Sites: $499 setup + $199/mo subscription with unlimited edits, or $2,997 one-time build with full source code. 30-day money-back guarantee.",
  alternates: { canonical: PRICING_URL },
  openGraph: {
    title: "Pricing — Apex Sites",
    description:
      "Subscription ($499 + $199/mo) or one-time ($2,997). Pick what fits.",
    url: PRICING_URL,
    type: "website",
    siteName: "Apex Sites",
  },
}

export default function PricingPage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), serviceSchema()]} />
      <SiteShellHeader />
      <main className="bg-white">
        <section className="border-b border-neutral-200 bg-neutral-50">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center md:px-10 md:py-28">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
              Pricing
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-[0.95] tracking-tight text-neutral-900 md:text-6xl">
              Two ways to buy.{" "}
              <span className="text-emerald-600">Pick the one that fits.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-neutral-600">
              The average home-service customer is worth $400–800. Apex Sites pays for itself
              the first time it books you a job you wouldn&apos;t have gotten otherwise. Most
              clients see their first booking from the new site within 7 days of launch.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-6 py-20 md:px-10">
          <div className="grid gap-6 lg:grid-cols-2">
            <PriceCard
              tagline="MOST POPULAR · CANCEL ANYTIME"
              taglineColor="bg-emerald-500 text-emerald-950"
              title="Subscription"
              price="$499"
              priceDetail="setup"
              recurring="+ $199/mo"
              sub="We host it. Unlimited edits."
              features={[
                "Pick from any of our 24 theme designs",
                "We swap in your content within 24 hours",
                "Unlimited edits, forever",
                "We host it (fast Vercel + Cloudflare)",
                "SSL, backups, security updates",
                "Google Business profile management",
                "Cancel anytime — site stays online for 30 days",
              ]}
              ctaLabel="Start subscription →"
              ctaHref="/checkout?tier=subscription"
              variant="featured"
            />
            <PriceCard
              tagline="YOURS FOREVER · NO RECURRING"
              taglineColor="bg-neutral-200 text-neutral-700"
              title="One-time build"
              price="$2,997"
              priceDetail="once"
              sub="Full source code. Self-host or +$29/mo."
              features={[
                "Pick from any of our 24 theme designs",
                "We swap in your content within 24 hours",
                "30 days of free edits after launch",
                "Full source code handed over",
                "Self-host on your own Vercel / Netlify",
                "Optional hosting & maintenance: +$29/mo",
              ]}
              ctaLabel="Buy one-time →"
              ctaHref="/checkout?tier=onetime"
              variant="default"
            />
          </div>

          <div className="mt-12 grid gap-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-8 sm:grid-cols-3">
            <Stat label="30-day guarantee" value="Money back" />
            <Stat label="Average launch turnaround" value="24 hours" />
            <Stat label="Designs to pick from" value="24" />
          </div>
        </section>

        <section className="border-t border-neutral-200 bg-white py-20">
          <div className="mx-auto max-w-3xl px-6 md:px-10">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
              Common questions
            </h2>
            <dl className="mt-10 space-y-6">
              <Question q="Subscription or one-time — how do I decide?">
                Subscription if you want unlimited edits and don&apos;t want to manage hosting.
                One-time if you want to own the source code outright. Most home-service businesses
                go subscription because their site changes every season (offers, photos, holiday
                hours).
              </Question>
              <Question q="Can I switch from subscription to one-time later?">
                Yes — your $499 setup credits toward a one-time license at any point in the first year.
                After that, switching costs the full $2,997 one-time price.
              </Question>
              <Question q="What does the $29/mo hosting addon include?">
                Vercel + Cloudflare hosting, SSL renewal, weekly database backups, security patches,
                uptime monitoring, and a Slack channel for issues. Same as what we run for subscription customers.
              </Question>
              <Question q="Where do I see the designs?">
                Our{" "}
                <Link href="/portfolio" className="font-semibold underline">
                  portfolio
                </Link>{" "}
                shows all 24 designs across 3 design rounds. Every one is buyable under either
                tier — the 10 featured on the homepage are our highest-converting starting
                lineup; the other 14 are equally available, just one click deeper.
              </Question>
              <Question q="What if none of the 24 designs fits my business?">
                Send us a note via{" "}
                <Link href="/contact?ref=portfolio-suggestion" className="font-semibold underline">
                  contact
                </Link>
                . We add new designs regularly and may have something in the pipeline that suits you.
              </Question>
            </dl>
          </div>
        </section>
      </main>
      <SiteShellFooter />
    </>
  )
}

function PriceCard({
  tagline,
  taglineColor,
  title,
  price,
  priceDetail,
  recurring,
  sub,
  features,
  ctaLabel,
  ctaHref,
  variant,
}: {
  tagline: string
  taglineColor: string
  title: string
  price: string
  priceDetail: string
  recurring?: string
  sub: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  variant: "featured" | "default"
}) {
  const isFeatured = variant === "featured"
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 transition ${
        isFeatured
          ? "border-emerald-300 bg-neutral-900 text-white shadow-2xl shadow-emerald-900/20 lg:scale-[1.03]"
          : "border-neutral-200 bg-white text-neutral-900"
      }`}
    >
      <span
        className={`self-start rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${taglineColor}`}
      >
        {tagline}
      </span>
      <h2 className="mt-5 text-2xl font-bold">{title}</h2>
      <div className="mt-4 flex items-baseline gap-2">
        <p className="text-5xl font-extrabold tracking-tight">{price}</p>
        <p className={`text-sm ${isFeatured ? "text-neutral-400" : "text-neutral-500"}`}>
          {priceDetail}
        </p>
        {recurring && (
          <p className={`ml-2 text-base font-semibold ${isFeatured ? "text-emerald-400" : "text-neutral-700"}`}>
            {recurring}
          </p>
        )}
      </div>
      <p className={`mt-2 text-sm ${isFeatured ? "text-neutral-300" : "text-neutral-600"}`}>
        {sub}
      </p>
      <ul className="mt-7 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-[15px] leading-snug">
            <span
              className={`mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full text-[11px] font-bold ${
                isFeatured ? "bg-emerald-500 text-emerald-950" : "bg-neutral-900 text-white"
              }`}
            >
              <Check className="h-3 w-3" />
            </span>
            <span className={isFeatured ? "text-neutral-100" : "text-neutral-800"}>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Link
          href={ctaHref}
          className={`inline-flex w-full items-center justify-center gap-1.5 rounded-full px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 ${
            isFeatured
              ? "bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
              : "bg-neutral-900 text-white hover:bg-neutral-800"
          }`}
        >
          {ctaLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">{value}</p>
    </div>
  )
}

function Question({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-neutral-200 pb-6">
      <dt className="text-lg font-bold text-neutral-900">{q}</dt>
      <dd className="mt-2 leading-relaxed text-neutral-700">{children}</dd>
    </div>
  )
}
