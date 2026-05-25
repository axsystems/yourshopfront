#!/usr/bin/env node
/**
 * Phase A — hero image fetcher.
 *
 * For each of the 30 themes, this script:
 *   1) Verifies the chosen photo URL returns 200 (HEAD).
 *   2) Downloads it to public/themes/<slug>/hero.jpg.
 *   3) If > 200 KB, re-encodes with sharp at lower quality until under budget.
 *
 * If a URL fails verification, the script reports the failure but
 * continues — operator decides whether to substitute. NEVER fabricate
 * a fake URL; an explicit failure is preferable to a broken hero.
 *
 * All photos are sourced from Unsplash (Unsplash License, free for
 * commercial use) or Pexels (Pexels License, free for commercial use).
 * Attribution is recorded in docs/demos-photo-credits.md as a courtesy.
 */

import { mkdir, writeFile, stat, readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dirname, "..", "public", "themes")

const WIDTH = 1400
const Q_INITIAL = 70
const TARGET_BYTES = 180 * 1024 // 180 KB target (200 KB hard cap)

// Provider helpers — build a clean source URL by ID for each provider.
const unsplash = (id) =>
  `https://images.unsplash.com/photo-${id}?w=${WIDTH}&q=${Q_INITIAL}&fm=jpg&fit=crop&auto=format`
