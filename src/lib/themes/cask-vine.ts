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
  seoTitle: "Cask & Vine — Natural Wine Bar · Apex Sites Portfolio",
  seoDescription:
    "Apex Sites portfolio: a natural wine bar. Wine + gold + cream, Playfair Display, sommelier elegance. Built for wine bars, fine dining, and reservation-led restaurants.",
  isThemeOption: true,
  sourceHtmlPath: "06-cask-vine.html",
  round: 2,
}
