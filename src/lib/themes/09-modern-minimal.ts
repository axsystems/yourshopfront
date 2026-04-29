import type { Theme } from "./types"

export const modernMinimal: Theme = {
  slug: "modern-minimal",
  name: "Modern Minimal",
  industry: "General Services",
  city: "Your City",
  tagline: "A clean, modern site. We swap your content in.",
  description:
    "Sleek-tech. Mostly black + white with one electric accent. Inter + JetBrains Mono. Form-card hero.",
  mode: "project",
  vibe: "sleek-tech",
  hero: "form-card",
  heroEyebrow: "FREE QUOTE",
  colors: {
    bg: "#FAFAFA",
    fg: "#0A0A0A",
    primary: "#0A0A0A",
    primaryFg: "#FAFAFA",
    accent: "#3B82F6",
    accentFg: "#FFFFFF",
    muted: "#E5E5E5",
    mutedFg: "#6E6E70",
    border: "#0A0A0A1A",
    surface: "#FFFFFF",
    surfaceFg: "#0A0A0A",
  },
  fonts: { display: "inter", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "6px", md: "10px", lg: "14px", pill: "100px" },
  button: { shape: "rounded", shadow: "soft", weight: "bold", uppercase: false },
  seoTitle: "Apex Sites — Sleek Modern Minimal Style for Service Brands",
  seoDescription:
    "The Modern Minimal demo. Black on white, electric blue accent, form-card hero. The default \"clean and credible\" template — pick this if your industry isn't one of our specific trades.",
}
