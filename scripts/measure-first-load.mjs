#!/usr/bin/env node
/**
 * Your Shopfront — first-load JS measurement
 *
 * Reads .next/build-manifest.json for the root main files (shared across
 * every page), then for each top-level route: gzips its page chunk + the
 * root mains and reports the total. This is what the user actually downloads
 * on a cold visit.
 *
 * Run: pnpm exec next build --webpack && node scripts/measure-first-load.mjs
 *
 * Output: Markdown table to stdout — copyable into REDESIGN-LOG.md.
 */

import { readFileSync, readdirSync, statSync } from "node:fs"
import { gzipSync } from "node:zlib"
import * as path from "node:path"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const NEXT = join(ROOT, ".next")

const buildManifest = JSON.parse(
  readFileSync(join(NEXT, "build-manifest.json"), "utf8")
)

const ROOT_MAIN = buildManifest.rootMainFiles ?? []

function gzipSize(relPath) {
  try {
    const buf = readFileSync(join(NEXT, relPath))
    return gzipSync(buf, { level: 9 }).length
  } catch (e) {
    return 0
  }
}

function rawSize(relPath) {
  try {
    return statSync(join(NEXT, relPath)).size
  } catch {
    return 0
  }
}

function findRouteChunk(route) {
  // Routes map to .next/static/chunks/app/<route>/page-<hash>.js
  // For the home, that's app/page-<hash>.js
  const dir = route === "/"
    ? join(NEXT, "static", "chunks", "app")
    : join(NEXT, "static", "chunks", "app", route.slice(1))
  let candidates = []
  try {
    const files = readdirSync(dir)
    if (route === "/") {
      candidates = files
        .filter((f) => f.startsWith("page-") && f.endsWith(".js"))
        .map((f) => path.join("static", "chunks", "app", f))
    } else {
      candidates = files
        .filter((f) => f.startsWith("page-") && f.endsWith(".js"))
        .map((f) => path.join("static", "chunks", "app", route.slice(1), f))
    }
  } catch {
    return null
  }
  return candidates[0] ?? null
}

const routes = [
  "/",
  "/portfolio",
  "/pricing",
  "/contact",
  "/about",
  "/demos/[slug]",
  "/portfolio/[slug]",
  "/checkout",
  "/onboarding",
  "/privacy",
  "/terms",
  "/refund-policy",
]

const rootMainGzip = ROOT_MAIN.reduce((sum, f) => sum + gzipSize(f), 0)
const rootMainRaw = ROOT_MAIN.reduce((sum, f) => sum + rawSize(f), 0)

console.log(`Root main files (shared on every page):`)
for (const f of ROOT_MAIN) {
  console.log(`  ${(rawSize(f) / 1024).toFixed(1).padStart(7)} KB raw  /  ${(gzipSize(f) / 1024).toFixed(1).padStart(6)} KB gzip   ${f.split("/").pop()}`)
}
console.log(`  ${"─".repeat(56)}`)
console.log(`  ${(rootMainRaw / 1024).toFixed(1).padStart(7)} KB raw  /  ${(rootMainGzip / 1024).toFixed(1).padStart(6)} KB gzip   total root mains\n`)

console.log(`First-load JS per route (root mains + route page chunk, gzipped):\n`)
console.log("| Route | Raw KB | Gzip KB |")
console.log("|---|---:|---:|")

for (const route of routes) {
  const chunk = findRouteChunk(route)
  if (!chunk) {
    console.log(`| \`${route}\` | — | — |  (chunk not found)`)
    continue
  }
  const pageGzip = gzipSize(chunk)
  const pageRaw = rawSize(chunk)
  const totalGzip = (rootMainGzip + pageGzip) / 1024
  const totalRaw = (rootMainRaw + pageRaw) / 1024
  console.log(
    `| \`${route}\` | ${totalRaw.toFixed(1)} | **${totalGzip.toFixed(1)}** |`
  )
}
