import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { SiteFooter, SiteHeader } from "@/components/apex"
import { ThemeProvider } from "@/components/theme-provider"
import { SITE_URL } from "@/lib/seo"
import {
  getSiteByStripeSessionId,
  type Site,
  type SiteStatus,
} from "@/lib/supabase"
import { allThemes, defaultTheme } from "@/lib/themes"

import { DiscoveryForm } from "./discovery-form"

interface PageProps {
  searchParams: Promise<{ session_id?: string }>
}

export const metadata: Metadata = {
  title: "Discovery — Copy service",
  description: "Five questions. We draft your hero, services, and about in 15 seconds.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/onboarding/discovery` },
}

export const dynamic = "force-dynamic"

/**
 * Statuses that mean "the customer hasn't been through the discovery →
 * draft step yet". A site in any of these is allowed to enter the form.
 * Once the draft exists they get bounced back to the checklist.
 */
const ALLOWED_PRE_DRAFT_STATUSES: SiteStatus[] = [
  "pending_content",
  "awaiting_copy",
  "awaiting_copy_draft",
]

export default async function DiscoveryPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams

  if (!session_id) {
    return <FallbackShell title="Missing session ID." />
  }

  let site: Site | null = null
  try {
    site = await getSiteByStripeSessionId(session_id)
  } catch (err) {
    console.error("[discovery] supabase lookup failed", err)
    return <FallbackShell title="Something went wrong on our end." />
  }

  if (!site) {
    return <FallbackShell title="No site found for that session." />
  }

  // Guards: must have copy_addon AND be in a pre-draft status. Anyone else
  // gets bounced to the onboarding hub, which knows how to render the
  // right state for them.
  const onboardingHref = `/onboarding?session_id=${encodeURIComponent(session_id)}`
  if (!site.copy_addon) {
    redirect(onboardingHref)
  }
  if (!ALLOWED_PRE_DRAFT_STATUSES.includes(site.status)) {
    redirect(onboardingHref)
  }

  const theme = allThemes[site.demo_slug] ?? defaultTheme

  return (
    <ThemeProvider theme={theme}>
      <SiteHeader
        variant="minimal"
        backHref={onboardingHref}
        backLabel="Back to checklist"
      />
      <main id="main" className="min-h-screen flex-1">
        <div className="mx-auto max-w-[720px] px-6 py-12 md:px-10 md:py-16">
          <p
            className="text-xs font-bold uppercase tracking-[0.18em]"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            Copy service · Discovery
          </p>
          <h1
            className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl"
            style={{
              color: "var(--apex-fg)",
              fontFamily: "var(--apex-font-display)",
            }}
          >
            Five questions. Then we draft your copy.
          </h1>
          <p
            className="mt-3 text-base leading-relaxed"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            Skip the worksheet. Answer five short questions and our copywriter
            (paired with Claude) will draft your hero, services, and about
            section in about 15 seconds. You&apos;ll review the draft before we
            ship anything.
          </p>
          <div className="mt-10">
            <DiscoveryForm
              sessionId={site.stripe_session_id}
              initial={site.discovery_answers}
            />
          </div>
        </div>
      </main>
      <SiteFooter variant="minimal" />
    </ThemeProvider>
  )
}

function FallbackShell({ title }: { title: string }) {
  return (
    <ThemeProvider theme={defaultTheme}>
      <SiteHeader variant="minimal" backHref="/" backLabel="Back to home" />
      <main id="main" className="flex-1 bg-apx-paper">
        <div className="mx-auto max-w-xl px-6 py-24">
          <h1 className="font-sans text-[28px] font-bold tracking-[-0.015em] text-apx-ink md:text-[36px]">
            {title}
          </h1>
          <p className="mt-4 text-apx-mute">
            If you just paid, check your inbox for a confirmation email — it
            has a direct link to your onboarding.
          </p>
        </div>
      </main>
      <SiteFooter variant="minimal" />
    </ThemeProvider>
  )
}
