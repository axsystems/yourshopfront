import type { Theme } from "./types"

export const heritagePainters: Theme = {
  slug: "heritage-painters",
  name: "Heritage Painters",
  industry: "Painting",
  city: "Charleston",
  tagline: "Premium house painting. 2-year warranty.",
  description:
    "Warm premium. Editorial Fraunces serif, terracotta + gold + ink, gallery-led hero. For premium project work.",
  mode: "project",
  vibe: "warm-premium",
  hero: "gallery",
  heroEyebrow: "EST. 2008 — CHARLESTON",
  colors: {
    bg: "#FAF6EE",
    fg: "#1A1614",
    primary: "#1A1614",
    primaryFg: "#FAF6EE",
    accent: "#C8634A",
    accentFg: "#FAF6EE",
    muted: "#E8DFC8",
    mutedFg: "#6B6259",
    border: "#1A161414",
    surface: "#FFFFFF",
    surfaceFg: "#1A1614",
  },
  fonts: { display: "fraunces", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "4px", md: "6px", lg: "8px", pill: "100px" },
  button: { shape: "sharp", shadow: "none", weight: "bold", uppercase: false },
  seoTitle: "Apex Sites — Warm Premium Editorial Style for Craft Brands",
  seoDescription:
    "The Heritage Painters demo. Editorial serif, ivory + terracotta + gold palette, gallery hero. For painters, restorers, and high-craft trades.",
  isThemeOption: true,
  sourceHtmlPath: "04-heritage-painters.html",
  round: 3,
}
