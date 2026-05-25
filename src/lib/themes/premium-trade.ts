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
  content: {
    howItWorks: {
      header: {
        eyebrow: "Our process",
        headline: "Properly diagnosed,",
        highlight: "properly engineered, documented at completion.",
        sub: "No guesswork, no band-aids. Licensed technician inspects the full system, quotes in writing, then does the work to code with a warranty.",
      },
      steps: [
        {
          title: "Request a consultation",
          body: "Tell us what system is giving you trouble. We schedule a diagnostic visit at your convenience — no emergency rush pricing.",
        },
        {
          title: "Proper diagnosis",
          body: "Licensed technician inspects the full system, not just the symptom. You get a clear explanation and a written quote before anything is touched.",
        },
        {
          title: "Engineered repair",
          body: "Code-compliant materials, manufacturer-spec installation, permit-pulled when required. We do it once, we do it correctly.",
        },
        {
          title: "Documented and warranted",
          body: "Full-service record provided on completion. Every job backed by our workmanship warranty — call if anything is off.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Licensed", label: "Master technicians", caption: "Bonded and insured" },
        { value: "Written", label: "Quote before work starts", caption: "No surprise billing" },
        { value: "Permit-", label: "Ready work standard", caption: "Code-compliant every job" },
        { value: "Warranted", label: "Workmanship guarantee", caption: "Documented at completion" },
      ],
    },
    finalCta: {
      headline: "System not performing?",
      highlight: "Let's engineer a fix.",
      body: "Licensed technicians, written quotes, permit-ready work, documented warranty. Properly done from the start.",
      ctaLabel: "Schedule a consultation →",
      backgroundImage: {
        url: "/themes/premium-trade/cta-bg.jpg",
        alt: "Assorted hand tools neatly arranged in a workshop tool rack",
      },
    },
  },
}
