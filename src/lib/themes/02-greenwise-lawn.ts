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
  heroEyebrow: "BOOK ONLINE — INSTANT QUOTE",
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
  colorVariants: [
    {
      name: "Warm Sage",
      colors: {
        bg: "#F4F0E4",
        fg: "#1A1F18",
        primary: "#2D4A2F",
        primaryFg: "#FAF7ED",
        accent: "#C86432",
        accentFg: "#FAF7ED",
        muted: "#C9D4B8",
        mutedFg: "#6B6F65",
        border: "#2D4A2F26",
        surface: "#FFFFFF",
        surfaceFg: "#1A1F18",
      },
    },
    {
      name: "Slate Moss",
      colors: {
        bg: "#EFEEE6",
        fg: "#15191A",
        primary: "#4A5F4D",
        primaryFg: "#FAF7ED",
        accent: "#B8860B",
        accentFg: "#15191A",
        muted: "#C5CCC0",
        mutedFg: "#646B66",
        border: "#4A5F4D26",
        surface: "#FFFFFF",
        surfaceFg: "#15191A",
      },
    },
  ],
  fonts: { display: "fraunces", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "8px", md: "14px", lg: "22px", pill: "100px" },
  button: { shape: "pill", shadow: "soft", weight: "bold", uppercase: false },
  heroImage: {
    url: "/themes/greenwise-lawn/hero.jpg",
    alt: "Freshly cut green lawn in strong daylight",
    credit: "Photo by Petar Tonchev on Unsplash",
  },

  seoTitle: "Your Shopfront — Naturalist Style for Lawn & Garden Brands",
  seoDescription:
    "The Greenwise Lawn demo. Soft serif, moss + cream palette, booking-card hero. For lawn care, landscaping, and organic-leaning recurring services.",
  isThemeOption: true,
  sourceHtmlPath: "02-greenwise-lawn.html",
  round: 3,
  content: {
    howItWorks: {
      header: {
        eyebrow: "How we work",
        headline: "Quote to consistent lawn —",
        highlight: "same crew, every single visit.",
        sub: "Instant online price, you pick the schedule, we show up on the same day each week. Organic treatments, sharp blades, no shortcuts.",
      },
      steps: [
        {
          title: "Get an instant quote",
          body: "Enter your address and lawn size — our calculator returns a price in under 60 seconds. No call required.",
        },
        {
          title: "Pick your schedule",
          body: "Weekly or bi-weekly, choose the day that fits your routine. We show up on the same day every visit so you can plan around us.",
        },
        {
          title: "We care for it right",
          body: "Organic fertilizer, sharp blades, edged borders — your lawn gets treated like it's our own. No chemical shortcuts.",
        },
        {
          title: "Consistent results",
          body: "Same crew each visit learns what your lawn needs. You get photos after every service so you know we were there.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Organic", label: "Lawn treatments", caption: "Safe for kids and pets" },
        { value: "Weekly", label: "Or bi-weekly service", caption: "Your schedule, your choice" },
        { value: "Insured", label: "Fully covered crew", caption: "Your property protected" },
        { value: "Free", label: "Online estimate", caption: "Price in 60 seconds" },
      ],
    },
    finalCta: {
      headline: "Lawn looking overgrown?",
      highlight: "Get a quote in 60 seconds.",
      body: "Organic treatments, consistent crew, no contracts. Book online — first cut as soon as this week.",
      ctaLabel: "Get instant quote →",
      backgroundImage: {
        url: "/themes/greenwise-lawn/cta-bg.jpg",
        alt: "Green and black lawn mower sitting on freshly cut grass",
      },
    },
  },
}
