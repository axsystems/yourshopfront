#!/usr/bin/env node
/**
 * Phase B1.5 — FinalCTA background image fetcher.
 *
 * For each of the 30 themes, this script:
 *   1) Verifies the chosen photo URL returns 200 (HEAD).
 *   2) Downloads it to public/themes/<slug>/cta-bg.jpg.
 *   3) If > 200 KB, re-encodes with sharp at lower quality until under budget.
 *
 * This is the B1.5 sibling of Phase A's `fetch-hero-images.mjs`. Same
 * architecture, same providers, same compression pipeline — different
 * output filename (`cta-bg.jpg`) and a separate curated photo list
 * picked to read as a full-bleed background behind text + scrim.
 *
 * Every chosen photo is distinct from the theme's Phase A hero so the
 * FinalCTA doesn't visually repeat the hero. Industry-coherent where
 * possible; atmospheric otherwise. See selection rationale and
 * attribution in `docs/demos-photo-credits.md` under the
 * "CTA background photos — Phase B1.5" section.
 *
 * If a URL fails verification, the script reports the failure but
 * continues — operator decides whether to substitute. NEVER fabricate
 * a fake URL; an explicit failure is preferable to a broken bg.
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
// Every entry verified against the Phase A heroes list — no duplicates.
const CTA_BGS = {
  // ───── Industry-specific themes (14) — service photo, not the hero.

  "ironside-plumbing": {
    source: "unsplash",
    id: "1626713748868-58643bf60860",
    photographer: "Rhodi Lopez",
    sourceUrl: "https://unsplash.com/photos/black-and-white-truck-on-road-during-daytime-yb8Z-IaxemM",
    alt: "Black and white work truck on a road during daytime",
  },
  "greenwise-lawn": {
    source: "unsplash",
    id: "1458245201577-fc8a130b8829",
    photographer: "Daniel Watson",
    sourceUrl: "https://unsplash.com/photos/green-and-black-lawnmower-on-green-grass-8vBpYpTGo90",
    alt: "Green and black lawn mower sitting on freshly cut grass",
  },
  "bellhorn-movers": {
    source: "unsplash",
    id: "1616432043562-3671ea2e5242",
    photographer: "Caleb Ruiter",
    sourceUrl: "https://unsplash.com/photos/white-freight-truck-on-road-during-daytime-EmEQ6kK_5P0",
    alt: "White freight truck travelling along an open road during daytime",
  },
  "heritage-painters": {
    source: "unsplash",
    id: "1638179552078-18c1f6db7409",
    photographer: "Marina Yalanska",
    sourceUrl: "https://unsplash.com/photos/a-box-filled-with-lots-of-different-colors-of-paint-fyylThhBTxI",
    alt: "Open box filled with rows of paint tubes in many colours",
  },
  "brightside-cleaning": {
    source: "unsplash",
    id: "1556912167-f556f1f39fdf",
    photographer: "Roam In Color",
    sourceUrl: "https://unsplash.com/photos/four-brown-stools-RryFk4n-vOs",
    alt: "Four brown wooden stools lined up at a clean kitchen island",
  },
  "summit-roofing": {
    source: "unsplash",
    id: "1524813686514-a57563d77965",
    photographer: "Tom Rumble",
    sourceUrl: "https://unsplash.com/photos/top-view-photography-of-houses-at-daytime-7lvzopTxjOU",
    alt: "Top-down aerial view of a suburban neighborhood of pitched-roof houses",
  },
  "westwood-tree": {
    source: "unsplash",
    id: "1684332666088-f35b252b5aca",
    photographer: "Kasia",
    sourceUrl: "https://unsplash.com/photos/a-man-cutting-a-tree-with-a-chainsaw-9wZCTO4SiMU",
    alt: "Arborist using a chainsaw to cut into a tree trunk",
  },
  "voltcraft-electric": {
    source: "unsplash",
    id: "1576446470246-499c738d1c8e",
    photographer: "Mark Kats",
    sourceUrl: "https://unsplash.com/photos/white-circuit-breakers-oj1zW_PNI4k",
    alt: "Row of white circuit breakers inside an electrical panel",
  },
  "sparkle-suds-laundromat": {
    source: "unsplash",
    id: "1635274605638-d44babc08a4f",
    photographer: "Dan LeFebvre",
    sourceUrl: "https://unsplash.com/photos/a-stack-of-folded-shirts-sitting-on-top-of-a-blue-table-APUvZYCjPJ0",
    alt: "Tall stack of freshly folded shirts resting on a blue surface",
  },
  "crystalline-window-co": {
    source: "unsplash",
    id: "1629419566667-1a7b044b7deb",
    photographer: "Masrur Rahman",
    sourceUrl: "https://unsplash.com/photos/black-and-gray-high-rise-building-under-blue-sky-during-daytime-Q0oO-6KKEcY",
    alt: "Tall black and gray glass high-rise building under a bright daytime sky",
  },
  "mesa-hvac": {
    source: "unsplash",
    id: "1774876549246-dfa8eae5d9f5",
    photographer: "HUUM",
    sourceUrl: "https://unsplash.com/photos/finger-pressing-button-on-digital-thermostat-display-Ymp_8DatASs",
    alt: "Finger pressing a button on a digital thermostat display",
  },
  "sandstone-pool-care": {
    source: "unsplash",
    id: "1687160954681-230591e7b494",
    photographer: "Tim Mossholder",
    sourceUrl: "https://unsplash.com/photos/a-blue-tiled-swimming-pool-with-blue-tiles-AseZhJU-PSQ",
    alt: "Blue tiled swimming pool with sunlight reflecting off the tile edge",
  },
  "tidy-pros-junk": {
    source: "unsplash",
    id: "1635108198854-26645ffe6714",
    photographer: "Point3D Commercial Imaging Ltd.",
    sourceUrl: "https://unsplash.com/photos/a-garage-filled-with-lots-of-clutter-and-tools-SP4oH94qOCU",
    alt: "Residential garage filled with stacked clutter and stored tools",
  },
  "aurora-pressure-wash": {
    source: "unsplash",
    id: "1777713174772-5b2e4886b62d",
    photographer: "Jonathan Cosens Photography",
    sourceUrl: "https://unsplash.com/photos/a-blue-hose-lies-on-a-paved-walkway-gprPe4PFGOw",
    alt: "Blue hose coiled across a freshly washed paved walkway",
  },

  // ───── Design-vibe themes (16) — atmospheric, matches the vibe.

  angelos: {
    source: "unsplash",
    id: "1606152196365-d1ce5ea838b5",
    photographer: "Klara Kulikova",
    sourceUrl: "https://unsplash.com/photos/fire-in-brown-wooden-round-tray-RsiNFKMvqtg",
    alt: "Open flames burning inside a round wood-fired oven",
  },
  brutalist: {
    source: "unsplash",
    id: "1546414701-81cc6963c67f",
    photographer: "Simone Hutsch",
    sourceUrl: "https://unsplash.com/photos/landscape-photography-of-gray-concrete-building-XK0faa4_mCQ",
    alt: "Landscape view of a grey concrete brutalist building facade",
  },
  "cask-vine": {
    source: "unsplash",
    id: "1561906814-23da9a8bfee0",
    photographer: "Eric Cook",
    sourceUrl: "https://unsplash.com/photos/barrels-of-liquor-in-a-basement-D9WH_vlxicA",
    alt: "Stacked oak barrels of wine and liquor inside a low-lit cellar",
  },
  "cinematic-dark": {
    source: "unsplash",
    id: "1655575900119-2f19ba5718d0",
    photographer: "Abhijeet Gaikwad",
    sourceUrl: "https://unsplash.com/photos/a-large-building-with-a-large-roof-7_jgLKBxQ8I",
    alt: "Large dimly lit industrial building interior with sweeping roof",
  },
  "daylight-lounge": {
    source: "unsplash",
    id: "1656122381069-9ec666d95cf1",
    photographer: "Jake Goossen",
    sourceUrl: "https://unsplash.com/photos/a-living-room-with-a-large-window-MM7nD2FjI3U",
    alt: "Calm living room interior flooded with light from a large window",
  },
  "documentary-b2b": {
    source: "unsplash",
    id: "1431540015161-0bf868a2d407",
    photographer: "Benjamin Child",
    sourceUrl: "https://unsplash.com/photos/oval-brown-wooden-conference-table-and-chairs-inside-conference-room-GWe0dlVD9e0",
    alt: "Empty oval brown wooden conference table and chairs inside a conference room",
  },
  "doorstep-editorial": {
    source: "unsplash",
    id: "1641199788912-9a7385a35c82",
    photographer: "Mathias Reding",
    sourceUrl: "https://unsplash.com/photos/a-white-van-parked-on-the-side-of-the-road-OL84QWu3Ong",
    alt: "White delivery van parked along the side of a quiet street",
  },
  "mara-lin": {
    source: "unsplash",
    id: "1542992933-ce75d0187ec1",
    photographer: "Szabo Viktor",
    sourceUrl: "https://unsplash.com/photos/woman-taking-photo-6zEfniBMs6c",
    alt: "Photographer working in a studio, framing a shot with a camera",
  },
  "north-fork": {
    source: "unsplash",
    id: "1545287072-469f3761413c",
    photographer: "Toby Stodart",
    sourceUrl: "https://unsplash.com/photos/gray-storage-tank-VXj9SizkreE",
    alt: "Tall gray stainless-steel brewery fermentation tank",
  },
  "premium-trade": {
    source: "unsplash",
    id: "1426927308491-6380b6a9936f",
    photographer: "Barn Images",
    sourceUrl: "https://unsplash.com/photos/assorted-handheld-tools-in-tool-rack-t5YUoHW6zRo",
    alt: "Assorted hand tools neatly arranged in a workshop tool rack",
  },
  "print-block-books": {
    source: "unsplash",
    id: "1776112645860-189997694f49",
    photographer: "Will Grobbelaar",
    sourceUrl: "https://unsplash.com/photos/a-library-aisle-with-tall-bookshelves-filled-with-books-B69nkOr8zv8",
    alt: "Library aisle lined with tall bookshelves filled with books",
  },
  "still-point": {
    source: "unsplash",
    id: "1604938814491-c696899ec59b",
    photographer: "Brad Switzer",
    sourceUrl: "https://unsplash.com/photos/brown-stone-stack-on-brown-wooden-log-SHDCQ1l2WD0",
    alt: "Quiet stack of smooth brown stones balanced on a wooden log",
  },
  "swiss-editorial": {
    source: "unsplash",
    id: "1543487945-139a97f387d5",
    photographer: "Martin Péchy",
    sourceUrl: "https://unsplash.com/photos/wall-mounted-helvetica-alphabet-poster-above-sofa-iXHdGk8JVYU",
    alt: "Wall-mounted Helvetica alphabet poster hung above a sofa",
  },
  switchback: {
    source: "unsplash",
    id: "1534972195531-d756b9bfa9f2",
    photographer: "Fotis Fotopoulos",
    sourceUrl: "https://unsplash.com/photos/two-black-flat-screen-computer-monitors-LJ9KY8pIH3E",
    alt: "Two black flat-screen developer monitors glowing in a dark room",
  },
  "webgl-experimental": {
    source: "unsplash",
    id: "1579546929518-9e396f3cc809",
    photographer: "Codioful",
    sourceUrl: "https://unsplash.com/photos/blue-and-pink-light-illustration-LeG68PrXA6Y",
    alt: "Smooth blue and pink gradient light illustration",
  },
  "wildflower-stone": {
    source: "unsplash",
    id: "1531120364508-a6b656c3e78d",
    photographer: "Niklas Ohlrogge",
    sourceUrl: "https://unsplash.com/photos/assorted-color-flowers-on-brown-wood-74QmIJDTD-c",
    alt: "Assorted wildflowers gathered on a brown wood surface",
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
const slugs = Object.keys(CTA_BGS)

console.log(`\nPhase B1.5 CTA background fetcher — ${slugs.length} themes`)
console.log(`target ≤ ${Math.round(TARGET_BYTES / 1024)} KB · hard cap 200 KB\n`)

for (const slug of slugs) {
  const entry = CTA_BGS[slug]
  const url = buildUrl(entry)
  const dest = join(PUBLIC, slug, "cta-bg.jpg")
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
  join(__dirname, "fetch-cta-images.results.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      target_bytes: TARGET_BYTES,
      ctaBackgrounds: Object.fromEntries(
        Object.entries(CTA_BGS).map(([slug, e]) => [
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
