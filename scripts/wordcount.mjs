import { readFileSync } from "node:fs"

const text = readFileSync("src/lib/portfolio-copy.ts", "utf8")
// Match: "slug": "paragraph",
const re = /"([a-z][a-z0-9-]+)":\s*"((?:[^"\\]|\\.)*)",/g
const out = []
for (const m of text.matchAll(re)) {
  const slug = m[1]
  const para = m[2].replace(/\\'/g, "'").replace(/\\"/g, '"')
  const words = para.split(/\s+/).filter(Boolean).length
  out.push({ slug, words })
}
out.sort((a, b) => a.words - b.words)
const min = Math.min(...out.map((o) => o.words))
const max = Math.max(...out.map((o) => o.words))
const avg = (out.reduce((s, o) => s + o.words, 0) / out.length).toFixed(1)
console.log(`24 paragraphs · min ${min} / avg ${avg} / max ${max} words\n`)
for (const o of out) console.log(`  ${String(o.words).padStart(3)} ${o.slug}`)
const outOfRange = out.filter((o) => o.words < 80 || o.words > 120)
if (outOfRange.length) {
  console.log(`\n⚠ ${outOfRange.length} out of 80–120 range:`)
  for (const o of outOfRange) console.log(`  ${o.words} ${o.slug}`)
} else {
  console.log("\n✓ All 24 within 80–120 word target.")
}
