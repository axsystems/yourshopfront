import type { Theme } from "./types"

/** Round 1 portfolio piece. Source: 05-swiss-editorial.html (Object Studio independent design practice). */
export const swissEditorial: Theme = {
  slug: "swiss-editorial",
  name: "Swiss Editorial",
  industry: "Design Studio",
  city: "New York",
  tagline: "Independent design practice, est. 2017.",
  description:
    "Editorial Swiss-style portfolio. Cream + ink + oxblood, Instrument Serif italic (substituted Playfair Display) and Hanken Grotesk (substituted Inter). Tabular project index, long-form mega type.",
  mode: "project",
  vibe: "sleek-tech",
  hero: "gallery",
  heroEyebrow: "SELECTED WORK · 2017–2026",
  colors: {
    bg: "#F0EEE9",
    fg: "#111111",
    primary: "#111111",
    primaryFg: "#F0EEE9",
    accent: "#D14836",
    accentFg: "#F0EEE9",
    muted: "#E8E5DC",
    mutedFg: "#686865",
    border: "#C9C5BC",
    surface: "#FFFFFF",
    surfaceFg: "#111111",
  },
  fonts: { display: "playfair-display", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "2px", lg: "4px", pill: "999px" },
  button: { shape: "sharp", shadow: "none", weight: "regular", uppercase: false },
  seoTitle: "Swiss Editorial — Independent Design Practice · Apex Sites Portfolio",
  seoDescription:
    "Apex Sites portfolio: a Swiss-style design studio. Cream + ink + oxblood, italic display, tabular project index. Built for studios and agencies.",
  isThemeOption: false,
  sourceHtmlPath: "05-swiss-editorial.html",
  round: 1,
}
