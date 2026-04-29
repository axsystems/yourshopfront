import type { Theme } from "./types"

/** Round 1 portfolio piece. Source: 01-daylight-lounge.html (SUDS & Co. laundromat lounge). */
export const daylightLounge: Theme = {
  slug: "daylight-lounge",
  name: "Daylight Lounge",
  industry: "Laundromat / Hospitality",
  city: "Brooklyn",
  tagline: "Laundry, but make it a lounge.",
  description:
    "Indie laundromat-as-lounge. Cream + terracotta + sage + sky pastels, Fraunces serif display, soft Caveat script accents. Editorial-photo collage hero.",
  mode: "recurring",
  vibe: "warm-premium",
  hero: "gallery",
  heroEyebrow: "OPEN DAILY — 7AM TO 10PM",
  colors: {
    bg: "#F4ECDC",
    fg: "#1E1B16",
    primary: "#D26A3F",
    primaryFg: "#FBF9F4",
    accent: "#8AA47A",
    accentFg: "#1E1B16",
    muted: "#EFE5D2",
    mutedFg: "#1E1B16BF",
    border: "#1E1B1614",
    surface: "#FBF9F4",
    surfaceFg: "#1E1B16",
  },
  fonts: { display: "fraunces", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "8px", md: "12px", lg: "16px", pill: "999px" },
  button: { shape: "pill", shadow: "soft", weight: "bold", uppercase: false },
  seoTitle: "Daylight Lounge — Laundry-as-Lounge Concept · Apex Sites Portfolio",
  seoDescription:
    "Apex Sites portfolio: an indie laundromat lounge concept. Cream + terracotta + sage palette, Fraunces serif, photo-collage hero.",
  isThemeOption: true,
  sourceHtmlPath: "01-daylight-lounge.html",
  round: 1,
}
