"use client"

import * as React from "react"

/**
 * Props are deliberately compatible with the previous framer-motion-based
 * FadeUp so the 15 import sites compile unchanged. The `...rest` props are
 * spread onto a plain <div>; framer-specific props like `whileHover` or
 * `initial` were not used at any of the 15 call sites.
 */
interface FadeUpProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  /** ms delay before the animation starts. 0 = no delay. */
  delay?: number
  /** Once true, replay disabled. Default true (animations only run once). */
  once?: boolean
}

/**
 * Fade-up-on-scroll-into-view. CSS + IntersectionObserver — no
 * framer-motion. 24px translateY + opacity, 500ms ease-out. Respects
 * prefers-reduced-motion at runtime via `window.matchMedia` — when the
 * user has reduced motion enabled, the element appears immediately
 * with no transition.
 *
 * Previously imported framer-motion which added 52.7 KB gzip to the
 * shared chunk on every page (15 call sites — every page used it).
 * This rewrite is functionally equivalent and ships ~0 bytes of vendor
 * code beyond the IntersectionObserver browser API.
 */
// Subscribe to prefers-reduced-motion via useSyncExternalStore so React 19's
// set-state-in-effect lint rule is satisfied. The lazy initial value comes from
// matchMedia at first render; SSR returns false (default = animate).
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

function subscribeReducedMotion(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  const mq = window.matchMedia(REDUCED_MOTION_QUERY)
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

function getReducedMotionServerSnapshot(): boolean {
  return false
}

export function FadeUp({
  children,
  delay = 0,
  once = true,
  style,
  ...rest
}: FadeUpProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduce = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  )
  // Lazy initial: if IntersectionObserver is missing (very old browser or
  // SSR-then-hydrate where the snapshot is computed at mount), start visible.
  const [visible, setVisible] = React.useState(
    () => typeof window !== "undefined" && typeof IntersectionObserver === "undefined",
  )

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          if (once) obs.disconnect()
        } else if (!once) {
          setVisible(false)
        }
      },
      { rootMargin: "-50px 0px" }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [once])

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : reduce ? "none" : "translateY(24px)",
        transition: reduce
          ? "opacity 1ms"
          : `opacity 500ms ease-out ${delay}ms, transform 500ms ease-out ${delay}ms`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
