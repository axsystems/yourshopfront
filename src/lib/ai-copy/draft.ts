import "server-only"

import Anthropic from "@anthropic-ai/sdk"

import {
  PartialSiteContentSchema,
  type Discovery,
  type PartialSiteContent,
  type PreferredTone,
} from "@/lib/site-content/schema"
import type { Theme } from "@/lib/themes/types"

// =============================================================================
// AI copy drafting engine
// =============================================================================
// Given the customer's 5-question Discovery + the Theme they bought, produce
// a PartialSiteContent (hero, services, about) Claude Haiku has drafted.
// The result is validated through PartialSiteContentSchema before returning,
// so a malformed model response throws rather than silently shipping junk.
//
// Cost shape (Haiku 4.5 list price as of 2026-05):
//   ~$1/M input · ~$5/M output
//   System prompt with theme metadata + JSON-schema example: ~900 tokens
//   Discovery user message: ~250-500 tokens
//   Drafted JSON response: ~1200-1500 tokens
//   → ~$0.01-0.02 per draft. Cached system prompt drops re-draft cost
//   another ~30%.
//
// PII safety: we deliberately pass ONLY the 5 discovery answers + theme
// metadata to Anthropic. No customer email, no name, no Stripe data.
// =============================================================================

const MODEL = "claude-haiku-4-5-20251001"
const MAX_TOKENS = 2500

let cachedClient: Anthropic | null = null

/**
 * Lazily-instantiated Anthropic client. Throws at first call (request time)
 * if the env var is missing — `next build` doesn't trip on this because
 * nothing at module-init touches process.env.
 */
function client(): Anthropic {
  if (cachedClient) return cachedClient
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not set — cannot draft site copy")
  }
  cachedClient = new Anthropic({ apiKey })
  return cachedClient
}

export interface DraftResult {
  draft: PartialSiteContent
  model: string
  /** ISO timestamp of when Anthropic returned the draft. */
  generatedAt: string
}

/**
 * Draft a PartialSiteContent (hero + services + about) for the given site,
 * using only the supplied discovery answers + theme metadata. Returns the
 * parsed draft plus the model identifier so the caller can record both in
 * the ai_copy_draft JSONB.
 *
 * Throws on:
 *   - Missing ANTHROPIC_API_KEY
 *   - Anthropic API error (rate limit, network, etc.) — caller decides
 *     whether to retry. We deliberately do NOT auto-retry on 429/529:
 *     the operator handles rate-limit fallout manually.
 *   - Response with no text content block
 *   - Response text that isn't valid JSON
 *   - JSON that doesn't match PartialSiteContentSchema
 */
export async function draftSiteContent(
  discovery: Discovery,
  theme: Theme
): Promise<DraftResult> {
  const systemPrompt = buildDraftingSystemPrompt(theme)
  const userPrompt = formatDiscoveryAsPrompt(discovery)

  const result = await client().messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    // Cache the system prompt so re-drafts for the same theme pay only
    // the cached-read price (~10% of normal input).
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
  })

  const firstBlock = result.content[0]
  const text =
    firstBlock && firstBlock.type === "text" ? firstBlock.text : ""
  if (!text) {
    throw new Error("Anthropic returned no text content")
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (err) {
    throw new Error(
      `Anthropic response was not valid JSON: ${(err as Error).message}`
    )
  }

  const validated = PartialSiteContentSchema.parse(parsed)

  return {
    draft: validated,
    model: MODEL,
    generatedAt: new Date().toISOString(),
  }
}

// -----------------------------------------------------------------------------
// Prompt assembly
// -----------------------------------------------------------------------------

const TONE_GUIDANCE: Record<PreferredTone, string> = {
  professional:
    "Polished and credible. Confident without being stiff. Short, declarative sentences. No slang, no emojis, no exclamation marks.",
  friendly:
    "Warm and approachable. Talk like a neighbor who happens to do this work. Use 'we' and 'you'. Keep sentences punchy but human.",
  premium:
    "Restrained and quietly confident. Less is more. Imply quality through specificity — name the materials, the years, the standard — not through adjectives like 'luxury' or 'best-in-class'.",
  direct:
    "No filler. No marketing-speak. Lead with the offer. Short sentences, action verbs, plain words. Sound like a tradesperson, not a brand manager.",
}

