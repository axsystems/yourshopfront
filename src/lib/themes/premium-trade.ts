import type { Theme } from "./types"

/**
 * Promoted from Round 1 to a homepage theme option.
 * Source: 04-premium-trade.html (North & Copper plumbing & HVAC).
 */
export const premiumTrade: Theme = {
  slug: "premium-trade",
  name: "Premium Trade",
  industry: "Plumbing & HVAC",
  city: "Boston",
  tagline: "Plumbing & HVAC, properly engineered.",
  description:
    "Editorial trade brand for premium-leaning home-services contractors. Bone + copper + ink with a pipe-blue accent. Fraunces serif headline lockup, stat tiles, calm pill buttons. Different vibe from Heritage — masculine, engineered, magazine-grade.",
  mode: "project",
  vibe: "warm-premium",
  hero: "form-card",
  heroEyebrow: "EST. 1996 — LICENSED & INSURED",
  colors: {
    bg: "#FAF8F4",
    fg: "#0E0E0E",
    primary: "#B87333",
    primaryFg: "#FAF8F4",
    accent: "#2D5BFF",
    accentFg: "#FAF8F4",
    muted: "#EDEAE2",
    mutedFg: "#3C3F45",
    border: "#0E0E0E14",
    surface: "#F4F1EB",
    surfaceFg: "#0E0E0E",
  },
  fonts: { display: "fraunces", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "8px", md: "12px", lg: "18px", pill: "999px" },
  button: { shape: "pill", shadow: "soft", weight: "bold", uppercase: false },
  heroImage: {
    url: "/themes/premium-trade/hero.jpg",
    alt: "Tradesperson's tools laid out on a clean workbench",
    credit: "Photo by Theme Photos on Unsplash",
  },

  seoTitle: "Apex Sites — Editorial Trade Style for Premium Contractors",
  seoDescription:
    "The Premium Trade demo. Bone + copper + pipe-blue palette, Fraunces serif display, form-card hero with stat tiles. Built for plumbers, HVAC techs, electricians, and trades that want to feel premium.",
  isThemeOption: true,
  sourceHtmlPath: "04-premium-trade.html",
  round: 1,
}
