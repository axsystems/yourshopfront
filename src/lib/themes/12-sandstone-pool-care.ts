import type { Theme } from "./types"

export const sandstonePoolCare: Theme = {
  slug: "sandstone-pool-care",
  name: "Sandstone Pool Care",
  industry: "Pool Service",
  city: "Gilbert",
  tagline: "Crystal-clear water, every week. Weekly pool care done right.",
  description:
    "Warm-premium desert palette. Sandstone cream + pool-aqua accents, editorial serif headlines, instant-quote calculator hero. For pool service, weekly maintenance, and recurring outdoor brands.",
  mode: "recurring",
  vibe: "warm-premium",
  hero: "calculator",
  heroEyebrow: "WEEKLY POOL CARE — INSTANT QUOTE",
  colors: {
    bg: "#FAF6EE",
    fg: "#1F2A3A",
    primary: "#0EA5B8",
    primaryFg: "#FFFFFF",
    accent: "#D97757",
    accentFg: "#FAF6EE",
    muted: "#EDE3D0",
    mutedFg: "#6E5E48",
    border: "#1F2A3A14",
    surface: "#FFFFFF",
    surfaceFg: "#1F2A3A",
  },
  colorVariants: [
    {
      name: "Agave Sage",
      colors: {
        bg: "#FAF6EE",
        fg: "#1F2A28",
        primary: "#6B8E62",
        primaryFg: "#FFFFFF",
        accent: "#D9A441",
        accentFg: "#1F2A28",
        muted: "#E5E0CE",
        mutedFg: "#6E5E48",
        border: "#1F2A2814",
        surface: "#FFFFFF",
        surfaceFg: "#1F2A28",
      },
    },
    {
      name: "Sunset Pool",
      colors: {
        bg: "#FFF5EE",
        fg: "#3A1F1F",
        primary: "#0EA5B8",
        primaryFg: "#FFFFFF",
        accent: "#F97316",
        accentFg: "#FFF5EE",
        muted: "#FFE0CE",
        mutedFg: "#7E5648",
        border: "#3A1F1F14",
        surface: "#FFFFFF",
        surfaceFg: "#3A1F1F",
      },
    },
  ],
  fonts: { display: "fraunces", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "8px", md: "12px", lg: "24px", pill: "100px" },
  button: { shape: "pill", shadow: "soft", weight: "bold", uppercase: false },
  heroImage: {
    url: "/themes/sandstone-pool-care/hero.jpg",
    alt: "Sun-dappled blue pool water with gentle ripples and tile edge",
    credit: "Photo by Tim Hüfner on Unsplash",
  },

  seoTitle: "Your Shopfront — Warm Premium Style for Pool & Outdoor Service Brands",
  seoDescription:
    "The Sandstone Pool Care demo. Sandstone cream + pool-aqua, editorial Fraunces headlines, instant-quote calculator. For pool service, lawn care, and recurring outdoor brands.",
  isThemeOption: true,
  sourceHtmlPath: "12-sandstone-pool-care.html",
  round: 3,
  content: {
    howItWorks: {
      header: {
        eyebrow: "How it works",
        headline: "Weekly service,",
        highlight: "crystal water or we come back free.",
        sub: "Instant online pricing, same tech every visit, service report after every call. You don't watch the chemistry — we do.",
      },
      steps: [
        {
          title: "Get your weekly price",
          body: "Enter your pool size and type — our calculator returns your weekly rate instantly. No waiting for a callback.",
        },
        {
          title: "We set up service",
          body: "Your tech introduces themselves, learns your system, and sets up a gate code or key hold. One setup, seamless every week after.",
        },
        {
          title: "Weekly care, every visit",
          body: "Chemistry balanced, filter checked, baskets cleared, surfaces brushed. We leave a service report so you know exactly what was done.",
        },
        {
          title: "Crystal water, guaranteed",
          body: "If your pool isn't swim-ready after a visit, we come back and fix it at no charge. Clear water is the only standard we keep.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Weekly", label: "Scheduled service", caption: "Same tech every visit" },
        { value: "Certified", label: "Pool chemistry experts", caption: "CPO licensed" },
        { value: "Free", label: "Instant online quote", caption: "No callbacks needed" },
        { value: "Guaranteed", label: "Crystal-clear water", caption: "We come back if not right" },
      ],
    },
    finalCta: {
      headline: "Pool cloudy again?",
      highlight: "We keep it crystal every week.",
      body: "Certified technicians, weekly service, instant online pricing. Clear water or we come back free.",
      ctaLabel: "Get weekly rate →",
      backgroundImage: {
        url: "/themes/sandstone-pool-care/cta-bg.jpg",
        alt: "Blue tiled swimming pool with sunlight reflecting off the tile edge",
      },
    },
  },
}
