#!/usr/bin/env node
/**
 * Phase B1.5 — apply CTA background photos to theme files.
 *
 * Reads scripts/fetch-cta-images.results.json (must be present — run
 * scripts/fetch-cta-images.mjs first), then for each theme file:
 *
 *   - Replaces content.finalCta.backgroundImage.url
 *     `/themes/<slug>/hero.jpg`  →  `/themes/<slug>/cta-bg.jpg`
 *   - Replaces content.finalCta.backgroundImage.alt with the literal
 *     description of the NEW photo (from the results JSON).
 *
 * Only the url + alt lines inside the backgroundImage block are
 * rewritten — no other fields touched.
 *
 * One-shot utility; not wired into pnpm scripts.
 */

import { readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = join(__dirname, "..")
const THEMES_DIR = join(REPO, "src", "lib", "themes")

const results = JSON.parse(
  await readFile(join(__dirname, "fetch-cta-images.results.json"), "utf8")
)
const bgs = results.ctaBackgrounds

const fileMap = {
  "ironside-plumbing": "01-ironside-plumbing.ts",
  "greenwise-lawn": "02-greenwise-lawn.ts",
  "bellhorn-movers": "03-bellhorn-movers.ts",
  "heritage-painters": "04-heritage-painters.ts",
  "brightside-cleaning": "05-brightside-cleaning.ts",
  "summit-roofing": "06-summit-roofing.ts",
  "westwood-tree": "07-westwood-tree.ts",
  "voltcraft-electric": "08-voltcraft-electric.ts",
  "sparkle-suds-laundromat": "09-sparkle-suds-laundromat.ts",
  "crystalline-window-co": "10-crystalline-window-co.ts",
  "mesa-hvac": "11-mesa-hvac.ts",
  "sandstone-pool-care": "12-sandstone-pool-care.ts",
  "tidy-pros-junk": "13-tidy-pros-junk.ts",
  "aurora-pressure-wash": "14-aurora-pressure-wash.ts",
  angelos: "angelos.ts",
  brutalist: "brutalist.ts",
  "cask-vine": "cask-vine.ts",
  "cinematic-dark": "cinematic-dark.ts",
  "daylight-lounge": "daylight-lounge.ts",
  "documentary-b2b": "documentary-b2b.ts",
  "doorstep-editorial": "doorstep-editorial.ts",
  "mara-lin": "mara-lin.ts",
  "north-fork": "north-fork.ts",
  "premium-trade": "premium-trade.ts",
  "print-block-books": "print-block-books.ts",
  "still-point": "still-point.ts",
  "swiss-editorial": "swiss-editorial.ts",
  switchback: "switchback.ts",
  "webgl-experimental": "webgl-experimental.ts",
  "wildflower-stone": "wildflower-stone.ts",
}

let changed = 0
let missing = []
for (const [slug, filename] of Object.entries(fileMap)) {
  const bg = bgs[slug]
  if (!bg) {
    missing.push(slug + " (no results data)")
    continue
  }
  const path = join(THEMES_DIR, filename)
  let src = await readFile(path, "utf8")

  // Match the existing backgroundImage block.
  // Format expected (from Phase B1):
  //       backgroundImage: {
  //         url: "/themes/<slug>/hero.jpg",
  //         alt: "<old alt>",
  //       },
  const re = new RegExp(
    "backgroundImage:\\s*\\{\\s*\\n\\s*url:\\s*\"/themes/" +
      slug.replace(/[-]/g, "[-]") +
      "/hero\\.jpg\",\\s*\\n\\s*alt:\\s*\"([^\"]*)\",",
    "m"
  )
  const m = src.match(re)
  if (!m) {
    missing.push(slug + " (regex no-match)")
    continue
  }

  const newUrl = "/themes/" + slug + "/cta-bg.jpg"
  const newAlt = bg.alt.replace(/"/g, '\\"')
  const replacement =
    'backgroundImage: {\n        url: "' +
    newUrl +
    '",\n        alt: "' +
    newAlt +
    '",'

  const oldFull = m[0]
  src = src.replace(oldFull, replacement)
  await writeFile(path, src)
  changed++
  console.log(
    "OK   ".padEnd(6) +
      slug.padEnd(28) +
      " | old alt: " +
      m[1].slice(0, 45).padEnd(45) +
      " -> new: " +
      bg.alt.slice(0, 45)
  )
}

console.log(`\nChanged ${changed} files`)
if (missing.length) {
  console.log("\nProblems:")
  for (const m of missing) console.log("  - " + m)
  process.exit(1)
}
