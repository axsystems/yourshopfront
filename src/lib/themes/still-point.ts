import type { Theme } from "./types"

/** Round 2 portfolio piece. Source: 04-still-point.html (yoga & meditation Brooklyn). */
export const stillPoint: Theme = {
  slug: "still-point",
  name: "Still Point",
  industry: "Yoga / Wellness",
  city: "Brooklyn",
  tagline: "Yoga & meditation. Brooklyn.",
  description:
    "Wabi-sabi calm. Bone + terracotta + sage with a Noto Serif JP character mark. Cormorant Garamond italic display (substituted Playfair). Morphing organic shape, calm pacing.",
  mode: "recurring",
  vibe: "naturalist",
  hero: "gallery",
  heroEyebrow: "MORNING & EVENING DROP-INS",
  colors: {
    bg: "#F1ECE3",
    fg: "#232323",
    primary: "#C8744A",
    primaryFg: "#F1ECE3",
    accent: "#8B9678",
    accentFg: "#232323",
    muted: "#E5DECF",
    mutedFg: "#6E6864",
    border: "#23232314",
    surface: "#FAF6EC",
    surfaceFg: "#232323",
  },
  fonts: { display: "playfair-display", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "0", lg: "0", pill: "999px" },
  button: { shape: "pill", shadow: "none", weight: "regular", uppercase: false },
  heroImage: {
    url: "/themes/still-point/hero.jpg",
    alt: "Empty yoga studio with morning light across a wooden floor",
    credit: "Photo by Anupam Mahapatra on Unsplash",
  },

  seoTitle: "Still Point — Yoga & Meditation · Your Shopfront Portfolio",
  seoDescription:
    "Your Shopfront portfolio: a wabi-sabi yoga studio. Bone + terracotta + sage, Cormorant italic, morphing organic shape. Built for yoga, meditation, and wellness brands.",
  isThemeOption: true,
  sourceHtmlPath: "04-still-point.html",
  round: 2,
  content: {
    howItWorks: {
      steps: [
        {
          title: "Drop in or book ahead",
          body: "Morning and evening classes, drop-in welcome. Reserve your spot online or just show up — we keep room for walk-ins.",
        },
        {
          title: "All levels, genuinely",
          body: "No performance. No comparison. Whether it's your first class or your thousandth, the floor holds everyone the same.",
        },
        {
          title: "Practice in the space",
          body: "Wooden floors, good light, no mirrors, no music with lyrics. A room built to settle your nervous system, not excite it.",
        },
        {
          title: "Come back regularly",
          body: "The benefits are cumulative. Monthly memberships available with unlimited class access and priority booking.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Morning", label: "And evening sessions", caption: "Drop-in always welcome" },
        { value: "All", label: "Levels, no exceptions", caption: "Beginners taught with care" },
        { value: "Small", label: "Class sizes", caption: "Intentional, not crowded" },
        { value: "Monthly", label: "Membership available", caption: "Unlimited access" },
      ],
    },
    finalCta: {
      headline: "Looking for something quieter?",
      highlight: "The floor is open.",
      body: "Morning and evening classes, drop-in welcome, all levels. A practice built for consistency, not performance.",
      ctaLabel: "See the schedule →",
      backgroundImage: {
        url: "/themes/still-point/cta-bg.jpg",
        alt: "Quiet stack of smooth brown stones balanced on a wooden log",
      },
    },
  },
}
