import type { Theme, ThemeVibe, HeroPattern } from "./themes/types"

const VIBE_ADJ: Record<ThemeVibe, string> = {
  "bold-industrial": "bold, industrial",
  "warm-premium": "warm, premium",
  "friendly-modern": "friendly, modern",
  "naturalist": "naturalist",
  "sleek-tech": "sleek, modern",
}

const HERO_DESCRIPTOR: Record<HeroPattern, string> = {
  "phone-first": "phone-led",
  "calculator": "instant-quote",
  "gallery": "gallery-led",
  "booking-card": "booking-first",
  "form-card": "form-led",
}

/**
 * Maps the industry field to an audience phrase that reads naturally
 * after "for". Industries like "Plumbing" are nouns that don't fit
 * grammatically, so we map to the worker plural ("plumbers"). When no
 * mapping exists, we fall back to "${industry.toLowerCase()} brands".
 */
const AUDIENCE: Record<string, string> = {
  // Round 3
  "Plumbing": "plumbers",
  "Lawn Care": "lawn-care operators",
  "Moving": "movers and junk-removal teams",
  "Painting": "painters and restorers",
  "Cleaning": "residential cleaners",
  "Roofing": "roofers and exterior contractors",
  "Tree Care": "arborists and landscapers",
  "Electrical": "electricians and licensed trades",
  // Round 1 — promoted
  "Plumbing & HVAC": "plumbing and HVAC contractors",
  "Pickup & Delivery": "pickup-and-delivery brands",
  // Round 1 — non-featured
  "Laundromat / Hospitality": "indie laundromats and third-place brands",
  "Commercial / Healthcare Services": "B2B and healthcare-services vendors",
  "Design Studio": "design studios and creative practices",
  "Video / Film Studio": "production companies and luxury creative",
  "Tech / Product": "developer-tools and frontier-tech products",
  "Creative Agency": "creative agencies that need to be loud",
  // Round 2 — non-featured
  "Bookstore / Press": "indie bookstores and small presses",
  "Florist / Apothecary": "florists, apothecaries, and slow-goods retail",
  "Restaurant / Pizza": "heritage restaurants and family kitchens",
  "Yoga / Wellness": "yoga, meditation, and wellness studios",
  "Brewery / Taproom": "breweries, distilleries, and taprooms",
  "Wine Bar / Restaurant": "wine bars and reservation-led restaurants",
  "Photographer / Director": "photographers, directors, and fashion talent",
  "Developer Tools / SaaS": "developer-tools and observability SaaS",
  // Round 1 — non-featured (additional)
  "General Services": "general home-service brands",
  "Premium Services": "premium concierge brands",
}

function audienceFor(theme: Theme): string {
  return AUDIENCE[theme.industry] ?? `${theme.industry.toLowerCase()} brands`
}

/**
 * Derives a per-theme demo-preview H1 that reads as standalone content,
 * not as a label. Each theme's name and audience appear naturally so
 * Google sees genuinely distinct content across 48 demo+portfolio pages.
 *
 * Example: "Heritage Painters: a warm, premium, gallery-led design for
 * painters and restorers."
 */
export function previewHeadline(theme: Theme): string {
  const vibe = VIBE_ADJ[theme.vibe]
  const hero = HERO_DESCRIPTOR[theme.hero]
  return `${theme.name}: a ${vibe}, ${hero} design for ${audienceFor(theme)}.`
}

/**
 * A short version of previewHeadline for the OG image where vertical
 * space is tight. Drops the hero descriptor.
 */
export function previewHeadlineShort(theme: Theme): string {
  const vibe = VIBE_ADJ[theme.vibe]
  return `${theme.name}: a ${vibe} design for ${audienceFor(theme)}.`
}
