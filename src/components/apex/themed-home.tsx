import * as React from "react"

import type { Theme } from "@/lib/themes/types"
import { ThemeProvider } from "@/components/theme-provider"

import { Hero } from "./hero"
import { TrustStrip } from "./trust-strip"
import { HowItWorks } from "./how-it-works"
import { Pricing } from "./pricing"
import { Showcase } from "./showcase"
import { FAQ } from "./faq"
import { FinalCTA } from "./final-cta"
import { Footer } from "./footer"

interface ThemedHomeProps {
  theme: Theme
  isDemoPreview?: boolean
}

export function ThemedHome({ theme, isDemoPreview }: ThemedHomeProps) {
  return (
    <ThemeProvider theme={theme}>
      <Hero
        theme={theme}
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
      <Footer theme={theme} />
    </ThemeProvider>
  )
}
