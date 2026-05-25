import type { Theme } from "./types"

export const crystallineWindowCo: Theme = {
  slug: "crystalline-window-co",
  name: "Crystalline Window Co.",
  industry: "Window Cleaning",
  city: "Scottsdale",
  tagline: "Streak-free windows, inside and out. Premium service, every panel.",
  description:
    "Dark-mode premium. Deep navy with crystal-cyan accents, glass-card sections, before/after gallery hero. For window cleaners, solar panel cleaning, and exterior detail brands.",
  mode: "project",
  vibe: "sleek-tech",
  hero: "gallery",
  heroEyebrow: "SCOTTSDALE'S TOP-RATED WINDOW PROS",
  colors: {
    bg: "#0A1628",
    fg: "#F5F9FF",
    primary: "#22D3EE",
    primaryFg: "#0A1628",
    accent: "#E2E8F0",
    accentFg: "#0A1628",
    muted: "#152238",
    mutedFg: "#94A3B8",
    border: "#1E3A5F",
    surface: "#1E3A5F",
    surfaceFg: "#F5F9FF",
  },
  colorVariants: [
    {
      name: "Midnight Amber",
      colors: {
        bg: "#0A1628",
        fg: "#F5F9FF",
        primary: "#F59E0B",
        primaryFg: "#0A1628",
        accent: "#E2E8F0",
        accentFg: "#0A1628",
        muted: "#152238",
        mutedFg: "#94A3B8",
        border: "#1E3A5F",
        surface: "#1E3A5F",
        surfaceFg: "#F5F9FF",
      },
    },
    {
      name: "Graphite Mint",
      colors: {
        bg: "#101418",
        fg: "#F0F4F1",
        primary: "#34D399",
        primaryFg: "#101418",
        accent: "#E2E8F0",
        accentFg: "#101418",
        muted: "#1A2024",
        mutedFg: "#94A3A0",
        border: "#2A323A",
        surface: "#1A2024",
        surfaceFg: "#F0F4F1",
      },
    },
  ],
  fonts: { display: "bricolage-grotesque", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "8px", md: "12px", lg: "20px", pill: "100px" },
  button: { shape: "rounded", shadow: "glow", weight: "bold", uppercase: false },
  heroImage: {
    url: "/themes/crystalline-window-co/hero.jpg",
    alt: "Modern building facade with rows of clean glass windows",
    credit: "Photo by Joel Filipe on Unsplash",
  },

  seoTitle: "Apex Sites — Dark Premium Style for Window & Exterior Brands",
  seoDescription:
    "The Crystalline Window Co. demo. Deep navy with cyan glow, glass-card sections, before/after gallery. For window cleaners, exterior detailers, and premium home-service brands.",
  isThemeOption: true,
  sourceHtmlPath: "10-crystalline-window-co.html",
  round: 3,
  content: {
    howItWorks: {
      steps: [
        {
          title: "Book online in 2 minutes",
          body: "Enter your window count and property type — price appears instantly. Pick a date, confirm. That's the whole booking.",
        },
        {
          title: "Trained team shows up",
          body: "Uniformed, insured technicians arrive in a marked vehicle. Screens removed, frames wiped, sills detailed — every panel.",
        },
        {
          title: "Streak-free, every time",
          body: "Pure-water system and professional-grade squeegees. Inside and out, top to bottom. No streaks, no drips, no missed edges.",
        },
        {
          title: "Satisfaction guaranteed",
          body: "We re-clean any window you're not happy with — same day, no extra charge, no questions asked.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Insured", label: "Trained technicians", caption: "Bonded and background-checked" },
        { value: "Pure-water", label: "Streak-free system", caption: "No chemical residue" },
        { value: "Inside+out", label: "Full-panel service", caption: "Screens and frames included" },
        { value: "Guaranteed", label: "Streak-free results", caption: "Re-clean free if not right" },
      ],
    },
    finalCta: {
      headline: "Windows looking hazy?",
      highlight: "We make them crystal.",
      body: "Insured crew, pure-water system, inside and out. Book in 2 minutes — satisfaction guaranteed.",
      ctaLabel: "Book window cleaning →",
      backgroundImage: {
        url: "/themes/crystalline-window-co/cta-bg.jpg",
        alt: "Tall black and gray glass high-rise building under a bright daytime sky",
      },
    },
  },
}
