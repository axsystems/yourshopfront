import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { Button, SiteFooter, SiteHeader } from "@/components/apex"
import { ThemeProvider } from "@/components/theme-provider"
import { allThemes, defaultTheme } from "@/lib/themes"
import { getSiteByStripeSessionId, type Site } from "@/lib/supabase"
import type { PartialSiteContent } from "@/lib/site-content/schema"
import { SITE_URL } from "@/lib/seo"

import { CopyApprovalActions } from "./copy-approval-actions"
import { DraftPreview } from "./draft-preview"

// =============================================================================
// /onboarding/copy-review
// =============================================================================
// Customer-facing approval surface for the operator-approved AI draft.
// Auth: session_id bearer (same model as the rest of /onboarding). Guarded
// twice — must have status === 'awaiting_copy_approval' AND
// ai_copy_draft.operatorApprovedAt present. Either failing redirects back
// to the checklist; the draft is NEVER customer-visible before the
// operator says so.
// =============================================================================

interface PageProps {
  searchParams: Promise<{ session_id?: string }>
}

export const metadata: Metadata = {
  title: "Review your draft",
  description: "Approve your draft to build your site, or request edits.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/onboarding/copy-review` },
}

export const dynamic = "force-dynamic"

export default async function CopyReviewPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams
  if (!session_id) return <FallbackShell title="Missing session ID." />

  let site: Site | null = null
  try {
    site = await getSiteByStripeSessionId(session_id)
  } catch (err) {
    console.error("[copy-review] supabase lookup failed", err)
    return <FallbackShell title="Something went wrong on our end." />
  }
  if (!site) return <FallbackShell title="No site found for that session." />

  // Defence-in-depth guards. The page MUST NOT render the draft unless:
  //   1. the site is in awaiting_copy_approval (operator has sent it), AND
  //   2. there's actually a draft body to show (operatorEdits or content).
  // If either fails, redirect back to the checklist — never leak a draft
  // the operator hasn't approved.
  const opApprovedAt = site.ai_copy_draft?.operatorApprovedAt
  const draftBody: PartialSiteContent | undefined =
    site.ai_copy_draft?.operatorEdits ?? site.ai_copy_draft?.content
  if (site.status !== "awaiting_copy_approval" || !opApprovedAt || !draftBody) {
    redirect(`/onboarding?session_id=${encodeURIComponent(session_id)}`)
  }

  const theme = allThemes[site.demo_slug] ?? defaultTheme
  const alreadyApproved = Boolean(site.ai_copy_draft?.customerApprovedAt)

  return (
    <ThemeProvider theme={theme}>
      <SiteHeader
        variant="minimal"
        backHref={`/onboarding?session_id=${encodeURIComponent(session_id)}`}
        backLabel="Back to checklist"
      />
      <main id="main" className="min-h-screen flex-1">
        <div className="mx-auto max-w-[820px] px-6 py-10 md:px-10 md:py-14">
          <div
            className="rounded-xl border-2 px-5 py-4 text-sm leading-relaxed"
            style={{
              background: "color-mix(in oklab, var(--apex-primary) 8%, transparent)",
              borderColor: "color-mix(in oklab, var(--apex-primary) 25%, var(--apex-border))",
              color: "var(--apex-fg)",
            }}
          >
            <strong className="font-semibold">
              This is your AI-drafted copy, reviewed by our team.
            </strong>{" "}
            Approve to build your site, or request edits.
          </div>

          {alreadyApproved && (
            <p
              className="mt-4 rounded-lg border px-4 py-3 text-sm"
              style={{
                background: "color-mix(in oklab, var(--apex-primary) 10%, transparent)",
                borderColor: "color-mix(in oklab, var(--apex-primary) 30%, var(--apex-border))",
                color: "var(--apex-fg)",
              }}
            >
              You&apos;ve already approved this draft. We&apos;re building your site.
            </p>
          )}

          <div className="mt-8">
            <DraftPreview draft={draftBody} businessName={site.business_name} />
          </div>

          <div className="mt-10">
            <CopyApprovalActions
              sessionId={session_id}
              alreadyApproved={alreadyApproved}
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
            has a direct link.
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
