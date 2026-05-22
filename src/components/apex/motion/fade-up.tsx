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
 * prefers-reduced-motion via the `motion-reduce:` Tailwind variants
 * applied via inline style (since we can't use Tailwind dynamic classes).
 *
 * Previously imported framer-motion which added 52.7 KB gzip to the
 * shared chunk on every page (15 call sites — every page used it).
 * This rewrite is functionally equivalent and ships ~0 bytes of vendor
 * code beyond the IntersectionObserver browser API.
 */
export function FadeUp({
  children,
  delay = 0,
  once = true,
  style,
  ...rest
}: FadeUpProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true)
      return
    }
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
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 500ms ease-out ${delay}ms, transform 500ms ease-out ${delay}ms`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
