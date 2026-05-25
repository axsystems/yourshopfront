import type { Theme } from "./types"

/** Round 1 portfolio piece. Source: 06-cinematic-dark.html (NIGHTFALL cinematic studio). */
export const cinematicDark: Theme = {
  slug: "cinematic-dark",
  name: "Cinematic Dark",
  industry: "Video / Film Studio",
  city: "Los Angeles",
  tagline: "Cinematic studio for ambitious brands.",
  description:
    "Film-noir cinematic. Deep black + warm white + copper + teal, Fraunces italic, custom cursor, full-bleed atmosphere. Built for production companies, ad agencies, and luxury creative.",
  mode: "project",
  vibe: "bold-industrial",
  hero: "gallery",
  heroEyebrow: "REEL · 2026",
  colors: {
    bg: "#0E0C0A",
    fg: "#E8E4DC",
    primary: "#B87333",
    primaryFg: "#0E0C0A",
    accent: "#0E3A3A",
    accentFg: "#E8E4DC",
    muted: "#1A1714",
    mutedFg: "#B8B4AC",
    border: "#E8E4DC1A",
    surface: "#221E1A",
    surfaceFg: "#E8E4DC",
  },
  fonts: { display: "fraunces", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "2px", lg: "4px", pill: "999px" },
  button: { shape: "sharp", shadow: "none", weight: "regular", uppercase: true },
  heroImage: {
    url: "/themes/cinematic-dark/hero.jpg",
    alt: "Cinematic low-key portrait silhouette in deep amber and shadow",
    credit: "Photo by Jakob Owens on Unsplash",
  },

  seoTitle: "Cinematic Dark — Film Studio Style · Apex Sites Portfolio",
  seoDescription:
    "Apex Sites portfolio: a cinematic film-studio brand. Deep black + copper + teal, Fraunces italic, custom cursor. Built for production companies and luxury creative.",
  isThemeOption: true,
  sourceHtmlPath: "06-cinematic-dark.html",
  round: 1,
  content: {
    howItWorks: {
      steps: [
        {
          title: "Brief and creative call",
          body: "We sit with you, understand what you're building toward, and find the visual language that makes it unavoidable.",
        },
        {
          title: "Pre-production and plan",
          body: "Shot list, location scouting, talent direction — all of it handled before a camera rolls. Nothing improvised on shoot day.",
        },
        {
          title: "We shoot it",
          body: "Cinema-grade gear, controlled light, intentional frame. Every shot serves the story — nothing is filler.",
        },
        {
          title: "Delivered, ready to run",
          body: "Edited, color-graded, mixed, and exported in every format you need. Ready for broadcast, digital, or the big screen.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Cinema", label: "Grade production", caption: "Not run-and-gun content" },
        { value: "Full", label: "Pre to post service", caption: "One studio, start to finish" },
        { value: "Licensed", label: "Music and clearances", caption: "Broadcast-ready delivery" },
        { value: "Every", label: "Format delivered", caption: "Digital, broadcast, social" },
      ],
    },
    finalCta: {
      headline: "Brand needs a film?",
      highlight: "We make it unavoidable.",
      body: "Cinema-grade production, full pre-to-post, broadcast-ready delivery. Let's talk about your vision.",
      ctaLabel: "Start with a brief →",
      backgroundImage: {
        url: "/themes/cinematic-dark/hero.jpg",
        alt: "Cinematic low-key portrait silhouette in deep amber and shadow",
      },
    },
  },
}
