import type { Theme } from "./types"

export const westwoodTree: Theme = {
  slug: "westwood-tree",
  name: "Westwood Tree Care",
  industry: "Tree Care",
  city: "Portland",
  tagline: "ISA Certified Arborists. Free estimate.",
  description:
    "Naturalist + safety-orange. Forest greens, Oswald + Fraunces. Gallery hero for project showcase.",
  mode: "project",
  vibe: "naturalist",
  hero: "gallery",
  heroEyebrow: "ISA CERTIFIED — FULLY INSURED",
  colors: {
    bg: "#F5F1E6",
    fg: "#1A1612",
    primary: "#FF6A1A",
    primaryFg: "#122019",
    accent: "#1F3528",
    accentFg: "#F5F1E6",
    muted: "#ECE5D2",
    mutedFg: "#6B6259",
    border: "#1F352826",
    surface: "#FAF6EC",
    surfaceFg: "#1A1612",
  },
  fonts: { display: "fraunces", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "2px", lg: "4px", pill: "0" },
  button: { shape: "sharp", shadow: "hard-offset", weight: "heavy", uppercase: true },
  seoTitle: "Apex Sites — Naturalist Style with Safety-Orange Accents",
  seoDescription:
    "The Westwood Tree Care demo. Forest greens, safety orange, gallery hero. For arborists, landscapers, and rugged outdoor trades.",
}
