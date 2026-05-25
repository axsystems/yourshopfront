#!/usr/bin/env node
/**
 * Reads scripts/fetch-hero-images.results.json and injects a
 * `heroImage: { url, alt, credit }` field into every theme file in
 * src/lib/themes/<slug>.ts that doesn't already have one.
 *
 * Insertion point: after the `button: { ... }` line. Idempotent — re-runs
 * are no-ops once heroImage is present.
 */

import { readFile, writeFile, readdir } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const THEMES_DIR = join(__dirname, "..", "src", "lib", "themes")
const RESULTS = JSON.parse(
  await readFile(join(__dirname, "fetch-hero-images.results.json"), "utf8")
)

// slug → expected theme filename (one of the 30). The bare-slug themes
// (angelos, brutalist, …) use their slug as filename; the prefixed
// home-service themes (01-…, 02-…) have a numeric prefix.
const FILES = await readdir(THEMES_DIR)
function fileFor(slug) {
  const direct = `${slug}.ts`
  if (FILES.includes(direct)) return direct
  const numbered = FILES.find((f) => f.replace(/^\d+-/, "").replace(/\.ts$/, "") === slug)
  if (numbered) return numbered
  throw new Error(`No theme file found for slug ${slug}`)
}

function escapeForTemplate(s) {
  // Plain double-quoted JS string. We control all inputs, but be safe
  // anyway in case a photographer name has an apostrophe.
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

let touched = 0
let skipped = 0

for (const [slug, entry] of Object.entries(RESULTS.heroes)) {
  if (!entry.ok) {
    console.log(`SKIP ${slug} (fetch failed)`)
    skipped++
    continue
  }
  const file = fileFor(slug)
  const path = join(THEMES_DIR, file)
  const src = await readFile(path, "utf8")
  if (src.includes("heroImage:")) {
    console.log(`SKIP ${slug} (heroImage already present)`)
    skipped++
    continue
  }

  const url = `/themes/${slug}/hero.jpg`
  const alt = escapeForTemplate(entry.alt)
  const credit = escapeForTemplate(
    `Photo by ${entry.photographer} on ${entry.source === "pexels" ? "Pexels" : "Unsplash"}`
  )
  const block = `  heroImage: {\n    url: "${url}",\n    alt: "${alt}",\n    credit: "${credit}",\n  },\n`

  // Insert after the line containing `button: {`. The button object is a
  // single-line literal in every current theme file.
  const buttonLineRe = /^(\s*button:\s*\{[^}]*\},\s*)$/m
  const m = src.match(buttonLineRe)
  if (!m) {
    console.log(`FAIL ${slug} — could not locate button: line in ${file}`)
    skipped++
    continue
  }

  const updated = src.replace(buttonLineRe, `${m[1]}\n${block}`)
  await writeFile(path, updated)
  console.log(`OK   ${slug.padEnd(28)} ${file}`)
  touched++
}

console.log(`\n${touched} files updated · ${skipped} skipped`)
