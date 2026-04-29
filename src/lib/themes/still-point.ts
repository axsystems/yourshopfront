import type { Theme } from "./types"

/** Round 2 portfolio piece. Source: 04-still-point.html (yoga & meditation Brooklyn). */
export const stillPoint: Theme = {
  slug: "still-point",
  name: "Still Point",
  industry: "Yoga / Wellness",
  city: "Brooklyn",
  tagline: "Yoga & meditation. Brooklyn.",
  description:
    "Wabi-sabi calm. Bone + terracotta + sage with a Noto Serif JP character mark. Cormorant Garamond italic display (substituted Playfair). Morphing organic shape, calm pacing.",
  mode: "recurring",
  vibe: "naturalist",
  hero: "gallery",
  heroEyebrow: "MORNING & EVENING DROP-INS",
  colors: {
    bg: "#F1ECE3",
    fg: "#232323",
    primary: "#C8744A",
    primaryFg: "#F1ECE3",
    accent: "#8B9678",
    accentFg: "#232323",
    muted: "#E5DECF",
    mutedFg: "#6E6864",
    border: "#23232314",
    surface: "#FAF6EC",
    surfaceFg: "#232323",
  },
  fonts: { display: "playfair-display", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "0", lg: "0", pill: "999px" },
  button: { shape: "pill", shadow: "none", weight: "regular", uppercase: false },
  seoTitle: "Still Point — Yoga & Meditation · Apex Sites Portfolio",
  seoDescription:
    "Apex Sites portfolio: a wabi-sabi yoga studio. Bone + terracotta + sage, Cormorant italic, morphing organic shape. Built for yoga, meditation, and wellness brands.",
  isThemeOption: true,
  sourceHtmlPath: "04-still-point.html",
  round: 2,
}
