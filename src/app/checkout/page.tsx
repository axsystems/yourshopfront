import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Check, Lock } from "lucide-react"

import { CheckoutForm } from "./checkout-form"
import { SiteFooter, SiteHeader } from "@/components/apex"
import { ThemeProvider } from "@/components/theme-provider"
import { JsonLd } from "@/components/json-ld"
import { allThemes } from "@/lib/themes"
import type { Tier } from "@/lib/checkout-schema"
import { SITE_URL, organizationSchema } from "@/lib/seo"

interface PageProps {
  searchParams: Promise<{
    tier?: string
    demo?: string
    cancelled?: string
    promo?: string
  }>
}

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Your Shopfront purchase.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/checkout` },
}

const TIER_LABELS: Record<Tier, string> = {
  subscription: "Subscription",
  onetime: "One-time build",
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams
  const rawTier = params.tier
  const rawDemo = params.demo

  // Spec: invalid tier → /pricing, invalid demo → /portfolio.
  // Tier check first because /pricing is the recovery surface for picking a tier.
  if (rawTier !== "subscription" && rawTier !== "onetime") {
    redirect("/pricing")
  }
  const tier: Tier = rawTier
  const theme = rawDemo ? allThemes[rawDemo] : undefined
  if (!theme) {
    redirect("/portfolio")
  }

  const cancelled = params.cancelled === "1"
  // Only "launch" is a valid promo. Anything else is treated as absent.
  const promo = params.promo === "launch" ? "launch" : undefined
  const isPromoSubscription = promo === "launch" && tier === "subscription"

  return (
    <ThemeProvider theme={theme}>
      <JsonLd data={[organizationSchema()]} />
      <SiteHeader
        variant="minimal"
        backHref={`/demos/${theme.slug}`}
        backLabel={`Back to ${theme.name}`}
      />
      <main id="main" className="min-h-screen flex-1">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-12 md:px-10 md:py-16 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
          <OrderSummary tier={tier} theme={theme} promo={isPromoSubscription} />
          <div>
            <h1
              className="text-3xl font-bold leading-tight tracking-tight md:text-4xl"
              style={{
                color: "var(--apex-fg)",
                fontFamily: "var(--apex-font-display)",
              }}
            >
              Tell us about your business.
            </h1>
            <p
              className="mt-3 text-base leading-relaxed"
              style={{ color: "var(--apex-muted-fg)" }}
            >
              We use this to build your site. The next step is payment via
              Stripe — we never see your card number.
            </p>
            <div className="mt-8">
              <CheckoutForm
                tier={tier}
                demo={theme.slug}
                cancelled={cancelled}
                promo={promo}
                defaultIndustry={theme.industry}
              />
            </div>
            <p
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: "var(--apex-muted-fg)" }}
            >
              <Lock className="h-3 w-3" aria-hidden />
              Secure checkout via Stripe
            </p>
          </div>
        </div>
      </main>
      <SiteFooter variant="minimal" />
    </ThemeProvider>
  )
}

function OrderSummary({
  tier,
  theme,
  promo,
}: {
  tier: Tier
  theme: (typeof allThemes)[string]
  promo: boolean
}) {
  return (
    <aside className="lg:sticky lg:top-8 lg:self-start">
      <div
        className="overflow-hidden rounded-2xl border"
        style={{
          background: "var(--apex-surface)",
          color: "var(--apex-surface-fg)",
          borderColor: "var(--apex-border)",
        }}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <iframe
            src={`/demos/${theme.slug}?embed=1`}
            title={`${theme.name} preview`}
            aria-hidden="true"
            tabIndex={-1}
            loading="lazy"
            className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
            style={{
              width: "334%",
              height: "334%",
              transform: "scale(0.3)",
            }}
          />
        </div>
        <div className="space-y-5 p-6">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-[0.16em]"
              style={{ color: "var(--apex-muted-fg)" }}
            >
              Order summary
            </p>
            <h2
              className="mt-2 text-xl font-bold leading-tight"
              style={{ fontFamily: "var(--apex-font-display)" }}
            >
              {theme.name}
              <span
                className="ml-2 text-base font-medium"
                style={{ color: "var(--apex-muted-fg)" }}
              >
                · {theme.industry}
              </span>
            </h2>
            <p
              className="mt-2 text-sm leading-snug"
              style={{ color: "var(--apex-muted-fg)" }}
            >
              {theme.tagline}
            </p>
          </div>

          <div
            className="space-y-2 border-t pt-4"
            style={{ borderColor: "var(--apex-border)" }}
          >
            <p
              className="text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--apex-muted-fg)" }}
            >
              {TIER_LABELS[tier]}
            </p>
            {tier === "subscription" ? (
              promo ? (
                <>
                  <PriceLine label="Setup fee (today)" amount="$99" />
                  <PriceLine label="First month" amount="$99" />
                  <PriceLine
                    label="Months 2 + 3"
                    amount="$99/mo"
                    muted
                    detail="Promo rate"
                  />
                  <PriceLine
                    label="Month 4 onward"
                    amount="$149/mo"
                    muted
                    detail="Standard rate · cancel anytime"
                  />
                  <div
                    className="flex items-baseline justify-between border-t pt-3"
                    style={{ borderColor: "var(--apex-border)" }}
                  >
                    <span className="text-sm font-bold">Today&apos;s charge</span>
                    <span
                      className="text-2xl font-extrabold"
                      style={{ fontFamily: "var(--apex-font-display)" }}
                    >
                      $198
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <PriceLine label="Setup fee (today)" amount="$299" />
                  <PriceLine label="First month" amount="$149" />
                  <PriceLine
                    label="Ongoing"
                    amount="$149/mo"
                    muted
                    detail="Cancel anytime"
                  />
                  <div
                    className="flex items-baseline justify-between border-t pt-3"
                    style={{ borderColor: "var(--apex-border)" }}
                  >
                    <span className="text-sm font-bold">Today&apos;s charge</span>
                    <span
                      className="text-2xl font-extrabold"
                      style={{ fontFamily: "var(--apex-font-display)" }}
                    >
                      $448
                    </span>
                  </div>
                </>
              )
            ) : (
              <>
                <PriceLine label="One-time build" amount="$997" />
                <PriceLine
                  label="Optional hosting (selectable below)"
                  amount="+ $49/mo"
                  muted
                />
                <div
                  className="flex items-baseline justify-between border-t pt-3"
                  style={{ borderColor: "var(--apex-border)" }}
                >
                  <span className="text-sm font-bold">Today&apos;s charge</span>
                  <span
                    className="text-2xl font-extrabold"
                    style={{ fontFamily: "var(--apex-font-display)" }}
                  >
                    $997
                  </span>
                </div>
              </>
            )}
          </div>

          <ul
            className="space-y-2 border-t pt-4 text-sm"
            style={{
              borderColor: "var(--apex-border)",
              color: "var(--apex-muted-fg)",
            }}
          >
            <Bullet>Live in 24 hours from content receipt</Bullet>
            <Bullet>30-day money-back guarantee</Bullet>
            <Bullet>
              {tier === "subscription"
                ? "Unlimited edits, forever"
                : "Full source code on launch"}
            </Bullet>
          </ul>
        </div>
      </div>
    </aside>
  )
}

function PriceLine({
  label,
  amount,
  muted,
  detail,
}: {
  label: string
  amount: string
  muted?: boolean
  detail?: string
}) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span style={{ color: muted ? "var(--apex-muted-fg)" : "inherit" }}>
        {label}
        {detail && (
          <span
            className="ml-2 text-xs"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            ({detail})
          </span>
        )}
      </span>
      <span
        className="font-bold"
        style={{
          color: muted ? "var(--apex-muted-fg)" : "inherit",
          fontFamily: "var(--apex-font-display)",
        }}
      >
        {amount}
      </span>
    </div>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check
        className="mt-0.5 h-4 w-4 flex-shrink-0"
        style={{ color: "var(--apex-primary)" }}
      />
      <span>{children}</span>
    </li>
  )
}
