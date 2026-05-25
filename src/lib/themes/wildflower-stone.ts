import type { Theme } from "./types"

/** Round 2 portfolio piece. Source: 02-wildflower-stone.html (florist + apothecary). */
export const wildflowerStone: Theme = {
  slug: "wildflower-stone",
  name: "Wildflower & Stone",
  industry: "Florist / Apothecary",
  city: "Hudson Valley",
  tagline: "Florist, apothecary, slow goods.",
  description:
    "Slow-goods editorial. Cream + sage + dusty rose + gold, Cormorant Garamond and EB Garamond (substituted Playfair + Fraunces). Hand-drawn leaf dividers, all-italic nav.",
  mode: "project",
  vibe: "naturalist",
  hero: "gallery",
  heroEyebrow: "SEASONAL — SHOP THIS WEEK",
  colors: {
    bg: "#F5EFE0",
    fg: "#2A2520",
    primary: "#2A2520",
    primaryFg: "#F5EFE0",
    accent: "#C4A097",
    accentFg: "#2A2520",
    muted: "#ECE3CD",
    mutedFg: "#6B7C5F",
    border: "#2A25201A",
    surface: "#FAF6EA",
    surfaceFg: "#2A2520",
  },
  fonts: { display: "playfair-display", body: "fraunces", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "2px", lg: "4px", pill: "999px" },
  button: { shape: "sharp", shadow: "none", weight: "regular", uppercase: false },
  heroImage: {
    url: "/themes/wildflower-stone/hero.jpg",
    alt: "Wildflowers and dried botanicals arranged on a weathered stone surface",
    credit: "Photo by Annie Spratt on Unsplash",
  },

  seoTitle: "Wildflower & Stone — Florist & Apothecary · Your Shopfront Portfolio",
  seoDescription:
    "Your Shopfront portfolio: a slow-goods florist and apothecary. Cream + sage + rose + gold, Cormorant Garamond, hand-drawn dividers. Built for florists, apothecaries, and craft retail.",
  isThemeOption: true,
  sourceHtmlPath: "02-wildflower-stone.html",
  round: 2,
  content: {
    howItWorks: {
      steps: [
        {
          title: "Browse what's in season",
          body: "Our selection changes with the land. Weekly drops of seasonal blooms, dried botanicals, and apothecary goods — no filler, no dyes.",
        },
        {
          title: "Order or walk in",
          body: "Custom arrangements by request, or shop the studio on weekends. We do weddings, events, and weekly stems for the home.",
        },
        {
          title: "We arrange with intention",
          body: "Every arrangement is composed by hand — foraged textures, locally sourced flowers, no floral foam. Made to last longer, look quieter.",
        },
        {
          title: "Wrapped and ready",
          body: "Local pickup from the Hudson Valley studio, or ship-ready for dried botanicals. Gift wrapping in recycled paper, always.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Seasonal", label: "Blooms only", caption: "No dyed or artificial filler" },
        { value: "Local", label: "Hudson Valley sourced", caption: "When the land allows" },
        { value: "Custom", label: "Arrangements available", caption: "Weddings and events welcome" },
        { value: "Dried", label: "Botanicals ship", caption: "Across the US" },
      ],
    },
    finalCta: {
      headline: "Want flowers that feel real?",
      highlight: "Seasonal, local, arranged by hand.",
      body: "Wildflowers, dried botanicals, and slow goods from the Hudson Valley. Custom arrangements available.",
      ctaLabel: "See what's in season →",
      backgroundImage: {
        url: "/themes/wildflower-stone/cta-bg.jpg",
        alt: "Assorted wildflowers gathered on a brown wood surface",
      },
    },
  },
}
