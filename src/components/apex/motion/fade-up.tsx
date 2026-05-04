"use client"

import * as React from "react"
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion"

interface FadeUpProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: React.ReactNode
  /** ms delay before the animation starts. 0 = no delay. */
  delay?: number
  /** Once true, replay disabled. Default true (animations only run once). */
  once?: boolean
}

/**
 * Fade-up-on-scroll-into-view. 24px translateY + opacity, 500ms, ease-out.
 * Per master brief §8 motion budget. Respects prefers-reduced-motion: opacity
 * transition only when reduced motion is requested.
 */
export function FadeUp({
  children,
  delay = 0,
  once = true,
  ...rest
}: FadeUpProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay: delay / 1000 }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
