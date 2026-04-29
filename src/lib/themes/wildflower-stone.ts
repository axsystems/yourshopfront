import type { Theme } from "./types"

/** Round 2 portfolio piece. Source: 02-wildflower-stone.html (florist + apothecary). */
export const wildflowerStone: Theme = {
  slug: "wildflower-stone",
  name: "Wildflower & Stone",
  industry: "Florist / Apothecary",
  city: "Hudson Valley",
  tagline: "Florist, apothecary, slow goods.",
  description:
    "Slow-goods editorial. Cream + sage + dusty rose + gold, Cormorant Garamond and EB Garamond (substituted Playfair + Fraunces). Hand-drawn leaf dividers, all-italic nav.",
  mode: "project",
  vibe: "naturalist",
  hero: "gallery",
  heroEyebrow: "SEASONAL — SHOP THIS WEEK",
  colors: {
    bg: "#F5EFE0",
    fg: "#2A2520",
    primary: "#2A2520",
    primaryFg: "#F5EFE0",
    accent: "#C4A097",
    accentFg: "#2A2520",
    muted: "#ECE3CD",
    mutedFg: "#6B7C5F",
    border: "#2A25201A",
    surface: "#FAF6EA",
    surfaceFg: "#2A2520",
  },
  fonts: { display: "playfair-display", body: "fraunces", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "2px", lg: "4px", pill: "999px" },
  button: { shape: "sharp", shadow: "none", weight: "regular", uppercase: false },
  seoTitle: "Wildflower & Stone — Florist & Apothecary · Apex Sites Portfolio",
  seoDescription:
    "Apex Sites portfolio: a slow-goods florist and apothecary. Cream + sage + rose + gold, Cormorant Garamond, hand-drawn dividers. Built for florists, apothecaries, and craft retail.",
  isThemeOption: true,
  sourceHtmlPath: "02-wildflower-stone.html",
  round: 2,
}
