import type { Theme } from "./types"

export const mesaHvac: Theme = {
  slug: "mesa-hvac",
  name: "Mesa HVAC",
  industry: "HVAC",
  city: "Mesa",
  tagline: "A/C down? We'll be there today — guaranteed.",
  description:
    "Desert-emergency palette. Deep navy + sunset orange, condensed display type, phone-first hero. For HVAC, A/C repair, and 24/7 climate trades in hot markets.",
  mode: "emergency",
  vibe: "bold-industrial",
  hero: "phone-first",
  heroEyebrow: "SAME-DAY A/C REPAIR — 24/7",
  colors: {
    bg: "#0F1B2D",
    fg: "#F8FAFC",
    primary: "#F97316",
    primaryFg: "#0F1B2D",
    accent: "#FACC15",
    accentFg: "#0F1B2D",
    muted: "#1E2D44",
    mutedFg: "#94A3B8",
    border: "#1E2D44",
    surface: "#16243A",
    surfaceFg: "#F8FAFC",
  },
  fonts: { display: "oswald", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "4px", md: "6px", lg: "10px", pill: "100px" },
  button: { shape: "sharp", shadow: "hard-offset", weight: "heavy", uppercase: true },
  seoTitle: "Apex Sites — Emergency HVAC & 24/7 Trade Style",
  seoDescription:
    "The Mesa HVAC demo. Navy + sunset orange, condensed Oswald headlines, phone-first hero. For HVAC, A/C repair, garage-door, and any 24/7 emergency trade.",
  isThemeOption: true,
  sourceHtmlPath: "11-mesa-hvac.html",
  round: 3,
}
