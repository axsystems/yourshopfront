import type { Theme } from "./types"

export const greenwiseLawn: Theme = {
  slug: "greenwise-lawn",
  name: "Greenwise Lawn",
  industry: "Lawn Care",
  city: "Austin",
  tagline: "Organic lawn care. Free quote in 60 seconds.",
  description:
    "Naturalist, organic, soft serif. Built for recurring-service brands that sell consistency and craft.",
  mode: "recurring",
  vibe: "naturalist",
  hero: "booking-card",
  heroEyebrow: "ORGANIC LAWN CARE",
  colors: {
    bg: "#F4F0E4",
    fg: "#1A1F18",
    primary: "#2D4A2F",
    primaryFg: "#FAF7ED",
    accent: "#D9A441",
    accentFg: "#1F3320",
    muted: "#C9D4B8",
    mutedFg: "#6B6F65",
    border: "#2D4A2F26",
    surface: "#FFFFFF",
    surfaceFg: "#1A1F18",
  },
  fonts: { display: "fraunces", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "8px", md: "14px", lg: "22px", pill: "100px" },
  button: { shape: "pill", shadow: "soft", weight: "bold", uppercase: false },
  seoTitle: "Apex Sites — Naturalist Style for Lawn & Garden Brands",
  seoDescription:
    "The Greenwise Lawn demo. Soft serif, moss + cream palette, booking-card hero. For lawn care, landscaping, and organic-leaning recurring services.",
  isThemeOption: true,
  sourceHtmlPath: "02-greenwise-lawn.html",
  round: 3,
}
