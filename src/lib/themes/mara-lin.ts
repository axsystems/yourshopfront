import type { Theme } from "./types"

/** Round 2 portfolio piece. Source: 07-mara-lin.html (photographer & director, NYC/LA). */
export const maraLin: Theme = {
  slug: "mara-lin",
  name: "Mara Lin",
  industry: "Photographer / Director",
  city: "New York / Los Angeles",
  tagline: "Photographer & director.",
  description:
    "Fashion-photo darkroom. Near-black + warm-white + tan accent, Tenor Sans (substituted Inter) and DM Mono labels (substituted JetBrains Mono). Custom cursor, full-bleed editorial figure.",
  mode: "project",
  vibe: "sleek-tech",
  hero: "gallery",
  heroEyebrow: "REPRESENTED BY MERIDIAN+",
  colors: {
    bg: "#0A0A0A",
    fg: "#F5F2EC",
    primary: "#C8B8A0",
    primaryFg: "#0A0A0A",
    accent: "#F5F2EC",
    accentFg: "#0A0A0A",
    muted: "#141414",
    mutedFg: "#F5F2EC8C",
    border: "#F5F2EC1A",
    surface: "#1C1C1C",
    surfaceFg: "#F5F2EC",
  },
  fonts: { display: "inter", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "0", lg: "0", pill: "999px" },
  button: { shape: "sharp", shadow: "none", weight: "regular", uppercase: true },
  heroImage: {
    url: "/themes/mara-lin/hero.jpg",
    alt: "Editorial portrait against a dark backdrop with soft directional light",
    credit: "Photo by Ali Pazani on Unsplash",
  },

  seoTitle: "Mara Lin — Photographer & Director · Apex Sites Portfolio",
  seoDescription:
    "Apex Sites portfolio: a fashion photographer and director. Near-black + warm-white + tan, Tenor Sans, full-bleed editorial. Built for photographers, directors, and fashion talent.",
  isThemeOption: true,
  sourceHtmlPath: "07-mara-lin.html",
  round: 2,
  content: {
    howItWorks: {
      header: {
        eyebrow: "The process",
        headline: "Brief to final selects —",
        highlight: "every frame deliberate.",
        sub: "Concept developed in writing before a camera moves, shoot directed with intention, retouched selects delivered with usage rights clarified upfront.",
      },
      steps: [
        {
          title: "Send a brief",
          body: "Tell us who the subject is, what the campaign needs to say, and who it needs to land with. The rest is our job.",
        },
        {
          title: "We develop the concept",
          body: "Reference mood, location direction, lighting language, and cast notes — all in writing before a single setup is touched.",
        },
        {
          title: "Shoot day",
          body: "One cohesive shoot, directed with intention. Every frame is deliberate. We don't machine-gun and sort later.",
        },
        {
          title: "Selects and delivery",
          body: "Final retouched selects delivered as high-res files, print-ready and web-ready. Usage rights spelled out in plain language.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Editorial", label: "Not commercial filler", caption: "Intentional, frame by frame" },
        { value: "Represented", label: "By Meridian+", caption: "Agency commissions welcome" },
        { value: "NYC", label: "And Los Angeles based", caption: "Available to travel" },
        { value: "Usage", label: "Rights clarified upfront", caption: "No licensing surprises" },
      ],
    },
    finalCta: {
      headline: "Campaign needs a photographer?",
      highlight: "Send us the brief.",
      body: "Editorial direction, intentional frames, high-res delivery. NYC and LA based — available to travel.",
      ctaLabel: "Get in touch →",
      backgroundImage: {
        url: "/themes/mara-lin/cta-bg.jpg",
        alt: "Photographer working in a studio, framing a shot with a camera",
      },
    },
  },
}
