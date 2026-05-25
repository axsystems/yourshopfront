import * as React from "react"

import type { Theme } from "@/lib/themes/types"
import { SiteFooter, SiteHeader } from "@/components/apex"
import { FadeUp } from "@/components/apex/motion/fade-up"
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
      <main id="main" className="flex-1">
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
        <FadeUp id="how">
          <HowItWorks theme={theme} />
        </FadeUp>
        {/* Phase B2 — `Pricing`, `Showcase`, and `FAQ` are Apex-meta content.
            Hiding them on `/demos/[slug]` lets each demo read as the imagined
            business's own site (per `project_demos_north_star` memory). The
            global `<DemoSwitcher>` + `<SiteHeader variant="themed">` still
            expose Apex chrome for navigation. `/portfolio/[slug]` keeps the
            full meta-aware layout for SEO inspiration. */}
        {!isDemoPreview && (
          <>
            <Pricing theme={theme} />
            <Showcase theme={theme} />
            <FadeUp>
              <FAQ theme={theme} />
            </FadeUp>
          </>
        )}
        <FadeUp>
          <FinalCTA
            theme={theme}
            ctaPrimaryHref={
              isDemoPreview
                ? `/checkout?tier=subscription&demo=${theme.slug}`
                : "#showcase"
            }
          />
        </FadeUp>
      </main>
      <SiteFooter variant="themed" />
    </ThemeProvider>
  )
}
