import type { Theme } from "./types"

// Round 3 — home-service brands (8).
import { ironsidePlumbing } from "./01-ironside-plumbing"
import { greenwiseLawn } from "./02-greenwise-lawn"
import { bellhornMovers } from "./03-bellhorn-movers"
import { heritagePainters } from "./04-heritage-painters"
import { brightsideCleaning } from "./05-brightside-cleaning"
import { summitRoofing } from "./06-summit-roofing"
import { westwoodTree } from "./07-westwood-tree"
import { voltcraftElectric } from "./08-voltcraft-electric"

// Round 1 — abstract concepts (8).
import { daylightLounge } from "./daylight-lounge"
import { doorstepEditorial } from "./doorstep-editorial"
import { documentaryB2b } from "./documentary-b2b"
import { premiumTrade } from "./premium-trade"
import { swissEditorial } from "./swiss-editorial"
import { cinematicDark } from "./cinematic-dark"
import { webglExperimental } from "./webgl-experimental"
import { brutalist } from "./brutalist"

// Round 2 — brand personalities (8).
import { printBlockBooks } from "./print-block-books"
import { wildflowerStone } from "./wildflower-stone"
import { angelos } from "./angelos"
import { stillPoint } from "./still-point"
import { northFork } from "./north-fork"
import { caskVine } from "./cask-vine"
import { maraLin } from "./mara-lin"
import { switchback } from "./switchback"

const all: Theme[] = [
  ironsidePlumbing,
  greenwiseLawn,
  bellhornMovers,
  heritagePainters,
  brightsideCleaning,
  summitRoofing,
  westwoodTree,
  voltcraftElectric,
  daylightLounge,
  doorstepEditorial,
  documentaryB2b,
  premiumTrade,
  swissEditorial,
  cinematicDark,
  webglExperimental,
  brutalist,
  printBlockBooks,
  wildflowerStone,
  angelos,
  stillPoint,
  northFork,
  caskVine,
  maraLin,
  switchback,
]

/** All 24 themes keyed by slug. After Phase 2.5 every theme is purchasable. */
export const allThemes: Record<string, Theme> = Object.fromEntries(
  all.map((t) => [t.slug, t])
)

export const allThemesList: Theme[] = all
export const allThemeSlugs: string[] = all.map((t) => t.slug)

/**
 * The 10 themes featured in the curated homepage Showcase grid and in
 * the DemoSwitcher's sticky strip. All 24 are buyable, but these 10 are
 * the front-of-store picks: 8 home-service brand demos (R3) plus the 2
 * R1 promotions (premiumTrade, doorstepEditorial). Order is the order
 * they render in the grid.
 */
export const featuredThemeSlugs: readonly string[] = [
  "ironside-plumbing",
  "bellhorn-movers",
  "heritage-painters",
  "brightside-cleaning",
  "summit-roofing",
  "westwood-tree",
  "voltcraft-electric",
  "greenwise-lawn",
  "premium-trade",
  "doorstep-editorial",
] as const

export const featuredThemes: Theme[] = featuredThemeSlugs.map((slug) => {
  const theme = allThemes[slug]
  if (!theme) throw new Error(`featuredThemeSlugs references unknown slug: ${slug}`)
  return theme
})

export function isFeatured(slug: string): boolean {
  return featuredThemeSlugs.includes(slug)
}

export const defaultThemeSlug = "heritage-painters"
export const defaultTheme = allThemes[defaultThemeSlug]

export function getTheme(slug: string): Theme | undefined {
  return allThemes[slug]
}

// ---------------------------------------------------------------------------
// Back-compat aliases. After Phase 2.5 the option/portfolio split no longer
// exists — these now point at featured/all so existing call sites keep working
// while we update them in this same change.
// ---------------------------------------------------------------------------

/** @deprecated Use `allThemes`. */
export const themes: Record<string, Theme> = allThemes

/** @deprecated Use `featuredThemeSlugs` (curated 10) or `allThemeSlugs` (all 24). */
export const themeOptionSlugs: readonly string[] = featuredThemeSlugs

/** @deprecated Use `featuredThemes` (curated 10) or `allThemesList` (all 24). */
export const themeOptions: Theme[] = featuredThemes

/** @deprecated Use `featuredThemes`. */
export const themeList: Theme[] = featuredThemes

/** @deprecated The portfolio/option split is gone. Always returns []. */
export const portfolioOnly: Theme[] = []

/** @deprecated Use `allThemeSlugs`. */
export const portfolioSlugs: string[] = allThemeSlugs

/** @deprecated Use `allThemeSlugs`. */
export const themeSlugs: readonly string[] = allThemeSlugs

export type { Theme } from "./types"
