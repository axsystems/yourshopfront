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

function useIsEmbedded(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function HideWhenEmbedded({ children }: { children: React.ReactNode }) {
  const embedded = useIsEmbedded()

  if (embedded) return null
  return <>{children}</>
}

/**
 * The counterpart: renders children ONLY inside a frame.
 *
 * Some of our chrome cannot simply be deleted from an embedded demo — the
 * hero's "Pick a style / See pricing" pair is the only call to action in
 * the headline column, and a hero with no button reads as an unfinished
 * page rather than the business's own site. Those cases need a swap, not a
 * removal, so the embedded branch needs its own gate.
 *
 * Same server snapshot as <AnalyticsGate> (render nothing), so a top-level
 * page never briefly paints the embedded-only variant.
 */
export function ShowWhenEmbedded({ children }: { children: React.ReactNode }) {
  const embedded = useIsEmbedded()

  if (!embedded) return null
  return <>{children}</>
}
