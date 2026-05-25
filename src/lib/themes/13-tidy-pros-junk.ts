import type { Theme } from "./types"

export const tidyProsJunk: Theme = {
  slug: "tidy-pros-junk",
  name: "Tidy Pros Junk Removal",
  industry: "Junk Removal",
  city: "Phoenix",
  tagline: "Text us a photo. We'll haul it today — flat-rate, no surprises.",
  description:
    "Bold + friendly contrast palette. Soft black on off-white with coral accent, confident extra-bold headlines, photo-quote form hero. For junk removal, hauling, demo work, and project-mode trades.",
  mode: "project",
  vibe: "friendly-modern",
  hero: "form-card",
  heroEyebrow: "FLAT-RATE PHOTO QUOTES",
  colors: {
    bg: "#FAFAFA",
    fg: "#0A0A0A",
    primary: "#F28B82",
    primaryFg: "#0A0A0A",
    accent: "#0A0A0A",
    accentFg: "#FAD4D1",
    muted: "#EFEFEF",
    mutedFg: "#525252",
    border: "#0A0A0A14",
    surface: "#FFFFFF",
    surfaceFg: "#0A0A0A",
  },
  colorVariants: [
    {
      name: "Lime Hauler",
      colors: {
        bg: "#FAFAFA",
        fg: "#0A0A0A",
        primary: "#84CC16",
        primaryFg: "#0A0A0A",
        accent: "#0A0A0A",
        accentFg: "#D9F99D",
        muted: "#EFEFEF",
        mutedFg: "#525252",
        border: "#0A0A0A14",
        surface: "#FFFFFF",
        surfaceFg: "#0A0A0A",
      },
    },
    {
      name: "Ash Gold",
      colors: {
        bg: "#F7F6F4",
        fg: "#1A1A1A",
        primary: "#B8860B",
        primaryFg: "#FFFFFF",
        accent: "#1A1A1A",
        accentFg: "#F4E4BC",
        muted: "#E8E5E0",
        mutedFg: "#5A5A5A",
        border: "#1A1A1A14",
        surface: "#FFFFFF",
        surfaceFg: "#1A1A1A",
      },
    },
  ],
  fonts: { display: "plus-jakarta-sans", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "10px", md: "16px", lg: "24px", pill: "100px" },
  button: { shape: "pill", shadow: "soft", weight: "heavy", uppercase: false },
  heroImage: {
    url: "/themes/tidy-pros-junk/hero.jpg",
    alt: "Pickup truck loaded with materials parked in front of a home",
    credit: "Photo by Erik Mclean on Unsplash",
  },

  seoTitle: "Apex Sites — Bold Friendly Style for Junk, Hauling & Project Trades",
  seoDescription:
    "The Tidy Pros demo. High-contrast black + coral, confident headlines, photo-quote form hero. For junk removal, hauling, demolition, and any photo-quote service brand.",
  isThemeOption: true,
  sourceHtmlPath: "13-tidy-pros-junk.html",
  round: 3,
  content: {
    howItWorks: {
      steps: [
        {
          title: "Text us a photo",
          body: "Snap a photo of what needs to go. Text it over and we send back a flat-rate price — no in-person estimate needed.",
        },
        {
          title: "Pick a time",
          body: "Choose a two-hour window that works for you. We confirm, we show up on time — no four-hour wait-around windows.",
        },
        {
          title: "We haul everything",
          body: "Old furniture, appliances, yard debris, construction leftovers — two-person crew loads it all. You don't lift a thing.",
        },
        {
          title: "Space cleared, done",
          body: "We sweep the area before we leave. Items that can be donated go to a local charity — we handle the drop-off.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Flat-rate", label: "Photo quote", caption: "No surprise charges" },
        { value: "Same-day", label: "Available pickup", caption: "Book by noon, gone today" },
        { value: "Insured", label: "Fully covered crew", caption: "Your property protected" },
        { value: "Free", label: "Donation drop-off", caption: "Usable items don't landfill" },
      ],
    },
    finalCta: {
      headline: "Done looking at that pile?",
      highlight: "We'll haul it today.",
      body: "Text a photo, get a flat-rate price, pick a window. Two-person crew, fully insured, same-day available.",
      ctaLabel: "Get a photo quote →",
      backgroundImage: {
        url: "/themes/tidy-pros-junk/cta-bg.jpg",
        alt: "Residential garage filled with stacked clutter and stored tools",
      },
    },
  },
}
