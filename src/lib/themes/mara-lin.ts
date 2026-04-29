import type { Theme } from "./types"

/** Round 2 portfolio piece. Source: 07-mara-lin.html (photographer & director, NYC/LA). */
export const maraLin: Theme = {
  slug: "mara-lin",
  name: "Mara Lin",
  industry: "Photographer / Director",
  city: "New York / Los Angeles",
  tagline: "Photographer & director.",
  description:
    "Fashion-photo darkroom. Near-black + warm-white + tan accent, Tenor Sans (substituted Inter) and DM Mono labels (substituted JetBrains Mono). Custom cursor, full-bleed editorial figure.",
  mode: "project",
  vibe: "sleek-tech",
  hero: "gallery",
  heroEyebrow: "REPRESENTED BY MERIDIAN+",
  colors: {
    bg: "#0A0A0A",
    fg: "#F5F2EC",
    primary: "#C8B8A0",
    primaryFg: "#0A0A0A",
    accent: "#F5F2EC",
    accentFg: "#0A0A0A",
    muted: "#141414",
    mutedFg: "#F5F2EC8C",
    border: "#F5F2EC1A",
    surface: "#1C1C1C",
    surfaceFg: "#F5F2EC",
  },
  fonts: { display: "inter", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "0", lg: "0", pill: "999px" },
  button: { shape: "sharp", shadow: "none", weight: "regular", uppercase: true },
  seoTitle: "Mara Lin — Photographer & Director · Apex Sites Portfolio",
  seoDescription:
    "Apex Sites portfolio: a fashion photographer and director. Near-black + warm-white + tan, Tenor Sans, full-bleed editorial. Built for photographers, directors, and fashion talent.",
  isThemeOption: true,
  sourceHtmlPath: "07-mara-lin.html",
  round: 2,
}
