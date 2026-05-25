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

/**
 * Themed hero photo. Lives in `public/themes/<slug>/hero.jpg` (served
 * same-origin, so it works with the strict img-src CSP without remote
 * patterns). `alt` describes the literal image content only — never
 * fabricates business claims. `credit` is for the audit trail in
 * `docs/demos-photo-credits.md`; not rendered on the customer surface.
 *
 * Required for the 30 marketing themes shipped in Phase A.
 */
export interface ThemeHeroImage {
  /** Public-folder URL, e.g. "/themes/summit-roofing/hero.jpg". */
  url: string
  /** Literal image description. Never a business claim. */
  alt: string
  /** Photographer + source for the credits file. */
  credit: string
}

/**
 * Phase B content overrides. Optional per-theme strings + image paths that
 * let HowItWorks, TrustStrip, and FinalCTA render industry-relevant copy
 * and stock photography instead of the generic Apex-templated defaults.
 *
 * Every field is optional — when omitted, the section falls back to the
 * existing hardcoded defaults so Phase B can roll out theme-by-theme
 * without regressing un-migrated demos.
 *
 * Image URLs follow the Phase A convention: same-origin paths under
 * `public/themes/<slug>/...` (e.g. `/themes/summit-roofing/step-1.jpg`).
 */
export interface ThemeStepOverride {
  /** Step heading. Overrides the default "Pick a style"-style copy. */
  title: string
  /** Step body copy. Should be industry-specific to feel custom. */
  body: string
  /** Optional photo rendered above the step content. */
  image?: { url: string; alt: string }
}

export interface ThemeStatOverride {
  value: string
  label: string
  caption: string
}

export interface ThemeFinalCtaOverride {
  /** Headline preceding the highlighted span. */
  headline?: string
  /** Highlighted phrase rendered in primary color. */
  highlight?: string
  /** Sub-headline body copy under the headline. */
  body?: string
  /** Primary CTA button label. */
  ctaLabel?: string
  /**
   * Optional full-bleed background photo. When set, the FinalCTA renders
   * with the photo behind a dark scrim so the inverted text remains
   * readable; the chat card preview floats over the photo.
   */
  backgroundImage?: { url: string; alt: string }
}

export interface ThemeContentOverrides {
  /** Industry-specific copy + photos for the HowItWorks 4-step grid. */
  howItWorks?: {
    /** Exactly 4 steps — must mirror the existing step count. */
    steps: [ThemeStepOverride, ThemeStepOverride, ThemeStepOverride, ThemeStepOverride]
  }
  /** Industry-specific stats for the TrustStrip. */
  trustStrip?: {
    /** Exactly 4 cells — must mirror the existing cell count. */
    stats: [ThemeStatOverride, ThemeStatOverride, ThemeStatOverride, ThemeStatOverride]
  }
  /** Industry-specific FinalCTA copy + optional full-bleed photo. */
  finalCta?: ThemeFinalCtaOverride
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
  /** Phase A hero photo. Required for the 30 marketing themes. */
  heroImage: ThemeHeroImage
  seoTitle: string
  seoDescription: string
  /** True = offered as a switchable theme option (currently every theme is `true`). The homepage curated grid is gated separately on `featuredThemeSlugs` (10 picks); non-featured themes are reachable at `/demos/[slug]` and `/portfolio/[slug]`. */
  isThemeOption: boolean
  /** Filename of the source demo HTML inside the demos folder, used for portfolio static rendering. */
  sourceHtmlPath: string
  /** Design round (1 = abstract concepts, 2 = brand personalities, 3 = home-service brands). */
  round: 1 | 2 | 3
  /**
   * Phase B: optional per-theme content + imagery overrides for the
   * HowItWorks, TrustStrip, and FinalCTA sections. When omitted, each
   * section renders its generic Apex-templated default. Populated per
   * theme in Phase B1.
   */
  content?: ThemeContentOverrides
}
