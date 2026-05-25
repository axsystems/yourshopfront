import type { Theme } from "./types"

/** Round 1 portfolio piece. Source: 08-brutalist.html (HUNGRY HUNGRY agency). */
export const brutalist: Theme = {
  slug: "brutalist",
  name: "Neo-Brutalist",
  industry: "Creative Agency",
  city: "Los Angeles",
  tagline: "A LOUD agency for LOUD brands.",
  description:
    "Pop-art neo-brutalism. Yellow + black + electric pink + cobalt blue, Bricolage Grotesque mega type, 4px hard borders, hard-shadow buttons, ALL CAPS treatment.",
  mode: "project",
  vibe: "bold-industrial",
  hero: "gallery",
  heroEyebrow: "WE MAKE NOISE",
  colors: {
    bg: "#FFE600",
    fg: "#000000",
    primary: "#000000",
    primaryFg: "#FFE600",
    accent: "#FF1493",
    accentFg: "#FFFFFF",
    muted: "#FFF8DC",
    mutedFg: "#000000BF",
    border: "#000000",
    surface: "#FFFFFF",
    surfaceFg: "#000000",
  },
  fonts: { display: "bricolage-grotesque", body: "bricolage-grotesque", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "0", lg: "0", pill: "999px" },
  button: { shape: "rounded", shadow: "hard-offset", weight: "heavy", uppercase: true },
  heroImage: {
    url: "/themes/brutalist/hero.jpg",
    alt: "Stark concrete architectural geometry with strong shadows",
    credit: "Photo by Joel Filipe on Unsplash",
  },

  seoTitle: "Neo-Brutalist — LOUD Agency Style · Apex Sites Portfolio",
  seoDescription:
    "Apex Sites portfolio: a neo-brutalist agency brand. Yellow + black + pink + blue, Bricolage Grotesque, hard-shadow buttons, mega type. Built for agencies and brands that want to be loud.",
  isThemeOption: true,
  sourceHtmlPath: "08-brutalist.html",
  round: 1,
}
