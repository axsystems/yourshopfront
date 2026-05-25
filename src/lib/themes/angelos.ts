import type { Theme } from "./types"

/** Round 2 portfolio piece. Source: 03-angelos.html (Brooklyn pizza joint, est. 1956). */
export const angelos: Theme = {
  slug: "angelos",
  name: "Angelo's",
  industry: "Restaurant / Pizza",
  city: "Brooklyn",
  tagline: "Pizza, since 1956.",
  description:
    "Newspaper-Italian-Americana. Parchment + tomato + olive + mustard, Playfair Display editorial serif. Newspaper banner hero, double-rule borders, hand-stamp accents.",
  mode: "recurring",
  vibe: "warm-premium",
  hero: "gallery",
  heroEyebrow: "OPEN UNTIL 11PM TONIGHT",
  colors: {
    bg: "#F4ECDA",
    fg: "#1A1A1A",
    primary: "#C8332A",
    primaryFg: "#FCF8EC",
    accent: "#D9A441",
    accentFg: "#1A1A1A",
    muted: "#E9DEC2",
    mutedFg: "#1A1A1ABF",
    border: "#1A1A1A",
    surface: "#FBF7EA",
    surfaceFg: "#1A1A1A",
  },
  fonts: { display: "playfair-display", body: "playfair-display", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "0", lg: "2px", pill: "999px" },
  button: { shape: "sharp", shadow: "hard-offset", weight: "bold", uppercase: true },
  heroImage: {
    url: "/themes/angelos/hero.jpg",
    alt: "Overhead shot of a freshly baked pizza on a rustic wooden table",
    credit: "Photo by Ivan Torres on Unsplash",
  },

  seoTitle: "Angelo's — Brooklyn Pizza Since 1956 · Apex Sites Portfolio",
  seoDescription:
    "Apex Sites portfolio: a heritage Brooklyn pizza joint. Parchment + tomato + mustard, Playfair Display, double-rule newspaper masthead. Built for restaurants and food brands with history.",
  isThemeOption: true,
  sourceHtmlPath: "03-angelos.html",
  round: 2,
  content: {
    howItWorks: {
      header: {
        eyebrow: "How we do it",
        headline: "Same corner, same recipe —",
        highlight: "since 1956.",
        sub: "Walk in, call ahead, or grab a slice from the window. Hand-stretched dough, old-recipe sauce, ready in 20 minutes.",
      },
      steps: [
        {
          title: "Order by phone or walk in",
          body: "We've been taking orders since 1956 — by phone, at the counter, or from the sidewalk window. No app required.",
        },
        {
          title: "Made to order, every pie",
          body: "Dough stretched by hand, sauce from the same recipe, cheese layered the right way. Nothing pre-made, nothing reheated.",
        },
        {
          title: "Ready in 20 minutes",
          body: "Whole pies or by the slice — ready when you're hungry. Dine in at the counter or take it out the door.",
        },
        {
          title: "Come back for the next one",
          body: "Regulars get remembered. The same families have been coming here for generations — that's the standard we cook to.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Est.", label: "1956 — Brooklyn original", caption: "Same corner, same recipe" },
        { value: "Hand-", label: "Stretched dough daily", caption: "Never frozen, never rushed" },
        { value: "Open", label: "Until 11pm tonight", caption: "Late-night slices always ready" },
        { value: "Dine-in", label: "Or take it to go", caption: "Counter seating available" },
      ],
    },
    finalCta: {
      headline: "Hungry tonight?",
      highlight: "We've been ready since 1956.",
      body: "Hand-stretched dough, old-recipe sauce, ready in 20 minutes. Walk in or call ahead.",
      ctaLabel: "See our menu →",
      backgroundImage: {
        url: "/themes/angelos/cta-bg.jpg",
        alt: "Open flames burning inside a round wood-fired oven",
      },
    },
  },
}
