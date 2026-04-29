import type { Theme } from "./types"

/** Round 2 portfolio piece. Source: 08-switchback.html (observability SaaS — Linear-style). */
export const switchback: Theme = {
  slug: "switchback",
  name: "Switchback",
  industry: "Developer Tools / SaaS",
  city: "San Francisco",
  tagline: "Observability that ships with you.",
  description:
    "Linear-style developer SaaS. Near-black background grid + emerald glow + JetBrains Mono labels. Centered hero with code-card preview, multi-tile feature grid, gradient text.",
  mode: "recurring",
  vibe: "sleek-tech",
  hero: "form-card",
  heroEyebrow: "v3.4 · NOW SHIPPING",
  colors: {
    bg: "#0A0E12",
    fg: "#E6EDF3",
    primary: "#10B981",
    primaryFg: "#052E1A",
    accent: "#60A5FA",
    accentFg: "#0A0E12",
    muted: "#141A21",
    mutedFg: "#8B949E",
    border: "#FFFFFF14",
    surface: "#0E1318",
    surfaceFg: "#E6EDF3",
  },
  fonts: { display: "inter", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "6px", md: "8px", lg: "12px", pill: "999px" },
  button: { shape: "rounded", shadow: "glow", weight: "bold", uppercase: false },
  seoTitle: "Switchback — Observability SaaS · Apex Sites Portfolio",
  seoDescription:
    "Apex Sites portfolio: a developer-tools observability brand. Near-black + emerald glow, JetBrains Mono, code-card hero. Built for SaaS, devtools, and B2B subscription products.",
  isThemeOption: true,
  sourceHtmlPath: "08-switchback.html",
  round: 2,
}
