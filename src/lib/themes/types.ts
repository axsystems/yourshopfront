export type ThemeMode = "emergency" | "recurring" | "project"

export type ThemeVibe =
  | "bold-industrial"
  | "warm-premium"
  | "friendly-modern"
  | "naturalist"
  | "sleek-tech"

export type HeroPattern =
  | "phone-first"
  | "calculator"
  | "gallery"
  | "booking-card"
  | "form-card"

/** Backward-compatible alias for the renamed type. */
export type ThemeHero = HeroPattern

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

/**
 * An alternate palette for a theme. Same shape, vibe-coherent — used by the
 * /demos/[slug] palette picker to let prospects preview a sibling color way
 * without leaving the page. Default palette stays canonical (in `theme.colors`)
 * so SEO/OG/sitemap remain stable.
 */
export interface ColorVariant {
  /** Short label for the picker UI, e.g. "Mint Fresh", "Midnight Amber". */
  name: string
  colors: ThemeColors
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
  hero: HeroPattern
  heroEyebrow: string
  colors: ThemeColors
  /**
   * Optional sibling palettes shown by the /demos/[slug] palette picker.
   * 0 = no variants (picker hidden); 2 is the recommended count. Variants
   * are the same vibe in a different color way — not a different theme.
   */
  colorVariants?: ColorVariant[]
  fonts: ThemeFonts
  radius: ThemeRadius
  button: ThemeButton
  seoTitle: string
  seoDescription: string
  /** True = offered as a switchable theme option (currently every theme is `true`). The homepage curated grid is gated separately on `featuredThemeSlugs` (10 picks); non-featured themes are reachable at `/demos/[slug]` and `/portfolio/[slug]`. */
  isThemeOption: boolean
  /** Filename of the source demo HTML inside the demos folder, used for portfolio static rendering. */
  sourceHtmlPath: string
  /** Design round (1 = abstract concepts, 2 = brand personalities, 3 = home-service brands). */
  round: 1 | 2 | 3
}
