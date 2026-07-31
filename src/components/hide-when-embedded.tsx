"use client"

import { useSyncExternalStore } from "react"

import { isEmbeddedFrame } from "@/lib/embed"

/**
 * Hides Your Shopfront's own chrome when the page is rendered inside an
 * iframe.
 *
 * The homepage rotating preview and the /start previews frame real demo
 * pages, which render the full site: the PortfolioBanner ("All designs ·
 * DESIGN 5 OF 30 · I want this look") and the themed SiteHeader with our
 * Portfolio/Pricing nav. Inside a frame labelled "live preview" that reads
 * as our site rather than the customer's, which is the opposite of what a
 * demo is for.
 *
 * Frame-based rather than reading `?embed=1`, so it also covers the
 * /tenant preview iframes, and — unlike reading searchParams in the page —
 * it keeps /demos/[slug] statically generated.
 *
 * Inverse of <AnalyticsGate>: children render by default on the server and
 * on first client render, and are removed only once we know we are framed.
 * A normal top-level page therefore never flickers.
 */
const subscribe = () => () => {}
const getSnapshot = () => isEmbeddedFrame()
const getServerSnapshot = () => false

export function HideWhenEmbedded({ children }: { children: React.ReactNode }) {
  const embedded = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  if (embedded) return null
  return <>{children}</>
}
