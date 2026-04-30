import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

import { OnboardingChecklist } from "./onboarding-checklist"
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
    return <MissingSession />
  }

  let site: Site | null = null
  try {
    site = await getSiteByStripeSessionId(session_id)
  } catch (err) {
    console.error("[onboarding] supabase lookup failed", err)
    return <LookupFailed />
  }

  if (!site) {
    // Webhook hasn't fired (or failed) yet. Show a processing message
    // and meta-refresh every 5 seconds. Stripe webhook latency is
    // typically <2 seconds in practice.
    return <Processing sessionId={session_id} />
  }

  const theme = allThemes[site.demo_slug] ?? defaultTheme
  const isComplete = site.status !== "pending_content"

  return (
    <ThemeProvider theme={theme}>
      <main className="min-h-screen">
        <header
          className="border-b"
          style={{
            background: "var(--apex-bg)",
            borderColor: "var(--apex-border)",
          }}
        >
          <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-6 py-4 md:px-10">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-bold tracking-tight hover:opacity-80"
              style={{ color: "var(--apex-fg)" }}
            >
              <span
                className="grid h-8 w-8 place-items-center rounded text-sm font-black"
                style={{
                  background: "var(--apex-fg)",
                  color: "var(--apex-bg)",
                }}
              >
                A
              </span>
              Apex Sites
            </Link>
            <a
              href="mailto:hello@apexsites.com"
              className="text-sm font-semibold hover:underline"
              style={{ color: "var(--apex-muted-fg)" }}
            >
              Need help? hello@apexsites.com
            </a>
          </div>
        </header>

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
    </ThemeProvider>
  )
}

// -----------------------------------------------------------------------------
// State variants
// -----------------------------------------------------------------------------

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
        We&apos;ve got everything.
      </h1>
      <p
        className="mx-auto mt-4 max-w-xl text-lg leading-relaxed"
        style={{ color: "var(--apex-muted-fg)" }}
      >
        We&apos;ll start building within 4 hours, and your site will be live
        within 24. We&apos;ll email you a preview URL before we flip the
        switch.
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
            Domain: we&apos;ll pick a *.apex-sites.com subdomain
          </p>
        )}
      </div>
      <p
        className="mt-8 text-sm"
        style={{ color: "var(--apex-muted-fg)" }}
      >
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

function MissingSession() {
  return (
    <FallbackShell title="Hmm, we&apos;re missing your session ID.">
      <p>
        It looks like you landed here without a Stripe session reference. If
        you just paid, check your inbox for a confirmation email — it has a
        direct link.
      </p>
      <p>
        If you&apos;re trying to start a new purchase, head to{" "}
        <Link href="/pricing" className="font-semibold underline">
          pricing
        </Link>
        .
      </p>
    </FallbackShell>
  )
}

function LookupFailed() {
  return (
    <FallbackShell title="Something went wrong on our end.">
      <p>
        We couldn&apos;t reach our database to look up your purchase. Your
        payment is safe — this is purely a display issue. Refresh in a moment,
        or email{" "}
        <a
          href="mailto:hello@apexsites.com"
          className="font-semibold underline"
        >
          hello@apexsites.com
        </a>{" "}
        if it persists.
      </p>
    </FallbackShell>
  )
}

function Processing({ sessionId }: { sessionId: string }) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="refresh" content="5" />
        <title>Processing your purchase…</title>
      </head>
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <main className="mx-auto max-w-xl px-6 py-24 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900" />
          <h1 className="mt-8 text-2xl font-bold tracking-tight">
            We&apos;re processing your purchase.
          </h1>
          <p className="mt-3 text-neutral-600">
            This page should resolve in about 30 seconds. We refresh
            automatically every 5 seconds while we wait — no need to do
            anything.
          </p>
          <p className="mt-6 text-xs text-neutral-400 font-mono break-all">
            session: {sessionId}
          </p>
          <p className="mt-8 text-sm text-neutral-500">
            If this hangs for more than a minute, email{" "}
            <a
              href="mailto:hello@apexsites.com"
              className="font-semibold underline"
            >
              hello@apexsites.com
            </a>{" "}
            with the session ID above.
          </p>
        </main>
      </body>
    </html>
  )
}

function FallbackShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Onboarding — Apex Sites</title>
      </head>
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <main className="mx-auto max-w-xl px-6 py-24">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <div className="mt-4 space-y-3 text-neutral-700">{children}</div>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-sm font-bold text-white"
          >
            Back to home <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </main>
      </body>
    </html>
  )
}
