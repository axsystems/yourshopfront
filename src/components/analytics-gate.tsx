"use client"

import { useSyncExternalStore } from "react"

import { isEmbeddedFrame } from "@/lib/embed"

/**
 * Renders analytics children only in a real top-level browsing context.
 *
 * The homepage rotating preview mounts live `/demos/{slug}?embed=1`
 * iframes, and each one renders the root layout — so every tracker
 * mounted there fires again inside the frame, attributing a pageview to
 * a demo slug the visitor never opened. See src/lib/embed.ts for the
 * measured impact.
 *
 * The frame relationship is a browser-only fact, so it is read through
 * useSyncExternalStore: the server snapshot is `false` (render nothing),
 * the client snapshot is the real answer. That keeps the server and
 * first client render identical — no hydration mismatch — and the
 * trackers mount a tick later, which matches how they already load
 * (`strategy="afterInteractive"`).
 */

// Frame nesting cannot change for the life of the document, so there is
// nothing to subscribe to — the unsubscribe is a no-op.
const subscribe = () => () => {}
const getSnapshot = () => !isEmbeddedFrame()
const getServerSnapshot = () => false

export function AnalyticsGate({ children }: { children: React.ReactNode }) {
  const isTopLevel = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  if (!isTopLevel) return null
  return <>{children}</>
}
