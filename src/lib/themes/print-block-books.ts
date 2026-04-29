import type { Theme } from "./types"

/** Round 2 portfolio piece. Source: 01-print-block-books.html (independent bookstore + zine press). */
export const printBlockBooks: Theme = {
  slug: "print-block-books",
  name: "Print Block",
  industry: "Bookstore / Press",
  city: "Portland",
  tagline: "Independent bookstore & zine press.",
  description:
    "Riso/halftone print-shop aesthetic. Paper + navy ink + electric pink + grass green, DM Serif Display (substituted Playfair) and Space Mono (substituted JetBrains Mono). Halftone overlays, pink dashed stamps.",
  mode: "recurring",
  vibe: "friendly-modern",
  hero: "gallery",
  heroEyebrow: "EST. SOMEWHERE BETWEEN 2003 AND TODAY",
  colors: {
    bg: "#F4EFE3",
    fg: "#15203F",
    primary: "#FF4081",
    primaryFg: "#FBF7EE",
    accent: "#4A8F3D",
    accentFg: "#FBF7EE",
    muted: "#ECE3D0",
    mutedFg: "#15203F99",
    border: "#15203F",
    surface: "#FBF7EE",
    surfaceFg: "#15203F",
  },
  fonts: { display: "playfair-display", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "2px", md: "4px", lg: "6px", pill: "999px" },
  button: { shape: "sharp", shadow: "hard-offset", weight: "bold", uppercase: true },
  seoTitle: "Print Block — Indie Bookstore & Zine Press · Apex Sites Portfolio",
  seoDescription:
    "Apex Sites portfolio: an indie bookstore + zine press. Paper + navy + pink + green, halftone overlays, DM Serif Display. Built for bookstores, presses, and creative retail.",
  isThemeOption: true,
  sourceHtmlPath: "01-print-block-books.html",
  round: 2,
}
