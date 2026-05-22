import type { Metadata } from "next"
import Link from "next/link"

import { Button, SiteFooter, SiteHeader } from "@/components/apex"
import { ThemeProvider } from "@/components/theme-provider"
import { allThemes, defaultTheme } from "@/lib/themes"
import { getSiteByStripeSessionId, type Site } from "@/lib/supabase"
import { SITE_URL } from "@/lib/seo"

import { WorksheetForm } from "./worksheet-form"

interface PageProps {
  searchParams: Promise<{ session_id?: string }>
}

export const metadata: Metadata = {
  title: "Content worksheet",
  description: "Fill in your hero copy, services, and contact info.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/onboarding/worksheet` },
}

// Re-fetch on every request — section saves call revalidatePath, but a
// direct refresh should also see latest state.
export const dynamic = "force-dynamic"

export default async function WorksheetPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams

  if (!session_id) return <FallbackShell title="Missing session ID." />

  let site: Site | null = null
  try {
    site = await getSiteByStripeSessionId(session_id)
  } catch (err) {
    console.error("[worksheet] supabase lookup failed", err)
    return <FallbackShell title="Something went wrong on our end." />
  }
  if (!site) return <FallbackShell title="No site found for that session." />

  const theme = allThemes[site.demo_slug] ?? defaultTheme
  const locked = site.status !== "pending_content"

  return (
    <ThemeProvider theme={theme}>
      <SiteHeader
        variant="minimal"
        backHref={`/onboarding?session_id=${encodeURIComponent(site.stripe_session_id)}`}
        backLabel="Back to checklist"
      />
      <main id="main" className="min-h-screen flex-1">
        <div className="mx-auto max-w-[820px] px-6 py-12 md:px-10 md:py-16">
          <p
            className="text-xs font-bold uppercase tracking-[0.18em]"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            Step 2 · Content worksheet
          </p>
          <h1
            className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl"
            style={{
              color: "var(--apex-fg)",
              fontFamily: "var(--apex-font-display)",
            }}
          >
            Tell us about {site.business_name}.
          </h1>
          <p
            className="mt-3 text-base leading-relaxed"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            Fill in each section and save as you go. Five sections are
            required: hero, contact, services, about, and service area. The
            checklist on the previous page marks step 2 complete
            automatically once all five are filled.
          </p>
          {locked && (
            <p
              className="mt-4 rounded-lg border px-4 py-3 text-sm"
              style={{
                background: "color-mix(in oklab, var(--apex-primary) 10%, transparent)",
                borderColor: "color-mix(in oklab, var(--apex-primary) 30%, var(--apex-border))",
                color: "var(--apex-fg)",
              }}
            >
              Onboarding is locked (status: {site.status}). Email{" "}
              <a
                href="mailto:hello@yourshopfront.com"
                className="font-semibold underline underline-offset-2"
              >
                hello@yourshopfront.com
              </a>{" "}
              if you need to change something.
            </p>
          )}
          <div className="mt-10">
            <WorksheetForm site={site} />
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
            If you just paid, check your inbox for a confirmation email — it has a direct link to your worksheet.
          </p>
          <div className="mt-8 flex gap-3">
            <Button href="/" variant="primary" size="md">
              Back to home →
            </Button>
            <Link
              href="mailto:hello@yourshopfront.com"
              className="text-sm font-semibold text-apx-ink underline underline-offset-2"
            >
              hello@yourshopfront.com
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter variant="minimal" />
    </ThemeProvider>
  )
}
