import type { Theme } from "./types"

/** Round 1 portfolio piece. Source: 03-documentary-b2b.html (Bellweather Linen healthcare/hospitality laundry). */
export const documentaryB2b: Theme = {
  slug: "documentary-b2b",
  name: "Documentary B2B",
  industry: "Commercial / Healthcare Services",
  city: "Atlanta",
  tagline: "Healthcare and hospitality laundry partners.",
  description:
    "Serious B2B credentialed style. Navy + yellow + red, Inter Tight display (substituted Inter), JetBrains Mono utility labels. For commercial laundry, healthcare services, hospitality contracts, and any compliance-sensitive trade.",
  mode: "project",
  vibe: "sleek-tech",
  hero: "form-card",
  heroEyebrow: "ISO 9001 · OSHA · HIPAA",
  colors: {
    bg: "#FBFBFC",
    fg: "#0C1E35",
    primary: "#0C1E35",
    primaryFg: "#FFFFFF",
    accent: "#F5C842",
    accentFg: "#0C1E35",
    muted: "#E5E7EB",
    mutedFg: "#5B6577",
    border: "#0C1E351A",
    surface: "#FFFFFF",
    surfaceFg: "#0C1E35",
  },
  fonts: { display: "inter", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "6px", md: "10px", lg: "14px", pill: "999px" },
  button: { shape: "rounded", shadow: "soft", weight: "bold", uppercase: false },
  seoTitle: "Documentary B2B — Healthcare & Commercial Linen · Apex Sites Portfolio",
  seoDescription:
    "Apex Sites portfolio: a B2B commercial laundry brand. Navy + yellow + red, credentialed strip, JetBrains Mono utility type. Built for healthcare contracts and commercial services.",
  isThemeOption: false,
  sourceHtmlPath: "03-documentary-b2b.html",
  round: 1,
}
