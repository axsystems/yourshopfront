import type { Theme } from "./types"

/** Round 1 portfolio piece. Source: 05-swiss-editorial.html (Object Studio independent design practice). */
export const swissEditorial: Theme = {
  slug: "swiss-editorial",
  name: "Swiss Editorial",
  industry: "Design Studio",
  city: "New York",
  tagline: "Independent design practice, est. 2017.",
  description:
    "Editorial Swiss-style portfolio. Cream + ink + oxblood, Instrument Serif italic (substituted Playfair Display) and Hanken Grotesk (substituted Inter). Tabular project index, long-form mega type.",
  mode: "project",
  vibe: "sleek-tech",
  hero: "gallery",
  heroEyebrow: "SELECTED WORK · 2017–2026",
  colors: {
    bg: "#F0EEE9",
    fg: "#111111",
    primary: "#111111",
    primaryFg: "#F0EEE9",
    accent: "#D14836",
    accentFg: "#F0EEE9",
    muted: "#E8E5DC",
    mutedFg: "#686865",
    border: "#C9C5BC",
    surface: "#FFFFFF",
    surfaceFg: "#111111",
  },
  fonts: { display: "playfair-display", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "2px", lg: "4px", pill: "999px" },
  button: { shape: "sharp", shadow: "none", weight: "regular", uppercase: false },
  heroImage: {
    url: "/themes/swiss-editorial/hero.jpg",
    alt: "Black ink type on cream paper in a tight editorial composition",
    credit: "Photo by Annie Spratt on Unsplash",
  },

  seoTitle: "Swiss Editorial — Independent Design Practice · Your Shopfront Portfolio",
  seoDescription:
    "Your Shopfront portfolio: a Swiss-style design studio. Cream + ink + oxblood, italic display, tabular project index. Built for studios and agencies.",
  isThemeOption: true,
  sourceHtmlPath: "05-swiss-editorial.html",
  round: 1,
  content: {
    howItWorks: {
      steps: [
        {
          title: "Discovery and framing",
          body: "We map the problem before we design anything. What needs to be communicated, to whom, and in what context. No assumptions.",
        },
        {
          title: "Concept presentation",
          body: "One direction, developed fully — not a spread of half-baked options. We present our reasoning alongside the work.",
        },
        {
          title: "Refinement",
          body: "Two rounds of focused revisions based on your response. We push back where the work needs defending. We adapt where you're right.",
        },
        {
          title: "Delivery and handoff",
          body: "Final files in every format required. Brand guidelines documented so internal teams can apply the work correctly going forward.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Est.", label: "2017 — New York", caption: "Independent practice" },
        { value: "One", label: "Direction per project", caption: "Decisive, not indecisive" },
        { value: "Full", label: "Brand to system", caption: "Strategy through delivery" },
        { value: "Documented", label: "Guidelines at handoff", caption: "So it stays consistent" },
      ],
    },
    finalCta: {
      headline: "Need design that actually holds up?",
      highlight: "Let's talk.",
      body: "Independent practice, decisive process, documented systems. Identity, editorial, and digital from 2017.",
      ctaLabel: "Start a project →",
      backgroundImage: {
        url: "/themes/swiss-editorial/cta-bg.jpg",
        alt: "Wall-mounted Helvetica alphabet poster hung above a sofa",
      },
    },
  },
}
