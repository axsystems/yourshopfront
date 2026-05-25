import type { Theme } from "./types"

/** Round 2 portfolio piece. Source: 05-north-fork.html (independent brewery + taproom). */
export const northFork: Theme = {
  slug: "north-fork",
  name: "North Fork",
  industry: "Brewery / Taproom",
  city: "Brooklyn",
  tagline: "Independent brewery & taproom.",
  description:
    "Beer-hall masthead. Forest green + cream + mustard + oxblood, Archivo Black display + Fraunces italic lede. Heritage badge mark, taproom-loud type.",
  mode: "recurring",
  vibe: "bold-industrial",
  hero: "gallery",
  heroEyebrow: "TAPROOM OPEN · TUE–SUN",
  colors: {
    bg: "#EDE3CD",
    fg: "#1A1A1A",
    primary: "#D9A934",
    primaryFg: "#1A1A1A",
    accent: "#2A4530",
    accentFg: "#EDE3CD",
    muted: "#DDD0B0",
    mutedFg: "#1A1A1ABF",
    border: "#1A1A1A",
    surface: "#F4ECD7",
    surfaceFg: "#1A1A1A",
  },
  fonts: { display: "archivo-black", body: "fraunces", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "0", lg: "0", pill: "999px" },
  button: { shape: "sharp", shadow: "hard-offset", weight: "heavy", uppercase: true },
  heroImage: {
    url: "/themes/north-fork/hero.jpg",
    alt: "Pint glass of amber beer on a wooden bar in a warm taproom",
    credit: "Photo by Adam Wilson on Unsplash",
  },

  seoTitle: "North Fork — Independent Brewery · Apex Sites Portfolio",
  seoDescription:
    "Apex Sites portfolio: an independent brewery and taproom. Forest + cream + mustard + oxblood, Archivo Black masthead, heritage badge. Built for breweries, distilleries, and taprooms.",
  isThemeOption: true,
  sourceHtmlPath: "05-north-fork.html",
  round: 2,
  content: {
    howItWorks: {
      steps: [
        {
          title: "Come in Tuesday through Sunday",
          body: "Taproom opens at noon Tuesday through Friday, 11am on weekends. Dogs welcome on the patio. No reservation required.",
        },
        {
          title: "Pick from the board",
          body: "We pour whatever's on tap — rotating seasonals, year-rounds, and whatever the brewers couldn't stop experimenting with.",
        },
        {
          title: "Drink it here",
          body: "Bar seating, picnic tables, patio — wherever you land is the right place. We're not in a hurry and neither should you be.",
        },
        {
          title: "Take some home",
          body: "Cans, crowlers, and growler fills to go. Ask about our monthly can club if you want a box at your door.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Independent", label: "No corporate ownership", caption: "Brewed on-site, every batch" },
        { value: "Rotating", label: "Seasonal taps", caption: "Something new every visit" },
        { value: "Dogs", label: "Welcome on the patio", caption: "Bring the whole crew" },
        { value: "Cans", label: "And crowlers to go", caption: "Take the good stuff home" },
      ],
    },
    finalCta: {
      headline: "Need a pint?",
      highlight: "We're pouring right now.",
      body: "Independent brewery, rotating taps, dog-friendly patio. Taproom open Tuesday through Sunday.",
      ctaLabel: "See what's on tap →",
      backgroundImage: {
        url: "/themes/north-fork/hero.jpg",
        alt: "Pint glass of amber beer on a wooden bar in a warm taproom",
      },
    },
  },
}
