import type { Theme } from "./types"

export const bellhornMovers: Theme = {
  slug: "bellhorn-movers",
  name: "Bellhorn Movers",
  industry: "Moving",
  city: "Boston",
  tagline: "Friendliest movers. Book in 60 seconds. Flat-rate hourly.",
  description:
    "Friendly modern. Bricolage Grotesque, navy + orange, hard-shadow buttons. Quote-card hero with a live price.",
  mode: "project",
  vibe: "friendly-modern",
  hero: "calculator",
  heroEyebrow: "INSTANT MOVE QUOTE",
  colors: {
    bg: "#FFF8F0",
    fg: "#0A1628",
    primary: "#FF7A2D",
    primaryFg: "#081B36",
    accent: "#0F2A4F",
    accentFg: "#FFF8F0",
    muted: "#FFE5D2",
    mutedFg: "#6B7280",
    border: "#0F2A4F1A",
    surface: "#FFFFFF",
    surfaceFg: "#0A1628",
  },
  colorVariants: [
    {
      name: "Sunset Coral",
      colors: {
        bg: "#FFF8F0",
        fg: "#0A1628",
        primary: "#FF6B5B",
        primaryFg: "#FFFFFF",
        accent: "#051A38",
        accentFg: "#FFF8F0",
        muted: "#FFD8D2",
        mutedFg: "#6B7280",
        border: "#051A381A",
        surface: "#FFFFFF",
        surfaceFg: "#0A1628",
      },
    },
    {
      name: "Teal Indigo",
      colors: {
        bg: "#F4FAF9",
        fg: "#0A1628",
        primary: "#1B7F7E",
        primaryFg: "#FFFFFF",
        accent: "#2E4053",
        accentFg: "#F4FAF9",
        muted: "#D2EAE7",
        mutedFg: "#6B7280",
        border: "#2E40531A",
        surface: "#FFFFFF",
        surfaceFg: "#0A1628",
      },
    },
  ],
  fonts: { display: "bricolage-grotesque", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "8px", md: "14px", lg: "24px", pill: "100px" },
  button: { shape: "rounded", shadow: "hard-offset", weight: "heavy", uppercase: false },
  heroImage: {
    url: "/themes/bellhorn-movers/hero.jpg",
    alt: "Stack of brown cardboard moving boxes in an empty sunlit room",
    credit: "Photo by HiveBoxx on Unsplash",
  },

  seoTitle: "Your Shopfront — Friendly Modern Style with Live Quote Calculator",
  seoDescription:
    "The Bellhorn Movers demo. Playful, navy + orange, calculator-led hero. For movers, junk removal, and any project-based service that prices by the hour.",
  isThemeOption: true,
  sourceHtmlPath: "03-bellhorn-movers.html",
  round: 3,
  content: {
    howItWorks: {
      steps: [
        {
          title: "Get your move price",
          body: "Enter your pickup and drop-off zip codes and home size — our calculator shows an instant flat-rate estimate. No waiting on a callback.",
        },
        {
          title: "Book your date",
          body: "Pick the day that works. We send a confirmation and reminder so nothing falls through. Your spot is held the moment you book.",
        },
        {
          title: "We do the heavy lifting",
          body: "Uniformed two-person crew wraps furniture, disassembles beds, loads the truck. You point, we move — you don't touch a box.",
        },
        {
          title: "Settled in, same day",
          body: "We place everything where you want it in the new space. If something needs to swap rooms, we do it before we leave.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Flat-rate", label: "Instant move quote", caption: "No hourly billing surprises" },
        { value: "Insured", label: "Licensed and bonded", caption: "Your belongings covered" },
        { value: "Same-day", label: "Moves available", caption: "Book by 10am, move today" },
        { value: "Free", label: "Furniture wrapping", caption: "Included on every job" },
      ],
    },
    finalCta: {
      headline: "Moving soon?",
      highlight: "Get your price in seconds.",
      body: "Flat-rate moves, licensed and insured crew, same-day available. Book online — we do the rest.",
      ctaLabel: "Get move estimate →",
      backgroundImage: {
        url: "/themes/bellhorn-movers/cta-bg.jpg",
        alt: "White freight truck travelling along an open road during daytime",
      },
    },
  },
}
