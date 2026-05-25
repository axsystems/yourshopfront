import type { Theme } from "./types"

export const summitRoofing: Theme = {
  slug: "summit-roofing",
  name: "Summit Roofing",
  industry: "Roofing",
  city: "Dallas–Fort Worth",
  tagline: "GAF Master Elite® roofers. Free inspection.",
  description:
    "Industrial dark with Oswald display. Black + char + orange glow. Form-card hero for storm-damage urgency.",
  mode: "project",
  vibe: "bold-industrial",
  hero: "form-card",
  heroEyebrow: "STORM DAMAGE? WE INSPECT FREE",
  colors: {
    bg: "#0F0F0F",
    fg: "#F4F4F5",
    primary: "#F97316",
    primaryFg: "#0F0F0F",
    accent: "#F4F4F5",
    accentFg: "#0F0F0F",
    muted: "#2A2D33",
    mutedFg: "#9CA3AE",
    border: "#3F454D",
    surface: "#1A1A1A",
    surfaceFg: "#F4F4F5",
  },
  colorVariants: [
    {
      name: "Electric Cyan",
      colors: {
        bg: "#0F0F0F",
        fg: "#F4F4F5",
        primary: "#00D9FF",
        primaryFg: "#0F0F0F",
        accent: "#F4F4F5",
        accentFg: "#0F0F0F",
        muted: "#2A2D33",
        mutedFg: "#9CA3AE",
        border: "#3F454D",
        surface: "#1A1A1A",
        surfaceFg: "#F4F4F5",
      },
    },
    {
      name: "Dark Crimson",
      colors: {
        bg: "#0F0F0F",
        fg: "#F4F4F5",
        primary: "#C2261D",
        primaryFg: "#FFFFFF",
        accent: "#F4F4F5",
        accentFg: "#0F0F0F",
        muted: "#2A2D33",
        mutedFg: "#9CA3AE",
        border: "#3F454D",
        surface: "#1A1A1A",
        surfaceFg: "#F4F4F5",
      },
    },
  ],
  fonts: { display: "oswald", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "2px", lg: "4px", pill: "0" },
  button: { shape: "sharp", shadow: "glow", weight: "heavy", uppercase: true },
  heroImage: {
    url: "/themes/summit-roofing/hero.jpg",
    alt: "Roofer installing dark asphalt shingles on a residential rooftop",
    credit: "Photo by Pixabay on Pexels",
  },

  seoTitle: "Apex Sites — Industrial Dark Style for Roofing & Exterior Brands",
  seoDescription:
    "The Summit Roofing demo. Black + orange glow, Oswald display, form-card hero. For roofers, exterior contractors, and storm-restoration brands.",
  isThemeOption: true,
  sourceHtmlPath: "06-summit-roofing.html",
  round: 3,
  content: {
    howItWorks: {
      steps: [
        {
          title: "Free storm inspection",
          body: "We get on the roof, take photos, and give you a written damage assessment — no charge, no pressure, no sales pitch.",
        },
        {
          title: "Straight insurance support",
          body: "We document everything your adjuster needs. We walk the claim with you so nothing gets missed and nothing gets lowballed.",
        },
        {
          title: "Crew on your roof",
          body: "GAF Master Elite certified crew. Manufacturer-spec installation, all debris hauled same day, yard left cleaner than we found it.",
        },
        {
          title: "Transferable warranty",
          body: "Your roof comes with a full manufacturer warranty plus our own workmanship coverage — transferable to the next owner.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Free", label: "Storm inspection", caption: "No obligation, no pitch" },
        { value: "Licensed", label: "GAF certified crew", caption: "Bonded and insured" },
        { value: "Same-day", label: "Debris removal", caption: "Yard clean before we leave" },
        { value: "Warranty", label: "Workmanship backed", caption: "Transferable to next owner" },
      ],
    },
    finalCta: {
      headline: "Storm hit your roof?",
      highlight: "We inspect free — today.",
      body: "Licensed crew, full insurance support, same-day debris haul. No cost to get on the roof and find out.",
      ctaLabel: "Schedule free inspection →",
      backgroundImage: {
        url: "/themes/summit-roofing/hero.jpg",
        alt: "Roofer installing dark asphalt shingles on a residential rooftop",
      },
    },
  },
}
