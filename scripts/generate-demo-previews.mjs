/**
 * Capture clean screenshots of demo pages for use as /start preview imagery.
 *
 *   pnpm build && PORT=3115 pnpm start        # in one shell
 *   node scripts/generate-demo-previews.mjs   # in another
 *
 * Two constraints make this less obvious than it looks:
 *
 * 1. Our own chrome (PortfolioBanner, themed SiteHeader) is hidden by
 *    <HideWhenEmbedded>, which detects the FRAME relationship rather than
 *    ?embed=1. A top-level screenshot therefore still shows the chrome —
 *    the page must genuinely be framed.
 * 2. The CSP sets `frame-ancestors 'self'`, so a Playwright setContent
 *    harness (an about:blank parent) is refused and renders an EMPTY
 *    document. A DOM probe then reports "header absent" and passes for the
 *    wrong reason. We serve the harness through context.route() on the
 *    app's own origin so the parent is same-origin.
 *
 * The hero's own meta-copy — the "Pick a style"/"See pricing" pair, the
 * promo price strip, the live-preview annotation, the concierge bubble and
 * the mobile buy bar — is suppressed inside a frame too, so a capture is
 * usable at full size and not only as a thumbnail.
 *
 * Still not usable: themes with `hero: "gallery"` (e.g. heritage-painters)
 * render CSS gradient placeholders instead of photos, so half the capture
 * is coloured rectangles. `<TradePicker>` falls back to that theme's own
 * hero photograph; delete its `fallbackImage` once the gallery hero has
 * real photography.
 */
import pw from "@playwright/test"
import sharp from "sharp"
import { fileURLToPath } from "node:url"
import path from "node:path"

const BASE = process.env.PREVIEW_BASE ?? "http://127.0.0.1:3115"
const SLUGS = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      "ironside-plumbing",
      "voltcraft-electric",
      "mesa-hvac",
      "summit-roofing",
      "heritage-painters",
      "brightside-cleaning",
      "greenwise-lawn",
      "bellhorn-movers",
    ]

const OUT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "start",
  "previews"
)
const W = 1280
const H = 860

const browser = await pw.chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 2,
})

await ctx.route(`${BASE}/__shot*`, (route) => {
  const slug = new URL(route.request().url()).searchParams.get("slug")
  route.fulfill({
    status: 200,
    contentType: "text/html",
    body: `<body style="margin:0"><iframe src="${BASE}/demos/${slug}?embed=1" width="${W}" height="${H}" style="border:0;display:block"></iframe></body>`,
  })
})

let failed = 0
for (const slug of SLUGS) {
  const page = await ctx.newPage()
  await page.goto(`${BASE}/__shot?slug=${slug}`, {
    waitUntil: "networkidle",
    timeout: 60000,
  })
  await page.waitForTimeout(2500)
  const frame = page.frames().find((f) => f.url().includes(`/demos/${slug}`))
  if (!frame) {
    console.error(`${slug}: no frame — is the server running on ${BASE}?`)
    failed++
    await page.close()
    continue
  }
  const info = await frame.evaluate(async () => {
    // fire FadeUp / IntersectionObserver reveals, then return to the top
    for (let y = 0; y < 1500; y += 300) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 90))
    }
    window.scrollTo(0, 0)
    await new Promise((r) => setTimeout(r, 700))
    return {
      header: document.querySelector("header") ? "PRESENT" : "absent",
      len: (document.body.innerText || "").length,
      h1: (document.querySelector("h1")?.innerText || "").slice(0, 44),
    }
  })
  // header PRESENT means the frame check failed — the shot would show our nav
  if (info.header !== "absent" || info.len < 500) {
    console.error(`${slug}: REJECTED (header=${info.header} len=${info.len})`)
    failed++
    await page.close()
    continue
  }
  await page.waitForTimeout(500)
  const buf = await page.screenshot()
  await sharp(buf)
    .resize(1000, 672, { fit: "cover", position: "top" })
    .webp({ quality: 80 })
    .toFile(path.join(OUT, `${slug}.webp`))
  console.log(`${slug.padEnd(20)} ok  h1="${info.h1}"`)
  await page.close()
}

await browser.close()
if (failed) {
  console.error(`\n${failed} capture(s) rejected — nothing written for those.`)
  process.exit(1)
}
