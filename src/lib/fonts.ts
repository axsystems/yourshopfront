import {
  Inter,
  Archivo_Black,
  Fraunces,
  Bricolage_Grotesque,
  Plus_Jakarta_Sans,
  Oswald,
  Playfair_Display,
  JetBrains_Mono,
  Caveat,
} from "next/font/google"

import type { FontFamily, Theme } from "./themes/types"

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
  display: "swap",
})

export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
})

export const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage-grotesque",
  display: "swap",
})

export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
})

export const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
})

export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
})

const fontMap: Record<FontFamily, { variable: string }> = {
  inter,
  "archivo-black": archivoBlack,
  fraunces,
  "bricolage-grotesque": bricolageGrotesque,
  "plus-jakarta-sans": plusJakartaSans,
  oswald,
  "playfair-display": playfairDisplay,
  "jetbrains-mono": jetbrainsMono,
  caveat,
}

/**
 * Returns the className for a single font (which sets its CSS var on the
 * element it's applied to). Used by ThemeProvider to subset font loading
 * — only the active theme's display/body/mono fonts get preloaded on
 * a given page, instead of loading all 9 globally.
 */
export function fontClassName(family: FontFamily): string {
  return fontMap[family].variable
}

/**
 * Returns a deduplicated, space-joined className string covering the
 * theme's display, body, and mono fonts.
 */
export function themeFontClassNames(theme: Theme): string {
  const set = new Set<string>([
    fontMap[theme.fonts.display].variable,
    fontMap[theme.fonts.body].variable,
    fontMap[theme.fonts.mono].variable,
  ])
  return Array.from(set).join(" ")
}

/**
 * Your Shopfront chrome global font className. Loaded once on every page via root layout.
 * Inter (body + display in chrome) + JetBrains Mono (prices, mono eyebrows, code).
 *
 * Per-theme pages additionally wrap in <ThemeProvider> which adds the active
 * theme's display + body + mono fonts. next/font/google deduplicates the same
 * font across the build, so a /demos/[slug] page where the theme uses Inter +
 * Fraunces + JetBrains Mono ends up loading: Inter, JetBrains Mono, Fraunces
 * — exactly the chrome two plus one extra. No regression in font count.
 */
export const baseFontClassName = `${inter.variable} ${jetbrainsMono.variable}`
