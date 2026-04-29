export type ThemeMode = "emergency" | "recurring" | "project"

export type ThemeVibe =
  | "bold-industrial"
  | "warm-premium"
  | "friendly-modern"
  | "naturalist"
  | "sleek-tech"
  | "luxury-editorial"

export type ThemeHero =
  | "phone-first"
  | "calculator"
  | "gallery"
  | "booking-card"
  | "form-card"

export type FontFamily =
  | "inter"
  | "archivo-black"
  | "fraunces"
  | "bricolage-grotesque"
  | "plus-jakarta-sans"
  | "oswald"
  | "playfair-display"
  | "jetbrains-mono"
  | "caveat"

export interface ThemeColors {
  bg: string
  fg: string
  primary: string
  primaryFg: string
  accent: string
  accentFg: string
  muted: string
  mutedFg: string
  border: string
  surface: string
  surfaceFg: string
}

export interface ThemeFonts {
  display: FontFamily
  body: FontFamily
  mono: FontFamily
}

export interface ThemeRadius {
  sm: string
  md: string
  lg: string
  pill: string
}

export interface ThemeButton {
  shape: "pill" | "sharp" | "rounded"
  shadow: "none" | "soft" | "hard-offset" | "glow"
  weight: "regular" | "bold" | "heavy"
  uppercase: boolean
}

export interface Theme {
  slug: string
  name: string
  industry: string
  city: string
  tagline: string
  description: string
  mode: ThemeMode
  vibe: ThemeVibe
  hero: ThemeHero
  heroEyebrow: string
  colors: ThemeColors
  fonts: ThemeFonts
  radius: ThemeRadius
  button: ThemeButton
  seoTitle: string
  seoDescription: string
}
