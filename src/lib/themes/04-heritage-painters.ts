import type { Theme } from "./types"

export const heritagePainters: Theme = {
  slug: "heritage-painters",
  name: "Heritage Painters",
  industry: "Painting",
  city: "Charleston",
  tagline: "Premium house painting. 2-year warranty.",
  description:
    "Warm premium. Editorial Fraunces serif, ivory + terracotta + ink, gallery-led hero. For premium project work.",
  mode: "project",
  vibe: "warm-premium",
  hero: "gallery",
  heroEyebrow: "EST. 2008 — CHARLESTON",
  colors: {
    bg: "#FAF6EE",
    fg: "#1A1614",
    primary: "#1A1614",
    primaryFg: "#FAF6EE",
    accent: "#C8634A",
    accentFg: "#FAF6EE",
    muted: "#E8DFC8",
    mutedFg: "#6B6259",
    border: "#1A161414",
    surface: "#FFFFFF",
    surfaceFg: "#1A1614",
  },
  colorVariants: [
    {
      name: "Slate Brass",
      colors: {
        bg: "#F2EEE6",
        fg: "#15191C",
        primary: "#15191C",
        primaryFg: "#F2EEE6",
        accent: "#A07338",
        accentFg: "#F2EEE6",
        muted: "#DCD7CB",
        mutedFg: "#5C5F62",
        border: "#15191C14",
        surface: "#FAF8F4",
        surfaceFg: "#15191C",
      },
    },
    {
      name: "Garden Sage",
      colors: {
        bg: "#F4F1E8",
        fg: "#1A1F18",
        primary: "#1A1F18",
        primaryFg: "#F4F1E8",
        accent: "#5C7A4A",
        accentFg: "#F4F1E8",
        muted: "#DCE2D2",
        mutedFg: "#5F6358",
        border: "#1A1F1814",
        surface: "#FFFFFF",
        surfaceFg: "#1A1F18",
      },
    },
  ],
  fonts: { display: "fraunces", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "4px", md: "6px", lg: "8px", pill: "100px" },
  button: { shape: "sharp", shadow: "none", weight: "bold", uppercase: false },
  heroImage: {
    url: "/themes/heritage-painters/hero.jpg",
    alt: "Painter using a roller on an interior wall in warm afternoon light",
    credit: "Photo by Theme Photos on Unsplash",
  },

  seoTitle: "Apex Sites — Warm Premium Editorial Style for Craft Brands",
  seoDescription:
    "The Heritage Painters demo. Editorial serif, ivory + terracotta + gold palette, gallery hero. For painters, restorers, and high-craft trades.",
  isThemeOption: true,
  sourceHtmlPath: "04-heritage-painters.html",
  round: 3,
  content: {
    howItWorks: {
      steps: [
        {
          title: "On-site consultation",
          body: "We visit the property, assess the surfaces, and talk through finishes, sheens, and color direction with you — no rush.",
        },
        {
          title: "Detailed written quote",
          body: "Itemized scope, product specs, and timeline handed to you in writing. No vague estimates that balloon mid-project.",
        },
        {
          title: "Meticulous preparation",
          body: "Surfaces cleaned, filled, and primed correctly. Furniture moved and protected. The prep is half the job — we don't skip it.",
        },
        {
          title: "2-year workmanship warranty",
          body: "Every paint job is backed with a 2-year warranty. Peeling, cracking, or bubbling? We come back and make it right.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Free", label: "On-site consultation", caption: "No obligation, no pressure" },
        { value: "Licensed", label: "Fully insured painters", caption: "Bonded on every job" },
        { value: "Premium", label: "Professional-grade paints", caption: "Specified to the surface" },
        { value: "2-year", label: "Workmanship warranty", caption: "Peeling? We come back" },
      ],
    },
    finalCta: {
      headline: "Interior looking tired?",
      highlight: "Let's talk finishes.",
      body: "On-site consultation, itemized quote, premium materials, 2-year warranty. Craft you can actually see.",
      ctaLabel: "Schedule consultation →",
      backgroundImage: {
        url: "/themes/heritage-painters/hero.jpg",
        alt: "Painter using a roller on an interior wall in warm afternoon light",
      },
    },
  },
}
