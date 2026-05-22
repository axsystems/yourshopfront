import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle, PenLine } from "lucide-react"

import { BillingButton } from "./billing-button"
import { OnboardingChecklist } from "./onboarding-checklist"
import { OnboardingProcessing } from "./processing"
import { ProvisioningStatus } from "./provisioning-status"
import { Button, SiteFooter, SiteHeader } from "@/components/apex"
import { ThemeProvider } from "@/components/theme-provider"
import { allThemes, defaultTheme } from "@/lib/themes"
import { getSiteByStripeSessionId, type Site, type SiteStatus } from "@/lib/supabase"
import { SITE_URL } from "@/lib/seo"

const COPY_ACTIVE_STATUSES: SiteStatus[] = ["pending_content", "awaiting_copy"]

interface PageProps {
  searchParams: Promise<{ session_id?: string }>
}

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Send us your content — we'll launch your site within 24 hours.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/onboarding` },
}

// Don't cache — onboarding state changes per request as the user marks
// steps complete. revalidatePath in actions.ts also forces fresh data.
export const dynamic = "force-dynamic"

export default async function OnboardingPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams

  if (!session_id) {
    return <FallbackShell title="Hmm, we&apos;re missing your session ID.">
      <p>
        It looks like you landed here without a Stripe session reference. If
        you just paid, check your inbox for a confirmation email — it has a
        direct link.
      </p>
      <p>
        If you&apos;re trying to start a new purchase, head to{" "}
        <Link href="/pricing" className="font-semibold text-apx-ink underline underline-offset-2 hover:text-apx-primary">
          pricing
        </Link>
        .
      </p>
    </FallbackShell>
  }

  let site: Site | null = null
  try {
    site = await getSiteByStripeSessionId(session_id)
  } catch (err) {
    console.error("[onboarding] supabase lookup failed", err)
    return (
      <FallbackShell title="Something went wrong on our end.">
        <p>
          We couldn&apos;t reach our database to look up your purchase. Your
          payment is safe — this is purely a display issue. Refresh in a moment,
          or email{" "}
          <a
            href="mailto:hello@yourshopfront.com"
            className="font-semibold text-apx-ink underline underline-offset-2 hover:text-apx-primary"
          >
            hello@yourshopfront.com
          </a>{" "}
          if it persists.
        </p>
      </FallbackShell>
    )
  }

  if (!site) {
    // Webhook hasn't fired (or failed) yet. Show a processing message
    // and poll every 5 seconds. Stripe webhook latency is typically <2s.
    return <OnboardingProcessing sessionId={session_id} />
  }

  const theme = allThemes[site.demo_slug] ?? defaultTheme
  const pastOnboarding = site.status !== "pending_content"
  // Show "Manage billing" only when the customer has a recurring charge:
  // - subscription tier (always has the $149/mo sub), OR
  // - one-time tier with the $49/mo hosting add-on.
  // Pure one-time customers have nothing to manage in the portal.
  const hasRecurringBilling =
    site.tier === "subscription" ||
    (site.tier === "onetime" && site.hosting_addon)

  return (
    <ThemeProvider theme={theme}>
      <SiteHeader variant="minimal" backHref="/" backLabel="Back to home" />
      <main id="main" className="min-h-screen flex-1">
        <div className="mx-auto max-w-[820px] px-6 py-12 md:px-10 md:py-16">
          {/* Copy-service banner is OUTSIDE the pastOnboarding ternary so
              awaiting_copy customers (who are technically past pending_content)
              still see the banner explaining their site is in the copy-drafting
              phase. Without this, copy-addon customers would only see
              ProvisioningStatus which doesn't know about copy service. */}
          {site.copy_addon && (
            <div className="mb-8">
              <CopyAddonBanner status={site.status} />
            </div>
          )}
          {pastOnboarding ? (
            <ProvisioningStatus initialSite={site} />
          ) : (
            <>
              <p
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: "var(--apex-muted-fg)" }}
              >
                Welcome to Your Shopfront
              </p>
              <h1
                className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl"
                style={{
                  color: "var(--apex-fg)",
                  fontFamily: "var(--apex-font-display)",
                }}
              >
                Hi {site.business_name.split(" ")[0]} — let&apos;s build your site.
              </h1>
              <p
                className="mt-3 text-base leading-relaxed"
                style={{ color: "var(--apex-muted-fg)" }}
              >
                Three steps below. Once you finish all of them, we start
                building. Most sites go live within 24 hours of you marking
                everything complete.
              </p>
              <div className="mt-10">
                <OnboardingChecklist site={site} />
              </div>
            </>
          )}

          {hasRecurringBilling && (
            <section
              id="billing"
              aria-labelledby="billing-heading"
              className="mt-12 rounded-2xl border p-6"
              style={{
                background: "var(--apex-surface)",
                borderColor: "var(--apex-border)",
                color: "var(--apex-surface-fg)",
              }}
            >
              <h2
                id="billing-heading"
                className="text-base font-bold leading-tight"
                style={{ fontFamily: "var(--apex-font-display)" }}
              >
                Billing
              </h2>
              <p
                className="mt-1 text-sm leading-relaxed"
                style={{ color: "var(--apex-muted-fg)" }}
              >
                Update your payment method, download invoices, or cancel any
                time from Stripe&apos;s secure portal.
              </p>
              <div className="mt-4">
                <BillingButton sessionId={session_id} />
              </div>
            </section>
          )}
        </div>
      </main>
      <SiteFooter variant="minimal" />
    </ThemeProvider>
  )
}

