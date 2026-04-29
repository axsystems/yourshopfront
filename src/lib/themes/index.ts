import type { Theme } from "./types"

// Round 3 — home-service brands (8 themes, all theme options).
import { ironsidePlumbing } from "./01-ironside-plumbing"
import { greenwiseLawn } from "./02-greenwise-lawn"
import { bellhornMovers } from "./03-bellhorn-movers"
import { heritagePainters } from "./04-heritage-painters"
import { brightsideCleaning } from "./05-brightside-cleaning"
import { summitRoofing } from "./06-summit-roofing"
import { westwoodTree } from "./07-westwood-tree"
import { voltcraftElectric } from "./08-voltcraft-electric"

// Round 1 — abstract concepts (8 pieces, 2 promoted to options).
import { daylightLounge } from "./daylight-lounge"
import { doorstepEditorial } from "./doorstep-editorial"
import { documentaryB2b } from "./documentary-b2b"
import { premiumTrade } from "./premium-trade"
import { swissEditorial } from "./swiss-editorial"
import { cinematicDark } from "./cinematic-dark"
import { webglExperimental } from "./webgl-experimental"
import { brutalist } from "./brutalist"

// Round 2 — brand personalities (8 portfolio pieces).
import { printBlockBooks } from "./print-block-books"
import { wildflowerStone } from "./wildflower-stone"
import { angelos } from "./angelos"
import { stillPoint } from "./still-point"
import { northFork } from "./north-fork"
import { caskVine } from "./cask-vine"
import { maraLin } from "./mara-lin"
import { switchback } from "./switchback"

const all: Theme[] = [
  // Round 3 — all 8 are theme options.
  ironsidePlumbing,
  greenwiseLawn,
  bellhornMovers,
  heritagePainters,
  brightsideCleaning,
  summitRoofing,
  westwoodTree,
  voltcraftElectric,
  // Round 1 — 2 promoted theme options (premiumTrade, doorstepEditorial), 6 portfolio.
  daylightLounge,
  doorstepEditorial,
  documentaryB2b,
  premiumTrade,
  swissEditorial,
  cinematicDark,
  webglExperimental,
  brutalist,
  // Round 2 — 0 promoted, 8 portfolio.
  printBlockBooks,
  wildflowerStone,
  angelos,
  stillPoint,
  northFork,
  caskVine,
  maraLin,
  switchback,
]

/** All 24 themes keyed by slug. */
export const allThemes: Record<string, Theme> = Object.fromEntries(
  all.map((t) => [t.slug, t])
)

/** The 10 themes offered as switchable options on the homepage / demo switcher. */
export const themeOptions: Theme[] = all.filter((t) => t.isThemeOption)

/** The 14 themes that live as standalone branded portfolio pages (not switchable). */
export const portfolioOnly: Theme[] = all.filter((t) => !t.isThemeOption)

/** Slugs for the 10 switchable themes. Used by /demos/[slug] and the demo switcher. */
export const themeOptionSlugs: string[] = themeOptions.map((t) => t.slug)

/** Slugs for the 14 portfolio-only pieces. Used by /portfolio/[slug] (future). */
export const portfolioSlugs: string[] = portfolioOnly.map((t) => t.slug)

// ---------------------------------------------------------------------------
// Backward-compatible aliases (existing components use these names).
// ---------------------------------------------------------------------------

/** @deprecated Use `allThemes`. */
export const themes: Record<string, Theme> = allThemes

/** @deprecated Use `themeOptionSlugs`. */
export const themeSlugs: string[] = themeOptionSlugs

/** @deprecated Use `themeOptions`. */
export const themeList: Theme[] = themeOptions

export const defaultThemeSlug = "heritage-painters"
export const defaultTheme = allThemes[defaultThemeSlug]

export function getTheme(slug: string): Theme | undefined {
  return allThemes[slug]
}

export type { Theme } from "./types"
