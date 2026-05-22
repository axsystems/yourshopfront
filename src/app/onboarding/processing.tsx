"use client"

import * as React from "react"

import { SiteFooter, SiteHeader } from "@/components/apex"

/**
 * "We're processing your purchase" state — shown when the user lands at
 * /onboarding?session_id=... but the Stripe webhook hasn't created the
 * matching `sites` row yet. Polls every 5s via window.location.reload().
 *
 * This replaces the previous Processing component that nested its own
 * <html><head><meta http-equiv="refresh"></head>...</html> tree (the audit
 * flagged this as invalid markup). We poll from JS instead, which means
 * the parent layout's <html lang="en"> + favicons + manifest still apply.
 */
export function OnboardingProcessing({ sessionId }: { sessionId: string }) {
  React.useEffect(() => {
    const id = window.setTimeout(() => {
      window.location.reload()
    }, 5000)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <>
      <SiteHeader variant="minimal" />
      <main id="main" className="flex-1 bg-apx-paper">
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-apx-line border-t-apx-primary" />
          <h1 className="mt-8 font-sans text-[24px] font-bold tracking-[-0.015em] text-apx-ink md:text-[28px]">
            We&apos;re processing your purchase.
          </h1>
          <p className="mt-3 text-[16px] text-apx-mute">
            This page should resolve in about 30 seconds. We refresh
            automatically every 5 seconds while we wait — no need to do
            anything.
          </p>
          <p className="mt-6 break-all font-mono text-[12px] text-apx-soft">
            session: {sessionId}
          </p>
          <p className="mt-8 text-[14px] text-apx-mute">
            If this hangs for more than a minute, email{" "}
            <a
              href="mailto:hello@yourshopfront.com"
              className="font-semibold text-apx-ink underline underline-offset-2 hover:text-apx-primary"
            >
              hello@yourshopfront.com
            </a>{" "}
            with the session ID above.
          </p>
        </div>
      </main>
      <SiteFooter variant="minimal" />
    </>
  )
}
