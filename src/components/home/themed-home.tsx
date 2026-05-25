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
import { MobileStickyCta } from "./mobile-sticky-cta"

interface ThemedHomeProps {
  theme: Theme
  isDemoPreview?: boolean
}

/**
 * Themed home composition. Used by /demos/[slug] and /portfolio/[slug] (the
 * themed surfaces) — NOT by `/`, which has its own Your Shopfront–branded composition
 * since Phase 2.
 *
 * After Phase 4: Your Shopfront chrome <SiteHeader variant="themed"> + <SiteFooter
 * variant="themed"> wrap the themed body. The DemoSwitcher (rendered globally
 * in src/app/layout.tsx for themed paths) sits as a sticky sub-nav between
 * the header and Hero.
 */
export function ThemedHome({ theme, isDemoPreview }: ThemedHomeProps) {
  const demoCheckoutHref = `/checkout?tier=subscription&demo=${theme.slug}`
  return (
    <ThemeProvider theme={theme}>
      <SiteHeader variant="themed" />
      {/* `pb-20` on mobile only — clears the fixed `<MobileStickyCta>` so the
          last bit of FinalCTA doesn't sit behind it. Desktop unaffected. */}
      <main id="main" className={isDemoPreview ? "flex-1 pb-20 md:pb-0" : "flex-1"}>
        <Hero
          theme={theme}
          isDemoPreview={isDemoPreview}
          ctaPrimaryHref={
            isDemoPreview ? demoCheckoutHref : "/checkout?tier=subscription"
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
            ctaPrimaryHref={isDemoPreview ? demoCheckoutHref : "#showcase"}
          />
        </FadeUp>
      </main>
      <SiteFooter variant="themed" />
      {isDemoPreview && (
        <MobileStickyCta theme={theme} ctaHref={demoCheckoutHref} />
      )}
    </ThemeProvider>
  )
}
