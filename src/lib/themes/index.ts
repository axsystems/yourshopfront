import type { Theme } from "./types"
import { ironsidePlumbing } from "./01-ironside-plumbing"
import { greenwiseLawn } from "./02-greenwise-lawn"
import { bellhornMovers } from "./03-bellhorn-movers"
import { heritagePainters } from "./04-heritage-painters"
import { brightsideCleaning } from "./05-brightside-cleaning"
import { summitRoofing } from "./06-summit-roofing"
import { westwoodTree } from "./07-westwood-tree"
import { voltcraftElectric } from "./08-voltcraft-electric"
import { modernMinimal } from "./09-modern-minimal"
import { luxuryEditorial } from "./10-luxury-editorial"

const all: Theme[] = [
  ironsidePlumbing,
  greenwiseLawn,
  bellhornMovers,
  heritagePainters,
  brightsideCleaning,
  summitRoofing,
  westwoodTree,
  voltcraftElectric,
  modernMinimal,
  luxuryEditorial,
]

export const themes: Record<string, Theme> = Object.fromEntries(
  all.map((t) => [t.slug, t])
)

export const themeSlugs = all.map((t) => t.slug)
export const themeList = all
export const defaultThemeSlug = "heritage-painters"
export const defaultTheme = themes[defaultThemeSlug]

export function getTheme(slug: string): Theme | undefined {
  return themes[slug]
}

export type { Theme } from "./types"
