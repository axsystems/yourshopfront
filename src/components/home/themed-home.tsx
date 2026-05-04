import * as React from "react"

import type { Theme } from "@/lib/themes/types"
import { SiteFooter, SiteHeader } from "@/components/apex"
import { ThemeProvider } from "@/components/theme-provider"

import { Hero } from "./hero"
import { TrustStrip } from "./trust-strip"
import { HowItWorks } from "./how-it-works"
import { Pricing } from "./pricing"
import { Showcase } from "./showcase"
import { FAQ } from "./faq"
import { FinalCTA } from "./final-cta"

interface ThemedHomeProps {
  theme: Theme
  isDemoPreview?: boolean
}

/**
 * Themed home composition. Used by /demos/[slug] and /portfolio/[slug] (the
 * themed surfaces) — NOT by `/`, which has its own Apex-branded composition
 * since Phase 2.
 *
 * After Phase 4: Apex chrome <SiteHeader variant="themed"> + <SiteFooter
 * variant="themed"> wrap the themed body. The DemoSwitcher (rendered globally
 * in src/app/layout.tsx for themed paths) sits as a sticky sub-nav between
 * the header and Hero.
 */
export function ThemedHome({ theme, isDemoPreview }: ThemedHomeProps) {
  return (
    <ThemeProvider theme={theme}>
      <SiteHeader variant="themed" />
      <Hero
        theme={theme}
        isDemoPreview={isDemoPreview}
        ctaPrimaryHref={
          isDemoPreview
            ? `/checkout?tier=subscription&demo=${theme.slug}`
            : "/checkout?tier=subscription"
        }
      />
      <TrustStrip theme={theme} />
      <div id="how">
        <HowItWorks theme={theme} />
      </div>
      <Pricing theme={theme} demoSlug={isDemoPreview ? theme.slug : undefined} />
      <Showcase theme={theme} activeSlug={isDemoPreview ? theme.slug : undefined} />
      <FAQ theme={theme} />
      <FinalCTA theme={theme} />
      <SiteFooter variant="themed" />
    </ThemeProvider>
  )
}