function buildDraftingSystemPrompt(theme: Theme): string {
  return `You are an expert copywriter drafting the homepage copy for a small ${theme.industry} business. The customer has paid for our copy service and answered 5 discovery questions. Your job: turn those answers into a hero, services list, and about section that sounds like the owner wrote it themselves.

# The site design they bought
They picked the "${theme.name}" theme — vibe: ${theme.vibe}, mode: ${theme.mode}.
Tagline of the demo: "${theme.tagline}"
Eyebrow on the hero: "${theme.heroEyebrow}"

Don't copy the demo tagline verbatim — it's a reference for register and energy, not a template. The drafted copy must be about THEIR business, using the facts they gave you.

# Hard rules

1. **Output STRICT JSON only.** No prose before or after. No code fences. No commentary. The first character of your reply must be \`{\` and the last must be \`}\`.

2. **Output shape — match this exactly:**
\`\`\`
{
  "hero": {
    "headline": string,                  // 20-110 chars. Punchy. The big top-of-page line.
    "subhead": string,                   // 60-220 chars. One sentence supporting the headline.
    "primaryCtaLabel": string,           // 2-30 chars, action verb, e.g. "Get a quote"
    "primaryCtaHref": "#contact"         // ALWAYS this exact value
  },
  "services": [                          // 4-6 items
    {
      "title": string,                   // 2-50 chars
      "blurb": string                    // 60-220 chars, one sentence
    }
  ],
  "about": {
    "heading": string,                   // 20-100 chars
    "body": string                       // 200-700 chars — 3-4 short sentences
  }
}
\`\`\`

3. **Never invent specifics.** If the discovery didn't mention awards, years in business, employee count, certifications, customer counts, or a specific neighborhood — don't make them up. Stick to what the answers give you. When in doubt, write less.

4. **No reviews, no contact info, no service area, no pricing.** Those sections come from elsewhere. Do not include them in the JSON.

5. **No emojis. No exclamation marks unless the tone calls for it. No marketing cliches** ("we pride ourselves on...", "committed to excellence", "your trusted partner"). Plain English only.

# Tone for THIS draft
${TONE_GUIDANCE[/* tone placeholder, filled per-request */ "professional" as PreferredTone]}

(The actual tone for this draft is sent in the user message below — apply that tone, not this placeholder.)

# Worked example (different industry, different tone — for shape only)

If a roofing company answered: yearsInBusiness="15 years", whatMakesYouDifferent="we answer every call ourselves, no call center", topServices=["Roof repair","Full re-roofs","Storm damage","Gutter work"], targetCustomer="Homeowners in the Phoenix valley who need an honest assessment after a storm", preferredTone="friendly", the output might be:

\`\`\`
{
  "hero": {
    "headline": "Honest roofing answers for Phoenix homeowners.",
    "subhead": "Fifteen years on Valley roofs. When you call, you get one of us — not a call center reading from a script.",
    "primaryCtaLabel": "Get a quote",
    "primaryCtaHref": "#contact"
  },
  "services": [
    { "title": "Roof repair", "blurb": "Patch jobs done right the first time — leaks, cracked tiles, flashing fixes, all backed by our workmanship guarantee." },
    { "title": "Full re-roofs", "blurb": "Tear-off and replacement with the underlayment, materials, and ventilation choices walked through with you up front." },
    { "title": "Storm damage", "blurb": "Same-day tarp service after monsoon hits, then a straight answer about what insurance should cover." },
    { "title": "Gutter work", "blurb": "New runs, repairs, and seasonal cleanouts so your roof drainage keeps water out of the slab." }
  ],
  "about": {
    "heading": "Phoenix roofers since 2010. Still answering our own phones.",
    "body": "We started this company because too many of our neighbors were getting jerked around by out-of-state outfits after storms. Fifteen years later we still answer every call ourselves. You'll talk to the same person from the first call to the final walkthrough. Honest assessment, fair price, work we stand behind."
  }
}
\`\`\`

That's the bar. Now respond with valid JSON only.`
}

function formatDiscoveryAsPrompt(discovery: Discovery): string {
  const services = discovery.topServices
    .map((s, i) => `  ${i + 1}. ${s}`)
    .join("\n")

  return `Draft the homepage copy for this business. Tone: ${discovery.preferredTone}.

Tone guidance for this draft:
${TONE_GUIDANCE[discovery.preferredTone]}

Discovery answers:

Years in business: ${discovery.yearsInBusiness}

What makes them different (their billboard line):
${discovery.whatMakesYouDifferent}

Top services:
${services}

Target customer:
${discovery.targetCustomer}

Respond with valid JSON only — no prose, no code fences. Match the exact shape from the system prompt. Use 4-6 services (pick the strongest from their list and combine where it makes sense — don't pad to 6 if 4 is honest).`
}
