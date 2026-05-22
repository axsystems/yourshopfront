#!/usr/bin/env node
/**
 * Apex Sites — brand PNG export
 *
 * Rasterizes the SVG masters in /public/brand/ to PNG variants at the spec sizes.
 * Reproducible: run `pnpm brand:export` after editing any SVG master and the PNGs
 * regenerate deterministically.
 *
 * Outputs:
 *   /public/logo.png                  1024x1024 (referenced by src/lib/seo.ts JSON-LD)
 *   /public/favicon-16.png            16x16
 *   /public/favicon-32.png            32x32
 *   /public/apple-touch-icon.png      180x180
 *   /public/icon-192.png              192x192 (manifest)
 *   /public/icon-512.png              512x512 (manifest)
 *   /public/og-default.png            1200x630 (OG fallback)
 *
 * Sources (SVG masters in /public/brand/):
 *   apex-logo-square.svg   — paper bg + centered mark, 1024x1024 viewBox
 *   og-default.svg         — full OG composition, 1200x630 viewBox
 *
 * Notes:
 *  - At 16x16, the cobalt counter detail in the mark may be 1-2px tall. Sharp's
 *    rasterizer handles this acceptably. If the mark looks muddy at 16x16, swap
 *    apex-logo-square for apex-mark-mono in this script's logoSrc and re-run.
 *  - The OG SVG embeds Inter and JetBrains Mono via system font stacks. Sharp
 *    relies on librsvg (bundled) which uses Pango/Fontconfig — on most systems
 *    this resolves to Helvetica/Arial fallbacks for OG-default rendering. That's
 *    acceptable for an OG fallback image; for the canonical OG art we have the
 *    dynamic /api/og/[slug] route.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const PUBLIC = join(ROOT, "public")
const BRAND = join(PUBLIC, "brand")

const logoSrc = readFileSync(join(BRAND, "apex-logo-square.svg"))
const ogSrc = readFileSync(join(BRAND, "og-default.svg"))

const targets = [
  { src: logoSrc, out: join(PUBLIC, "logo.png"), w: 1024, h: 1024 },
  { src: logoSrc, out: join(PUBLIC, "favicon-16.png"), w: 16, h: 16 },
  { src: logoSrc, out: join(PUBLIC, "favicon-32.png"), w: 32, h: 32 },
  { src: logoSrc, out: join(PUBLIC, "apple-touch-icon.png"), w: 180, h: 180 },
  { src: logoSrc, out: join(PUBLIC, "icon-192.png"), w: 192, h: 192 },
  { src: logoSrc, out: join(PUBLIC, "icon-512.png"), w: 512, h: 512 },
  { src: ogSrc, out: join(PUBLIC, "og-default.png"), w: 1200, h: 630 },
]

if (!existsSync(BRAND)) mkdirSync(BRAND, { recursive: true })

let count = 0
for (const t of targets) {
  // Density 300 is enough to oversample any of our SVGs at the requested
  // raster size while keeping memory reasonable. We do NOT scale density
  // by output width — that's what blew the pixel limit.
  await sharp(t.src, { density: 300 })
    .resize(t.w, t.h, { fit: "fill" })
    .png({ compressionLevel: 9 })
    .toFile(t.out)
  console.log(`  + ${t.out.replace(ROOT, ".")}  ${t.w}x${t.h}`)
  count++
}

console.log(`\nExported ${count} PNG(s).`)
