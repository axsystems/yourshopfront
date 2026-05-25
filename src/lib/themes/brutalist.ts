import type { Theme } from "./types"

/** Round 1 portfolio piece. Source: 08-brutalist.html (HUNGRY HUNGRY agency). */
export const brutalist: Theme = {
  slug: "brutalist",
  name: "Neo-Brutalist",
  industry: "Creative Agency",
  city: "Los Angeles",
  tagline: "A LOUD agency for LOUD brands.",
  description:
    "Pop-art neo-brutalism. Yellow + black + electric pink + cobalt blue, Bricolage Grotesque mega type, 4px hard borders, hard-shadow buttons, ALL CAPS treatment.",
  mode: "project",
  vibe: "bold-industrial",
  hero: "gallery",
  heroEyebrow: "WE MAKE NOISE",
  colors: {
    bg: "#FFE600",
    fg: "#000000",
    primary: "#000000",
    primaryFg: "#FFE600",
    accent: "#FF1493",
    accentFg: "#FFFFFF",
    muted: "#FFF8DC",
    mutedFg: "#000000BF",
    border: "#000000",
    surface: "#FFFFFF",
    surfaceFg: "#000000",
  },
  fonts: { display: "bricolage-grotesque", body: "bricolage-grotesque", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "0", lg: "0", pill: "999px" },
  button: { shape: "rounded", shadow: "hard-offset", weight: "heavy", uppercase: true },
  heroImage: {
    url: "/themes/brutalist/hero.jpg",
    alt: "Stark concrete architectural geometry with strong shadows",
    credit: "Photo by Joel Filipe on Unsplash",
  },

  seoTitle: "Neo-Brutalist — LOUD Agency Style · Your Shopfront Portfolio",
  seoDescription:
    "Your Shopfront portfolio: a neo-brutalist agency brand. Yellow + black + pink + blue, Bricolage Grotesque, hard-shadow buttons, mega type. Built for agencies and brands that want to be loud.",
  isThemeOption: true,
  sourceHtmlPath: "08-brutalist.html",
  round: 1,
  content: {
    howItWorks: {
      header: {
        eyebrow: "How we work",
        headline: "Audit to launch —",
        highlight: "one bold direction, no option paralysis.",
        sub: "We tear apart what's failing, build one decisive concept, and execute it loud. Fast, blunt, built to get noticed.",
      },
      steps: [
        {
          title: "We audit your brand",
          body: "We tear apart what you have, find what's failing, and tell you the truth. No soft-pedaling, no fluff deck.",
        },
        {
          title: "We make the concept",
          body: "One bold direction, not a deck of options. We pick what's right and show you why. Fast, decisive, built to move.",
        },
        {
          title: "We build it loud",
          body: "Brand, campaign, digital — executed at full volume. We don't do safe. Safe is invisible. Loud gets clicks.",
        },
        {
          title: "You get noticed",
          body: "We measure impact, not effort. Did people stop scrolling? Did they share it? Did it generate leads? That's what we track.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "No", label: "Vanilla concepts", caption: "Loud only. Safe gets ignored" },
        { value: "Fast", label: "Concept turnaround", caption: "One direction, no option overload" },
        { value: "Full", label: "Brand to campaign", caption: "Strategy through execution" },
        { value: "Open", label: "To direct feedback", caption: "We want your real reaction" },
      ],
    },
    finalCta: {
      headline: "Invisible brand?",
      highlight: "We make noise.",
      body: "Bold concept, fast turnaround, zero safe choices. If you want loud, we're already talking.",
      ctaLabel: "Start the conversation →",
      backgroundImage: {
        url: "/themes/brutalist/cta-bg.jpg",
        alt: "Landscape view of a grey concrete brutalist building facade",
      },
    },
  },
}
