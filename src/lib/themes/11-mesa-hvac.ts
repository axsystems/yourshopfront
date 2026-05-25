import type { Theme } from "./types"

export const mesaHvac: Theme = {
  slug: "mesa-hvac",
  name: "Mesa HVAC",
  industry: "HVAC",
  city: "Mesa",
  tagline: "A/C down? We'll be there today — guaranteed.",
  description:
    "Desert-emergency palette. Deep navy + sunset orange, condensed display type, phone-first hero. For HVAC, A/C repair, and 24/7 climate trades in hot markets.",
  mode: "emergency",
  vibe: "bold-industrial",
  hero: "phone-first",
  heroEyebrow: "SAME-DAY A/C REPAIR — 24/7",
  colors: {
    bg: "#0F1B2D",
    fg: "#F8FAFC",
    primary: "#F97316",
    primaryFg: "#0F1B2D",
    accent: "#FACC15",
    accentFg: "#0F1B2D",
    muted: "#1E2D44",
    mutedFg: "#94A3B8",
    border: "#1E2D44",
    surface: "#16243A",
    surfaceFg: "#F8FAFC",
  },
  colorVariants: [
    {
      name: "Code Red",
      colors: {
        bg: "#0E0E10",
        fg: "#F8FAFC",
        primary: "#DC2626",
        primaryFg: "#FFFFFF",
        accent: "#FACC15",
        accentFg: "#0E0E10",
        muted: "#1E1E20",
        mutedFg: "#94A3B8",
        border: "#2A2A2D",
        surface: "#16161A",
        surfaceFg: "#F8FAFC",
      },
    },
    {
      name: "Monsoon Sky",
      colors: {
        bg: "#0F1B2D",
        fg: "#F8FAFC",
        primary: "#38BDF8",
        primaryFg: "#0F1B2D",
        accent: "#FACC15",
        accentFg: "#0F1B2D",
        muted: "#1E2D44",
        mutedFg: "#94A3B8",
        border: "#1E2D44",
        surface: "#16243A",
        surfaceFg: "#F8FAFC",
      },
    },
  ],
  fonts: { display: "oswald", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "4px", md: "6px", lg: "10px", pill: "100px" },
  button: { shape: "sharp", shadow: "hard-offset", weight: "heavy", uppercase: true },
  heroImage: {
    url: "/themes/mesa-hvac/hero.jpg",
    alt: "Outdoor air conditioning condenser unit beside a residential wall",
    credit: "Photo by Pixabay on Pexels",
  },

  seoTitle: "Your Shopfront — Emergency HVAC & 24/7 Trade Style",
  seoDescription:
    "The Mesa HVAC demo. Navy + sunset orange, condensed Oswald headlines, phone-first hero. For HVAC, A/C repair, garage-door, and any 24/7 emergency trade.",
  isThemeOption: true,
  sourceHtmlPath: "11-mesa-hvac.html",
  round: 3,
  content: {
    howItWorks: {
      header: {
        eyebrow: "How we work",
        headline: "You call, we come —",
        highlight: "unit back on before we leave.",
        sub: "Live dispatch any hour, flat-rate quote on site, parts stocked on the truck. Most repairs done same visit.",
      },
      steps: [
        {
          title: "Call — we answer now",
          body: "A/C out at 2am in July? We pick up. Real dispatcher, real tech, on the way — not a voicemail that calls back tomorrow.",
        },
        {
          title: "Flat-rate quote on site",
          body: "Technician diagnoses the system, tells you the price before touching anything. No trip-charge bait-and-switch.",
        },
        {
          title: "Fixed, same visit",
          body: "We stock the parts other guys have to order. Most repairs done the same visit — unit back on before we leave.",
        },
        {
          title: "Covered for a year",
          body: "Every repair is backed with a 1-year parts and labor warranty. Cool your house, not your confidence.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "24/7", label: "Same-day dispatch", caption: "Live answer, not a queue" },
        { value: "Licensed", label: "Certified technicians", caption: "Bonded and insured" },
        { value: "Flat-rate", label: "No surprise billing", caption: "Quoted before we start" },
        { value: "1-year", label: "Repair warranty", caption: "Parts and labor covered" },
      ],
    },
    finalCta: {
      headline: "A/C down in the desert?",
      highlight: "We'll be there today.",
      body: "24/7 dispatch, same-visit repairs, flat-rate pricing. Call now — a licensed tech answers.",
      ctaLabel: "Get a tech out today →",
      backgroundImage: {
        url: "/themes/mesa-hvac/cta-bg.jpg",
        alt: "Finger pressing a button on a digital thermostat display",
      },
    },
  },
}
