import type { Theme } from "./types"

export const voltcraftElectric: Theme = {
  slug: "voltcraft-electric",
  name: "Voltcraft Electric",
  industry: "Electrical",
  city: "Phoenix",
  tagline: "Master electricians. EV chargers, panels, 24/7 service.",
  description:
    "High-voltage industrial. Black + electric yellow, Inter heavy + JetBrains Mono. Phone-first hero.",
  mode: "emergency",
  vibe: "bold-industrial",
  hero: "phone-first",
  heroEyebrow: "LICENSED & BONDED — 24/7",
  colors: {
    bg: "#F4F4F5",
    fg: "#0A0A0A",
    primary: "#FFD500",
    primaryFg: "#0A0A0A",
    accent: "#0A0A0A",
    accentFg: "#FFD500",
    muted: "#D4D4D8",
    mutedFg: "#6E6E70",
    border: "#0A0A0A",
    surface: "#FFFFFF",
    surfaceFg: "#0A0A0A",
  },
  colorVariants: [
    {
      name: "Cobalt Voltage",
      colors: {
        bg: "#F4F4F5",
        fg: "#0A0A0A",
        primary: "#1D4ED8",
        primaryFg: "#FFFFFF",
        accent: "#0A0A0A",
        accentFg: "#1D4ED8",
        muted: "#D4D4D8",
        mutedFg: "#6E6E70",
        border: "#0A0A0A",
        surface: "#FFFFFF",
        surfaceFg: "#0A0A0A",
      },
    },
    {
      name: "Phosphor Green",
      colors: {
        bg: "#F4F4F5",
        fg: "#0A0A0A",
        primary: "#22C55E",
        primaryFg: "#0A0A0A",
        accent: "#0A0A0A",
        accentFg: "#22C55E",
        muted: "#D4D4D8",
        mutedFg: "#6E6E70",
        border: "#0A0A0A",
        surface: "#FFFFFF",
        surfaceFg: "#0A0A0A",
      },
    },
  ],
  fonts: { display: "inter", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "0", lg: "0", pill: "0" },
  button: { shape: "sharp", shadow: "hard-offset", weight: "heavy", uppercase: true },
  heroImage: {
    url: "/themes/voltcraft-electric/hero.jpg",
    alt: "Electrical service panel with neatly run wiring",
    credit: "Photo by Pixabay on Pexels",
  },

  seoTitle: "Apex Sites — Electric-Yellow Industrial Style for Trades",
  seoDescription:
    "The Voltcraft Electric demo. Black + voltage-yellow, mono accents, phone-first hero. For electricians, HVAC, and any 24/7 licensed trade.",
  isThemeOption: true,
  sourceHtmlPath: "08-voltcraft-electric.html",
  round: 3,
  content: {
    howItWorks: {
      header: {
        eyebrow: "How we work",
        headline: "Call to close —",
        highlight: "permitted, passed, and signed off.",
        sub: "A master electrician answers, diagnoses the fault in plain language, and pulls every permit the job needs. No shortcuts, no second trips.",
      },
      steps: [
        {
          title: "Call — we pick up",
          body: "Tripped breaker, dead outlet, sparking panel — call any hour. A master electrician answers, not an answering service.",
        },
        {
          title: "Diagnose and quote",
          body: "We find the fault, explain it in plain language, and hand you a flat-rate price before we pull a single wire.",
        },
        {
          title: "Code-compliant repair",
          body: "Licensed master electricians, permit-ready work, zero shortcuts. We do it right so the inspector signs off first time.",
        },
        {
          title: "Guaranteed work",
          body: "Every job is backed by our workmanship guarantee. If something's off after we leave, we come back and make it right.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "24/7", label: "Emergency dispatch", caption: "Master electrician answers" },
        { value: "Licensed", label: "Master electricians", caption: "Bonded and insured" },
        { value: "Flat-rate", label: "No hourly surprises", caption: "Quoted before we start" },
        { value: "Guaranteed", label: "Workmanship warranty", caption: "We come back if needed" },
      ],
    },
    finalCta: {
      headline: "Panel sparking?",
      highlight: "Don't wait — call now.",
      body: "24/7 emergency response, master electricians, flat-rate quotes. Licensed, bonded, and permit-ready.",
      ctaLabel: "Call an electrician now →",
      backgroundImage: {
        url: "/themes/voltcraft-electric/cta-bg.jpg",
        alt: "Row of white circuit breakers inside an electrical panel",
      },
    },
  },
}
