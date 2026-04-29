import type { Theme } from "./types"

export const ironsidePlumbing: Theme = {
  slug: "ironside-plumbing",
  name: "Ironside Plumbing",
  industry: "Plumbing",
  city: "Denver",
  tagline: "Same-Day Service. 24/7. Or It's Free.",
  description:
    "Bold, industrial, urgency-first. Built for emergency service businesses where the phone needs to ring now.",
  mode: "emergency",
  vibe: "bold-industrial",
  hero: "phone-first",
  heroEyebrow: "24/7 EMERGENCY DISPATCH",
  colors: {
    bg: "#F4F4F5",
    fg: "#0A0A0A",
    primary: "#FACC15",
    primaryFg: "#0A0A0A",
    accent: "#0A0A0A",
    accentFg: "#FACC15",
    muted: "#D4D4D8",
    mutedFg: "#6E6E70",
    border: "#0A0A0A",
    surface: "#FFFFFF",
    surfaceFg: "#0A0A0A",
  },
  fonts: { display: "archivo-black", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "0", lg: "0", pill: "0" },
  button: { shape: "sharp", shadow: "hard-offset", weight: "heavy", uppercase: true },
  seoTitle: "Apex Sites — Bold Industrial Style for Emergency Service Brands",
  seoDescription:
    "The Ironside Plumbing demo. A heavy, urgency-led design for plumbers, HVAC, and 24/7 trades. Phone-first hero, hazard-stripe accents, hard-edged buttons.",
}
