import type { Theme } from "./types"

export const brightsideCleaning: Theme = {
  slug: "brightside-cleaning",
  name: "Brightside Cleaning",
  industry: "Cleaning",
  city: "Seattle",
  tagline: "Book a home cleaning in 60 seconds. Flat-rate, no contracts.",
  description:
    "Friendly modern with sky + mint gradient. Plus Jakarta Sans + Caveat script. Booking-card hero.",
  mode: "recurring",
  vibe: "friendly-modern",
  hero: "booking-card",
  heroEyebrow: "BOOK ONLINE — INSTANT PRICE",
  colors: {
    bg: "#FAFCFE",
    fg: "#15293D",
    primary: "#4FA8E0",
    primaryFg: "#FFFFFF",
    accent: "#6FCFB6",
    accentFg: "#15293D",
    muted: "#C9E6F7",
    mutedFg: "#6B7B8C",
    border: "#15293D14",
    surface: "#FFFFFF",
    surfaceFg: "#15293D",
  },
  colorVariants: [
    {
      name: "Lavender Lemon",
      colors: {
        bg: "#FAFAFE",
        fg: "#1F1F3D",
        primary: "#7C5BD9",
        primaryFg: "#FFFFFF",
        accent: "#F7D26B",
        accentFg: "#1F1F3D",
        muted: "#E1D9F7",
        mutedFg: "#6B6B8C",
        border: "#1F1F3D14",
        surface: "#FFFFFF",
        surfaceFg: "#1F1F3D",
      },
    },
    {
      name: "Coral Cream",
      colors: {
        bg: "#FFFAF4",
        fg: "#2D1F1F",
        primary: "#FF6F61",
        primaryFg: "#FFFFFF",
        accent: "#FFB74D",
        accentFg: "#2D1F1F",
        muted: "#FFE2D9",
        mutedFg: "#7B5C5C",
        border: "#2D1F1F14",
        surface: "#FFFFFF",
        surfaceFg: "#2D1F1F",
      },
    },
  ],
  fonts: { display: "plus-jakarta-sans", body: "plus-jakarta-sans", mono: "jetbrains-mono" },
  radius: { sm: "10px", md: "14px", lg: "28px", pill: "100px" },
  button: { shape: "pill", shadow: "soft", weight: "bold", uppercase: false },
  heroImage: {
    url: "/themes/brightside-cleaning/hero.jpg",
    alt: "Bright clean living room with neutral textiles and natural light",
    credit: "Photo by Roam In Color on Unsplash",
  },

  seoTitle: "Your Shopfront — Friendly Modern Booking-Card Style",
  seoDescription:
    "The Brightside Cleaning demo. Sky + mint gradient, soft pillowy cards, instant-book hero. For cleaners, dog walkers, and recurring home services.",
  isThemeOption: true,
  sourceHtmlPath: "05-brightside-cleaning.html",
  round: 3,
  content: {
    howItWorks: {
      header: {
        eyebrow: "How it works",
        headline: "Book in 60 seconds,",
        highlight: "same cleaner every time.",
        sub: "Instant flat-rate price, background-checked cleaner, checklist-driven clean. Love it or we come back within 24 hours at no charge.",
      },
      steps: [
        {
          title: "Book in 60 seconds",
          body: "Select your home size, choose a date, and get an instant flat-rate price. No back-and-forth, no in-home estimate.",
        },
        {
          title: "Meet your cleaner",
          body: "We send the same cleaner every visit — background-checked, insured, trained on our process. You get a name, not a rotating stranger.",
        },
        {
          title: "We clean it properly",
          body: "Checklist-driven, top-to-bottom clean. Kitchens, bathrooms, bedrooms — every surface covered, not just the obvious spots.",
        },
        {
          title: "Love it or it's free",
          body: "If something's not right, we come back within 24 hours and re-clean at no charge. No debate, no drama.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Flat-rate", label: "Instant pricing", caption: "No hidden fees" },
        { value: "Insured", label: "Background-checked cleaners", caption: "Every team member" },
        { value: "Same", label: "Cleaner each visit", caption: "Someone who knows your home" },
        { value: "24-hr", label: "Re-clean guarantee", caption: "Not right? We come back" },
      ],
    },
    finalCta: {
      headline: "Home needs a proper clean?",
      highlight: "Book in 60 seconds.",
      body: "Flat-rate pricing, background-checked cleaners, same cleaner every time. Love it or it's free.",
      ctaLabel: "Get instant price →",
      backgroundImage: {
        url: "/themes/brightside-cleaning/cta-bg.jpg",
        alt: "Four brown wooden stools lined up at a clean kitchen island",
      },
    },
  },
}