function CopyAddonBanner({ status }: { status: SiteStatus }) {
  const isActive = COPY_ACTIVE_STATUSES.includes(status)

  if (isActive) {
    return (
      <div
        className="flex items-start gap-3 rounded-xl border-2 px-5 py-4 text-sm leading-relaxed"
        style={{
          background: "color-mix(in oklab, #3b6eff 6%, transparent)",
          borderColor: "color-mix(in oklab, #3b6eff 30%, var(--apex-border))",
          color: "var(--apex-fg)",
        }}
      >
        <PenLine
          className="mt-0.5 h-5 w-5 flex-shrink-0"
          style={{ color: "#3b6eff" }}
          aria-hidden
        />
        <span>
          <strong className="font-semibold">Copy service active.</strong>{" "}
          We&apos;ll be drafting your hero, services, about, and CTAs based on
          the discovery questionnaire below. You just need to upload your logo
          and photos and fill in the 5 facts. We&apos;ll email you when your
          draft is ready (typically within 24 hours).
        </span>
      </div>
    )
  }

  return (
    <div
      className="flex items-start gap-3 rounded-xl border px-5 py-4 text-sm leading-relaxed"
      style={{
        background: "color-mix(in oklab, var(--apex-primary) 8%, transparent)",
        borderColor: "color-mix(in oklab, var(--apex-primary) 25%, var(--apex-border))",
        color: "var(--apex-fg)",
      }}
    >
      <CheckCircle
        className="mt-0.5 h-5 w-5 flex-shrink-0"
        style={{ color: "var(--apex-primary)" }}
        aria-hidden
      />
      <span>
        <strong className="font-semibold">Your copy has been drafted and approved.</strong>{" "}
        You&apos;re all set.
      </span>
    </div>
  )
}

/**
 * Apex-chrome'd fallback shell for missing-session / lookup-failed states.
 * Renders inside the page tree (no nested <html>) — uses the global root
 * layout's html/body. The audit flagged the previous nested <html> as
 * invalid markup.
 */
function FallbackShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader variant="minimal" backHref="/" backLabel="Back to home" />
      <main id="main" className="flex-1 bg-apx-paper">
        <div className="mx-auto max-w-xl px-6 py-24">
          <h1 className="font-sans text-[28px] font-bold tracking-[-0.015em] text-apx-ink md:text-[36px]">
            {title}
          </h1>
          <div className="mt-4 flex flex-col gap-3 text-apx-mute">{children}</div>
          <div className="mt-8">
            <Button href="/" variant="primary" size="md">
              Back to home →
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter variant="minimal" />
    </>
  )
}