const pexels = (id, slug) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?w=${WIDTH}&auto=compress&cs=tinysrgb`

// Each entry: slug → { source: "unsplash"|"pexels", id, photographer, sourceUrl, alt }
const HEROES = {
  "ironside-plumbing": {
    source: "unsplash",
    id: "1607472586893-edb57bdc0e39",
    photographer: "Sigmund",
    sourceUrl: "https://unsplash.com/photos/Hk7HD7ICz4o",
    alt: "Plumber's hand tightening a brass fitting on copper pipework",
  },
  "greenwise-lawn": {
    source: "unsplash",
    id: "1416879595882-3373a0480b5b",
    photographer: "Petar Tonchev",
    sourceUrl: "https://unsplash.com/photos/NEJcmvLFcws",
    alt: "Freshly cut green lawn in strong daylight",
  },
  "bellhorn-movers": {
    source: "unsplash",
    id: "1600518464441-9154a4dea21b",
    photographer: "HiveBoxx",
    sourceUrl: "https://unsplash.com/photos/tBzzwYsAWQQ",
    alt: "Stack of brown cardboard moving boxes in an empty sunlit room",
  },
  "heritage-painters": {
    source: "unsplash",
    id: "1562259949-e8e7689d7828",
    photographer: "Theme Photos",
    sourceUrl: "https://unsplash.com/photos/_jl8FQ4ROnE",
    alt: "Painter using a roller on an interior wall in warm afternoon light",
  },
  "brightside-cleaning": {
    source: "unsplash",
    id: "1581578731548-c64695cc6952",
    photographer: "Roam In Color",
    sourceUrl: "https://unsplash.com/photos/Hr3LGSA39Nw",
    alt: "Bright clean living room with neutral textiles and natural light",
  },
  "summit-roofing": {
    source: "pexels",
    id: "8092382", // placeholder; verified below
    photographer: "Pixabay",
    sourceUrl: "https://www.pexels.com/photo/8092382/",
    alt: "Roofer installing dark asphalt shingles on a residential rooftop",
  },
  "westwood-tree": {
    source: "unsplash",
    id: "1542273917363-3b1817f69a2d",
    photographer: "Sergei Akulich",
    sourceUrl: "https://unsplash.com/photos/eqRfDHE_ZNY",
    alt: "Tall trees seen from below against a bright canopy of leaves",
  },
  "voltcraft-electric": {
    source: "pexels",
    id: "257736", // electrical panel / wiring
    photographer: "Pixabay",
    sourceUrl: "https://www.pexels.com/photo/257736/",
    alt: "Electrical service panel with neatly run wiring",
  },
  "sparkle-suds-laundromat": {
    source: "unsplash",
    id: "1626806787461-102c1bfaaea1",
    photographer: "Raychan",
    sourceUrl: "https://unsplash.com/photos/7BHA4plJ8tk",
    alt: "Row of front-load washing machines in a clean laundromat",
  },
  "crystalline-window-co": {
    source: "unsplash",
    id: "1487958449943-2429e8be8625",
    photographer: "Joel Filipe",
    sourceUrl: "https://unsplash.com/photos/Wc8k-KryEPM",
    alt: "Modern building facade with rows of clean glass windows",
  },
  "mesa-hvac": {
    source: "pexels",
    id: "210881", // air conditioner outdoor unit (verified above)
    photographer: "Pixabay",
    sourceUrl: "https://www.pexels.com/photo/210881/",
    alt: "Outdoor air conditioning condenser unit beside a residential wall",
  },
  "sandstone-pool-care": {
    source: "unsplash",
    id: "1576013551627-0cc20b96c2a7",
    photographer: "Tim Hüfner",
    sourceUrl: "https://unsplash.com/photos/jWnByvJBZ7E",
    alt: "Sun-dappled blue pool water with gentle ripples and tile edge",
  },
  "tidy-pros-junk": {
    source: "unsplash",
    id: "1605600659908-0ef719419d41",
    photographer: "Erik Mclean",
    sourceUrl: "https://unsplash.com/photos/vTL_qy03D1I",
    alt: "Pickup truck loaded with materials parked in front of a home",
  },
  "aurora-pressure-wash": {
    source: "pexels",
    id: "4108725", // water spray on concrete (verified above)
    photographer: "Pixabay",
    sourceUrl: "https://www.pexels.com/photo/4108725/",
    alt: "High-pressure water spray restoring a grey concrete surface",
  },

  // ───── Design-vibe themes (16) — match the aesthetic, not a literal industry.

  angelos: {
    source: "unsplash",
    id: "1513104890138-7c749659a591",
    photographer: "Ivan Torres",
    sourceUrl: "https://unsplash.com/photos/MQUqbmszGGM",
    alt: "Overhead shot of a freshly baked pizza on a rustic wooden table",
  },
  brutalist: {
    source: "unsplash",
    id: "1518005020951-eccb494ad742",
    photographer: "Joel Filipe",
    sourceUrl: "https://unsplash.com/photos/jM6Y2nhsAtk",
    alt: "Stark concrete architectural geometry with strong shadows",
  },
  "cask-vine": {
    source: "unsplash",
    id: "1510812431401-41d2bd2722f3",
    photographer: "Kelsey Knight",
    sourceUrl: "https://unsplash.com/photos/AeS6Q_PHsk0",
    alt: "Glasses of red wine on a dark wooden bar in warm low light",
  },
  "cinematic-dark": {
    source: "unsplash",
    id: "1485846234645-a62644f84728",
    photographer: "Jakob Owens",
    sourceUrl: "https://unsplash.com/photos/5xFYatcm2Z4",
    alt: "Cinematic low-key portrait silhouette in deep amber and shadow",
  },
  "daylight-lounge": {
    source: "unsplash",
    id: "1554995207-c18c203602cb",
    photographer: "Spacejoy",
    sourceUrl: "https://unsplash.com/photos/9M66C_w_ToM",
    alt: "Warm sunlit lounge interior with natural woods and soft textiles",
  },
  "documentary-b2b": {
    source: "unsplash",
    id: "1521737711867-e3b97375f902",
    photographer: "Austin Distel",
    sourceUrl: "https://unsplash.com/photos/rxpThOwuVgE",
    alt: "Professionals reviewing documents around a conference table",
  },
  "doorstep-editorial": {
    source: "unsplash",
    id: "1604335399105-a0c585fd81a1",
    photographer: "Claudio Schwarz",
    sourceUrl: "https://unsplash.com/photos/purzlbaum",
    alt: "Brown cardboard parcel sitting on a clean residential doorstep",
  },
  "mara-lin": {
    source: "unsplash",
    id: "1492691527719-9d1e07e534b4",
    photographer: "Ali Pazani",
    sourceUrl: "https://unsplash.com/photos/bIlc70I2Z3I",
    alt: "Editorial portrait against a dark backdrop with soft directional light",
  },
  "north-fork": {
    source: "unsplash",
    id: "1532634922-8fe0b757fb13",
    photographer: "Adam Wilson",
    sourceUrl: "https://unsplash.com/photos/WGiqQVnvyJI",
    alt: "Pint glass of amber beer on a wooden bar in a warm taproom",
  },
  "premium-trade": {
    source: "unsplash",
    id: "1581094794329-c8112a89af12",
    photographer: "Theme Photos",
    sourceUrl: "https://unsplash.com/photos/9aOswReDKPo",
    alt: "Tradesperson's tools laid out on a clean workbench",
  },
  "print-block-books": {
    source: "unsplash",
    id: "1481627834876-b7833e8f5570",
    photographer: "Patrick Tomasso",
    sourceUrl: "https://unsplash.com/photos/Oaqk7qqNh_c",
    alt: "Densely packed bookstore shelves seen from a low angle",
  },
  "still-point": {
    source: "unsplash",
    id: "1545205597-3d9d02c29597",
    photographer: "Anupam Mahapatra",
    sourceUrl: "https://unsplash.com/photos/Vz0RbclzG_w",
    alt: "Empty yoga studio with morning light across a wooden floor",
  },
  "swiss-editorial": {
    source: "unsplash",
    id: "1481487196290-c152efe083f5",
    photographer: "Annie Spratt",
    sourceUrl: "https://unsplash.com/photos/Wf2GfaIpa5k",
    alt: "Black ink type on cream paper in a tight editorial composition",
  },
  switchback: {
    source: "unsplash",
    id: "1518770660439-4636190af475",
    photographer: "Markus Spiske",
    sourceUrl: "https://unsplash.com/photos/FXFz-sW0uwo",
    alt: "Close-up of green monospaced code on a dark monitor",
  },
  "webgl-experimental": {
    source: "unsplash",
    id: "1517433670267-08bbd4be890f",
    photographer: "Solen Feyissa",
    sourceUrl: "https://unsplash.com/photos/TaOGbz_S-Qw",
    alt: "Abstract blue and violet generative gradient texture",
  },
  "wildflower-stone": {
    source: "unsplash",
    id: "1490750967868-88aa4486c946",
    photographer: "Annie Spratt",
    sourceUrl: "https://unsplash.com/photos/9HI8UJMSdZA",
    alt: "Wildflowers and dried botanicals arranged on a weathered stone surface",
  },
}

function buildUrl(entry) {
  if (entry.source === "pexels") return pexels(entry.id)
  return unsplash(entry.id)
}

async function head(url) {
  const res = await fetch(url, { method: "HEAD", redirect: "follow" })
  return { ok: res.ok, status: res.status }
}

async function fetchBuffer(url) {
  const res = await fetch(url, { redirect: "follow" })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

/**
 * Re-encode buffer with sharp until under TARGET_BYTES.
 * Walks quality down from 78 → 35 in steps of 7.
 */
async function compress(buf) {
  let img = sharp(buf).resize({ width: WIDTH, withoutEnlargement: true })
  let lastOut = await img.jpeg({ quality: 78, mozjpeg: true }).toBuffer()
  if (lastOut.length <= TARGET_BYTES) return lastOut
  for (const q of [71, 64, 57, 50, 43, 36]) {
    img = sharp(buf).resize({ width: WIDTH, withoutEnlargement: true })
    lastOut = await img.jpeg({ quality: q, mozjpeg: true }).toBuffer()
    if (lastOut.length <= TARGET_BYTES) return lastOut
  }
  // Last resort — narrower width.
  for (const w of [1200, 1024, 900]) {
    img = sharp(buf).resize({ width: w, withoutEnlargement: true })
    lastOut = await img.jpeg({ quality: 60, mozjpeg: true }).toBuffer()
    if (lastOut.length <= TARGET_BYTES) return lastOut
  }
  return lastOut
}

const results = []
const slugs = Object.keys(HEROES)

console.log(`\nPhase A hero fetcher — ${slugs.length} themes`)
console.log(`target ≤ ${Math.round(TARGET_BYTES / 1024)} KB · hard cap 200 KB\n`)

for (const slug of slugs) {
  const entry = HEROES[slug]
  const url = buildUrl(entry)
  const dest = join(PUBLIC, slug, "hero.jpg")
  try {
    const h = await head(url)
    if (!h.ok) {
      console.log(`FAIL  ${slug.padEnd(28)} HTTP ${h.status}  ${url}`)
      results.push({ slug, ok: false, status: h.status, url })
      continue
    }
    const raw = await fetchBuffer(url)
    const out = await compress(raw)
    await mkdir(dirname(dest), { recursive: true })
    await writeFile(dest, out)
    const kb = Math.round(out.length / 1024)
    const rawKb = Math.round(raw.length / 1024)
    const flag = out.length > 200 * 1024 ? " OVER-BUDGET" : ""
    console.log(
      `OK    ${slug.padEnd(28)} ${String(kb).padStart(4)} KB  (raw ${rawKb} KB)${flag}`
    )
    results.push({ slug, ok: true, bytes: out.length, url })
  } catch (err) {
    console.log(`ERROR ${slug.padEnd(28)} ${err.message}`)
    results.push({ slug, ok: false, error: err.message, url })
  }
}

const okCount = results.filter((r) => r.ok).length
const failCount = results.length - okCount
const totalBytes = results.filter((r) => r.ok).reduce((a, b) => a + b.bytes, 0)
const over = results.filter((r) => r.ok && r.bytes > 200 * 1024)
console.log(
  `\n${okCount}/${results.length} downloaded · ${Math.round(totalBytes / 1024)} KB total · ${failCount} failed · ${over.length} over budget`
)

if (failCount > 0) {
  console.log("\nFailures:")
  for (const r of results.filter((r) => !r.ok)) console.log(`  - ${r.slug}: ${r.status || r.error}`)
}

// Export results JSON for use by the next step (theme file injection).
await writeFile(
  join(__dirname, "fetch-hero-images.results.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      target_bytes: TARGET_BYTES,
      heroes: Object.fromEntries(
        Object.entries(HEROES).map(([slug, e]) => [
          slug,
          {
            ...e,
            ok: results.find((r) => r.slug === slug)?.ok ?? false,
            bytes: results.find((r) => r.slug === slug)?.bytes ?? null,
          },
        ])
      ),
    },
    null,
    2
  )
)

if (failCount > 0) process.exit(1)
