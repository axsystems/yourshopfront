import type { Metadata } from "next"
import Link from "next/link"
import { Check } from "lucide-react"

import { OnboardingChecklist } from "./onboarding-checklist"
import { OnboardingProcessing } from "./processing"
import { Button, HighlightStroke, SiteFooter, SiteHeader } from "@/components/apex"
import { ThemeProvider } from "@/components/theme-provider"
import { allThemes, defaultTheme } from "@/lib/themes"
import { getSiteByStripeSessionId, type Site } from "@/lib/supabase"
import { SITE_URL } from "@/lib/seo"

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
            href="mailto:hello@apexsites.com"
            className="font-semibold text-apx-ink underline underline-offset-2 hover:text-apx-primary"
          >
            hello@apexsites.com
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
  const isComplete = site.status !== "pending_content"

  return (
    <ThemeProvider theme={theme}>
      <SiteHeader variant="minimal" backHref="/" backLabel="Back to home" />
      <main id="main" className="min-h-screen flex-1">
        <div className="mx-auto max-w-[820px] px-6 py-12 md:px-10 md:py-16">
          {isComplete ? (
            <ReadyToBuild site={site} />
          ) : (
            <>
              <p
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: "var(--apex-muted-fg)" }}
              >
                Welcome to Apex Sites
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
        </div>
      </main>
      <SiteFooter variant="minimal" />
    </ThemeProvider>
  )
}

function ReadyToBuild({ site }: { site: Site }) {
  return (
    <div className="text-center">
      <div
        className="mx-auto grid h-16 w-16 place-items-center rounded-full"
        style={{
          background: "var(--apex-primary)",
          color: "var(--apex-primary-fg)",
        }}
      >
        <Check className="h-8 w-8" strokeWidth={3} />
      </div>
      <h1
        className="mt-6 text-3xl font-bold leading-tight tracking-tight md:text-5xl"
        style={{
          color: "var(--apex-fg)",
          fontFamily: "var(--apex-font-display)",
        }}
      >
        We&apos;ve got <HighlightStroke>everything</HighlightStroke>.
      </h1>
      <p
        className="mx-auto mt-4 max-w-xl text-lg leading-relaxed"
        style={{ color: "var(--apex-muted-fg)" }}
      >
        We&apos;ll start building within 4 hours, and your site will be live
        within 24. We&apos;ll email you a preview URL before we flip the switch.
      </p>
      <div
        className="mx-auto mt-10 max-w-md rounded-2xl border p-6 text-left text-sm"
        style={{
          background: "var(--apex-surface)",
          color: "var(--apex-surface-fg)",
          borderColor: "var(--apex-border)",
        }}
      >
        <p
          className="text-xs font-bold uppercase tracking-[0.14em]"
          style={{ color: "var(--apex-muted-fg)" }}
        >
          Your order
        </p>
        <p
          className="mt-2 text-lg font-bold"
          style={{ fontFamily: "var(--apex-font-display)" }}
        >
          {site.business_name} · {site.demo_slug}
        </p>
        <p className="mt-1" style={{ color: "var(--apex-muted-fg)" }}>
          {site.tier === "subscription"
            ? "Subscription · $499 setup + $199/mo"
            : site.hosting_addon
              ? "One-time build · $2,997 + $29/mo hosting"
              : "One-time build · $2,997"}
        </p>
        {site.onboarding_state.domain?.type === "custom" &&
          site.onboarding_state.domain.custom_domain && (
            <p className="mt-2" style={{ color: "var(--apex-muted-fg)" }}>
              Domain: {site.onboarding_state.domain.custom_domain}
            </p>
          )}
        {site.onboarding_state.domain?.type === "subdomain" && (
          <p className="mt-2" style={{ color: "var(--apex-muted-fg)" }}>
            Domain: we&apos;ll pick a *.apexsites.com subdomain
          </p>
        )}
      </div>
      <p className="mt-8 text-sm" style={{ color: "var(--apex-muted-fg)" }}>
        Need to change something?{" "}
        <a
          href="mailto:hello@apexsites.com"
          className="font-semibold underline"
          style={{ color: "var(--apex-fg)" }}
        >
          Email us
        </a>
        .
      </p>
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
