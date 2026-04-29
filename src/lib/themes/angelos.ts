import type { Theme } from "./types"

/** Round 2 portfolio piece. Source: 03-angelos.html (Brooklyn pizza joint, est. 1956). */
export const angelos: Theme = {
  slug: "angelos",
  name: "Angelo's",
  industry: "Restaurant / Pizza",
  city: "Brooklyn",
  tagline: "Pizza, since 1956.",
  description:
    "Newspaper-Italian-Americana. Parchment + tomato + olive + mustard, Bodoni Moda + Playfair Display + Caveat script. Newspaper banner hero, double-rule borders, hand-stamp accents.",
  mode: "recurring",
  vibe: "warm-premium",
  hero: "gallery",
  heroEyebrow: "OPEN UNTIL 11PM TONIGHT",
  colors: {
    bg: "#F4ECDA",
    fg: "#1A1A1A",
    primary: "#C8332A",
    primaryFg: "#FCF8EC",
    accent: "#D9A441",
    accentFg: "#1A1A1A",
    muted: "#E9DEC2",
    mutedFg: "#1A1A1ABF",
    border: "#1A1A1A",
    surface: "#FBF7EA",
    surfaceFg: "#1A1A1A",
  },
  fonts: { display: "playfair-display", body: "playfair-display", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "0", lg: "2px", pill: "999px" },
  button: { shape: "sharp", shadow: "hard-offset", weight: "bold", uppercase: true },
  seoTitle: "Angelo's — Brooklyn Pizza Since 1956 · Apex Sites Portfolio",
  seoDescription:
    "Apex Sites portfolio: a heritage Brooklyn pizza joint. Parchment + tomato + mustard, Bodoni Moda, double-rule newspaper masthead. Built for restaurants and food brands with history.",
  isThemeOption: true,
  sourceHtmlPath: "03-angelos.html",
  round: 2,
}
