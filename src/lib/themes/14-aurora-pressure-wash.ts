import type { Theme } from "./types"

export const auroraPressureWash: Theme = {
  slug: "aurora-pressure-wash",
  name: "Aurora Pressure Washing",
  industry: "Pressure Washing",
  city: "Chandler",
  tagline: "Driveways, patios, siding — restored in a single afternoon.",
  description:
    "Sky-blue + sunny gold. Bright friendly-modern palette, before/after gallery hero, soft-wash safe messaging. For pressure washing, soft wash, exterior restoration, and curb-appeal brands.",
  mode: "project",
  vibe: "friendly-modern",
  hero: "gallery",
  heroEyebrow: "SOFT WASH & PRESSURE — INSURED",
  colors: {
    bg: "#F4FAFE",
    fg: "#0E2640",
    primary: "#1E88E5",
    primaryFg: "#FFFFFF",
    accent: "#F9B408",
    accentFg: "#0E2640",
    muted: "#D9EAF7",
    mutedFg: "#4A6680",
    border: "#0E264014",
    surface: "#FFFFFF",
    surfaceFg: "#0E2640",
  },
  colorVariants: [
    {
      name: "Fresh Mint",
      colors: {
        bg: "#F4FBF8",
        fg: "#0E2640",
        primary: "#1E88E5",
        primaryFg: "#FFFFFF",
        accent: "#34D399",
        accentFg: "#0E2640",
        muted: "#D2EFE4",
        mutedFg: "#4A6680",
        border: "#0E264014",
        surface: "#FFFFFF",
        surfaceFg: "#0E2640",
      },
    },
    {
      name: "Sunset Bay",
      colors: {
        bg: "#FFFBF4",
        fg: "#1F1B14",
        primary: "#0E7BC4",
        primaryFg: "#FFFFFF",
        accent: "#F28B82",
        accentFg: "#1F1B14",
        muted: "#FFE2D2",
        mutedFg: "#5A5044",
        border: "#1F1B1414",
        surface: "#FFFFFF",
        surfaceFg: "#1F1B14",
      },
    },
  ],
  fonts: { display: "bricolage-grotesque", body: "plus-jakarta-sans", mono: "jetbrains-mono" },
  radius: { sm: "10px", md: "14px", lg: "24px", pill: "100px" },
  button: { shape: "pill", shadow: "soft", weight: "bold", uppercase: false },
  heroImage: {
    url: "/themes/aurora-pressure-wash/hero.jpg",
    alt: "High-pressure water spray restoring a grey concrete surface",
    credit: "Photo by Pixabay on Pexels",
  },

  seoTitle: "Apex Sites — Bright Friendly Style for Exterior Restoration Brands",
  seoDescription:
    "The Aurora Pressure Washing demo. Sky blue + sunny gold, bricolage-grotesque headlines, before/after gallery hero. For pressure washing, soft wash, paver sealing, and curb-appeal brands.",
  isThemeOption: true,
  sourceHtmlPath: "14-aurora-pressure-wash.html",
  round: 3,
  content: {
    howItWorks: {
      steps: [
        {
          title: "Get a free quote",
          body: "Send us a photo or your address. We quote driveways, patios, roofs, and siding fast — no site visit required.",
        },
        {
          title: "We show up ready",
          body: "Fully insured crew arrives with commercial-grade equipment. We assess the surface and pick the right method — pressure or soft wash.",
        },
        {
          title: "Restored in an afternoon",
          body: "Most jobs done same day. Concrete, pavers, vinyl siding, roof shingles — we leave it looking like new without surface damage.",
        },
        {
          title: "Walk-through and done",
          body: "We walk the finished job with you before we pack up. Not satisfied with a spot? We re-do it on the spot, no argument.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Free", label: "Photo estimate", caption: "No visit needed to quote" },
        { value: "Insured", label: "Fully covered crew", caption: "Your property protected" },
        { value: "Same-day", label: "Most jobs finished", caption: "In and out, one afternoon" },
        { value: "Safe", label: "Soft wash available", caption: "Right method for every surface" },
      ],
    },
    finalCta: {
      headline: "Driveway looking rough?",
      highlight: "We restore it same day.",
      body: "Free photo quote, insured crew, soft wash safe. Driveways, patios, siding — done in one afternoon.",
      ctaLabel: "Get a free quote →",
      backgroundImage: {
        url: "/themes/aurora-pressure-wash/hero.jpg",
        alt: "High-pressure water spray restoring a grey concrete surface",
      },
    },
  },
}
