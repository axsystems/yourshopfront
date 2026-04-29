import type { Theme } from "./types"

/** Round 1 portfolio piece. Source: 07-webgl-experimental.html (VOLTAGE™ next-browser tech). */
export const webglExperimental: Theme = {
  slug: "webgl-experimental",
  name: "Acid Tech",
  industry: "Tech / Product",
  city: "San Francisco",
  tagline: "Engineered for the next browser.",
  description:
    "Hyper-tech experimental. Charcoal + acid green + electric blue + violet, Inter Tight (substituted Inter), JetBrains Mono labels, custom cursor and orb. For developer products, AI tools, and devtools brands.",
  mode: "project",
  vibe: "sleek-tech",
  hero: "gallery",
  heroEyebrow: "v3.0 · NOW IN BETA",
  colors: {
    bg: "#09090B",
    fg: "#F4F4F5",
    primary: "#C5FF00",
    primaryFg: "#09090B",
    accent: "#2D5BFF",
    accentFg: "#F4F4F5",
    muted: "#1A1A1F",
    mutedFg: "#A1A1AA",
    border: "#F4F4F514",
    surface: "#131316",
    surfaceFg: "#F4F4F5",
  },
  fonts: { display: "inter", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "6px", md: "8px", lg: "12px", pill: "999px" },
  button: { shape: "rounded", shadow: "glow", weight: "bold", uppercase: false },
  seoTitle: "Acid Tech — Experimental Devtools Style · Apex Sites Portfolio",
  seoDescription:
    "Apex Sites portfolio: a hyper-tech devtools brand. Charcoal + acid green + electric blue, Inter Tight, custom cursor. Built for AI tools, devtools, and frontier-tech products.",
  isThemeOption: false,
  sourceHtmlPath: "07-webgl-experimental.html",
  round: 1,
}
