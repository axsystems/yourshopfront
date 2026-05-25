import type { Theme } from "./types"

/** Round 2 portfolio piece. Source: 06-cask-vine.html (natural wine bar, 22 seats, Cobble Hill). */
export const caskVine: Theme = {
  slug: "cask-vine",
  name: "Cask & Vine",
  industry: "Wine Bar / Restaurant",
  city: "Brooklyn",
  tagline: "Natural wine. Twenty-two seats.",
  description:
    "Sommelier elegance. Wine #3D0F14 + gold + cream, Playfair Display editorial serif. Deep, low-lit, elegant — the dinner-reservation kind.",
  mode: "recurring",
  vibe: "warm-premium",
  hero: "gallery",
  heroEyebrow: "SEATING NIGHTLY · 5–11PM",
  colors: {
    bg: "#F0E6D2",
    fg: "#14060A",
    primary: "#3D0F14",
    primaryFg: "#F0E6D2",
    accent: "#C5A572",
    accentFg: "#14060A",
    muted: "#E8DCC4",
    mutedFg: "#14060ABF",
    border: "#14060A1A",
    surface: "#F7EFDC",
    surfaceFg: "#14060A",
  },
  fonts: { display: "playfair-display", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "0", lg: "2px", pill: "999px" },
  button: { shape: "sharp", shadow: "none", weight: "regular", uppercase: true },
  heroImage: {
    url: "/themes/cask-vine/hero.jpg",
    alt: "Glasses of red wine on a dark wooden bar in warm low light",
    credit: "Photo by Kelsey Knight on Unsplash",
  },

  seoTitle: "Cask & Vine — Natural Wine Bar · Apex Sites Portfolio",
  seoDescription:
    "Apex Sites portfolio: a natural wine bar. Wine + gold + cream, Playfair Display, sommelier elegance. Built for wine bars, fine dining, and reservation-led restaurants.",
  isThemeOption: true,
  sourceHtmlPath: "06-cask-vine.html",
  round: 2,
  content: {
    howItWorks: {
      steps: [
        {
          title: "Reserve a table",
          body: "Twenty-two seats, nightly — book ahead or take your chances at the door. Tuesday through Sunday, seating from five.",
        },
        {
          title: "Let us guide the glass",
          body: "Tell us what you usually like and we'll find something worth remembering. The list is all natural, minimal intervention.",
        },
        {
          title: "Stay as long as you like",
          body: "No table turns, no hovering. Order another glass, share a plate. This is the kind of evening that shouldn't feel rushed.",
        },
        {
          title: "Take a bottle home",
          body: "Our retail selection is the same list we pour by the glass. We'll wrap anything you loved so you can find it again.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Natural", label: "Wine list only", caption: "Minimal intervention producers" },
        { value: "22", label: "Seats — intimate", caption: "Reservations recommended" },
        { value: "No", label: "Table turns policy", caption: "Stay as long as you like" },
        { value: "Retail", label: "Bottles to take home", caption: "Same list we pour nightly" },
      ],
    },
    finalCta: {
      headline: "Looking for a real wine bar?",
      highlight: "Twenty-two seats. Come in.",
      body: "Natural wine, no table turns, intimate seating. Cobble Hill, nightly from five.",
      ctaLabel: "Reserve a table →",
      backgroundImage: {
        url: "/themes/cask-vine/cta-bg.jpg",
        alt: "Stacked oak barrels of wine and liquor inside a low-lit cellar",
      },
    },
  },
}
