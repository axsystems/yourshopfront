import type { Theme } from "./types"

/** Round 2 portfolio piece. Source: 05-north-fork.html (independent brewery + taproom). */
export const northFork: Theme = {
  slug: "north-fork",
  name: "North Fork",
  industry: "Brewery / Taproom",
  city: "Brooklyn",
  tagline: "Independent brewery & taproom.",
  description:
    "Beer-hall masthead. Forest green + cream + mustard + oxblood, Archivo Black display + Fraunces italic lede. Heritage badge mark, taproom-loud type.",
  mode: "recurring",
  vibe: "bold-industrial",
  hero: "gallery",
  heroEyebrow: "TAPROOM OPEN · TUE–SUN",
  colors: {
    bg: "#EDE3CD",
    fg: "#1A1A1A",
    primary: "#D9A934",
    primaryFg: "#1A1A1A",
    accent: "#2A4530",
    accentFg: "#EDE3CD",
    muted: "#DDD0B0",
    mutedFg: "#1A1A1ABF",
    border: "#1A1A1A",
    surface: "#F4ECD7",
    surfaceFg: "#1A1A1A",
  },
  fonts: { display: "archivo-black", body: "fraunces", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "0", lg: "0", pill: "999px" },
  button: { shape: "sharp", shadow: "hard-offset", weight: "heavy", uppercase: true },
  seoTitle: "North Fork — Independent Brewery · Apex Sites Portfolio",
  seoDescription:
    "Apex Sites portfolio: an independent brewery and taproom. Forest + cream + mustard + oxblood, Archivo Black masthead, heritage badge. Built for breweries, distilleries, and taprooms.",
  isThemeOption: true,
  sourceHtmlPath: "05-north-fork.html",
  round: 2,
}
