"use client"

import posthog from "posthog-js"
import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

import { isEmbeddedFrame } from "@/lib/embed"

/**
 * PostHog session replay + product analytics. Env-gated: returns null
 * unless NEXT_PUBLIC_POSTHOG_KEY is set, so dev/CI/preview builds without
 * the key stay tracker-free — same contract as <PlausibleAnalytics />.
 *
 * Optional: NEXT_PUBLIC_POSTHOG_HOST defaults to PostHog Cloud's US
 * ingestion endpoint. Override to "https://eu.i.posthog.com" if the
 * PostHog project is EU-region, or to a same-origin reverse-proxy path
 * (e.g. "/ingest") if one is added later — this component only reads the
 * env var, no code change needed either way.
 *
 * `defaults: "2026-05-30"` opts into PostHog's current recommended
 * defaults bundle. Most relevant here: `external_scripts_inject_target`
 * becomes "head", which avoids a React hydration mismatch that the
 * lazy-loaded session-replay bundle can otherwise trigger on first paint
 * in Next.js App Router.
 *
 * Session replay privacy (this is a live payment site):
 * - `maskAllInputs: true` masks every <input>/<textarea>/<select> value
 *   — email, phone, business name, address on /checkout and /onboarding
 *   — before it ever leaves the browser. This is already posthog-js's
 *   default; set explicitly so it can't silently change upstream.
 * - Static marketing/UI copy is NOT masked. It's our own text, never
 *   user-entered, and masking it would make recordings useless for the
 *   one thing they're for: watching where visitors actually drop off.
 * - Card entry never touches this origin at all: /checkout redirects to
 *   Stripe's hosted checkout.stripe.com page (see
 *   src/app/checkout/checkout-form.tsx's `window.location.assign(url)`),
 *   so posthog-js is never even loaded on the page where a card number
 *   is typed.
 * - The authenticated billing portal (/app/*) shows account + invoice
 *   data we don't want in recordings, so replay is disabled there
 *   entirely: it never starts if a session begins on /app/*, and it's
 *   paused/resumed as the user crosses the /app boundary via
 *   client-side navigation.
 */
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com"

function isPortalPath(pathname: string): boolean {
  return pathname === "/app" || pathname.startsWith("/app/")
}

export function PostHogAnalytics() {
  const pathname = usePathname()
  const initialized = useRef(false)

  useEffect(() => {
    if (!POSTHOG_KEY) return
    // Never initialise inside the homepage's /demos/{slug}?embed=1
    // preview iframes — they render this same root layout and would
    // otherwise log a pageview for a demo the visitor never opened.
    if (isEmbeddedFrame()) return
    const path = pathname ?? "/"

    if (!initialized.current) {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        defaults: "2026-05-30",
        disable_session_recording: isPortalPath(path),
        session_recording: {
          maskAllInputs: true,
        },
      })
      initialized.current = true
      return
    }

    if (isPortalPath(path)) {
      posthog.stopSessionRecording()
    } else {
      posthog.startSessionRecording()
    }
  }, [pathname])

  return null
}
