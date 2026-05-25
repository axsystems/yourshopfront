#!/usr/bin/env node
/**
 * Your Shopfront — portfolio-demos cold-load font optimization
 *
 * The 24 demo HTML files in /public/portfolio-demos/ each load Google Fonts
 * via <link rel="stylesheet">. The current setup has:
 *   <link rel="preconnect" href="https://fonts.googleapis.com">
 *   <link href="https://fonts.googleapis.com/css2?...&display=swap" rel="stylesheet">
 *
 * This script idempotently adds the missing best-practice preconnect to
 * `fonts.gstatic.com` (where the font binaries actually live) with
 * `crossorigin`, plus ensures `&display=swap` is present on every
 * Google Fonts stylesheet URL (it already is on most files — the script
 * is a no-op for those).
 *
 * Why this matters: 24 iframes on /portfolio means 24 cold-load font
 * fetches. Adding the gstatic preconnect lets the browser establish the
 * binary connection in parallel with the CSS fetch, shaving ~50-100ms
 * off the cold-load path per demo. font-display: swap means text paints
 * in fallback before fonts resolve, so initial paint is unblocked.
 *
 * Run: pnpm node scripts/optimize-portfolio-demos.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const DEMOS = join(ROOT, "public", "portfolio-demos")

const GSTATIC_PRECONNECT =
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'

const files = readdirSync(DEMOS).filter((f) => f.endsWith(".html"))
let updated = 0
let alreadyOk = 0

for (const file of files) {
  const path = join(DEMOS, file)
  const original = readFileSync(path, "utf8")
  let next = original

  // 1. Add gstatic preconnect after the googleapis preconnect, if missing.
  if (!next.includes("fonts.gstatic.com")) {
    next = next.replace(
      /(<link\s+rel="preconnect"\s+href="https:\/\/fonts\.googleapis\.com"\s*\/?>)/,
      `$1\n${GSTATIC_PRECONNECT}`
    )
  }

  // 2. Add &display=swap to any Google Fonts stylesheet URL missing it.
  next = next.replace(
    /(<link\s+href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*?)"(\s+rel="stylesheet"\s*\/?>)/g,
    (_m, prefix, suffix) => {
      if (prefix.includes("display=swap")) return `${prefix}"${suffix}`
      return `${prefix}&display=swap"${suffix}`
    }
  )

  if (next !== original) {
    writeFileSync(path, next, "utf8")
    updated++
    console.log(`  ~ ${file}`)
  } else {
    alreadyOk++
  }
}

console.log(`\nUpdated ${updated} file(s); ${alreadyOk} already compliant.`)
