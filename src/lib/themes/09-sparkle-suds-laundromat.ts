import type { Theme } from "./types"

export const sparkleSudsLaundromat: Theme = {
  slug: "sparkle-suds-laundromat",
  name: "Sparkle Suds Laundromat",
  industry: "Laundromat",
  city: "Phoenix",
  tagline: "Wash, dry, and fold — picked up at your door tomorrow.",
  description:
    "Friendly ocean-clean palette. Bubble-cyan + warm coral, soft pillowy cards, instant booking. For laundromats, wash & fold, and pickup-delivery laundry brands.",
  mode: "recurring",
  vibe: "friendly-modern",
  hero: "booking-card",
  heroEyebrow: "FREE PICKUP & DELIVERY",
  colors: {
    bg: "#F5FBFD",
    fg: "#0E2A3F",
    primary: "#0EA5E9",
    primaryFg: "#FFFFFF",
    accent: "#F28B82",
    accentFg: "#0E2A3F",
    muted: "#D4ECF6",
    mutedFg: "#4F6B7E",
    border: "#0E2A3F14",
    surface: "#FFFFFF",
    surfaceFg: "#0E2A3F",
  },
  colorVariants: [
    {
      name: "Mint Fresh",
      colors: {
        bg: "#F4FCF7",
        fg: "#0E2A2F",
        primary: "#10B981",
        primaryFg: "#FFFFFF",
        accent: "#FBA5A0",
        accentFg: "#0E2A2F",
        muted: "#D4F0DC",
        mutedFg: "#4F7B6F",
        border: "#0E2A2F14",
        surface: "#FFFFFF",
        surfaceFg: "#0E2A2F",
      },
    },
    {
      name: "Sunrise Peach",
      colors: {
        bg: "#FFF8F2",
        fg: "#3F1E0E",
        primary: "#F97316",
        primaryFg: "#FFFFFF",
        accent: "#38BDF8",
        accentFg: "#3F1E0E",
        muted: "#FFE4D2",
        mutedFg: "#7E5240",
        border: "#3F1E0E14",
        surface: "#FFFFFF",
        surfaceFg: "#3F1E0E",
      },
    },
  ],
  fonts: { display: "plus-jakarta-sans", body: "plus-jakarta-sans", mono: "jetbrains-mono" },
  radius: { sm: "12px", md: "16px", lg: "32px", pill: "100px" },
  button: { shape: "pill", shadow: "soft", weight: "bold", uppercase: false },
  heroImage: {
    url: "/themes/sparkle-suds-laundromat/hero.jpg",
    alt: "Row of front-load washing machines in a clean laundromat",
    credit: "Photo by Raychan on Unsplash",
  },

  seoTitle: "Your Shopfront — Friendly Laundromat & Wash-and-Fold Style",
  seoDescription:
    "The Sparkle Suds Laundromat demo. Bubble-cyan + coral, pillowy cards, instant pickup booking. For laundromats, dry cleaners, and wash-and-fold brands.",
  isThemeOption: true,
  sourceHtmlPath: "09-sparkle-suds-laundromat.html",
  round: 3,
  content: {
    howItWorks: {
      steps: [
        {
          title: "Schedule a pickup",
          body: "Book online in under a minute. We pick up from your door — no driving, no parking, no hauling a basket to the car.",
        },
        {
          title: "We wash and fold",
          body: "Your clothes are washed in commercial machines, dried on your preferred settings, folded neatly — treated like they matter.",
        },
        {
          title: "Delivered back by tomorrow",
          body: "Next-day return to your door. Everything folded, bagged, and ready to put away. Most pickups are back within 24 hours.",
        },
        {
          title: "Recurring plans available",
          body: "Set a weekly or bi-weekly pickup schedule and forget about laundry permanently. Pause or cancel anytime, no fees.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Free", label: "Door pickup + delivery", caption: "We come to you" },
        { value: "24-hr", label: "Turnaround", caption: "Back by tomorrow" },
        { value: "Fragrance-free", label: "Option available", caption: "Sensitive-skin friendly" },
        { value: "No", label: "Contracts required", caption: "Pause or cancel anytime" },
      ],
    },
    finalCta: {
      headline: "Laundry piling up?",
      highlight: "We pick it up tomorrow.",
      body: "Free door pickup, 24-hour turnaround, folded and delivered. Weekly plans available — no contracts.",
      ctaLabel: "Schedule pickup →",
      backgroundImage: {
        url: "/themes/sparkle-suds-laundromat/cta-bg.jpg",
        alt: "Tall stack of freshly folded shirts resting on a blue surface",
      },
    },
  },
}
