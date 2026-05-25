import type { Theme } from "./types"

/** Round 2 portfolio piece. Source: 01-print-block-books.html (independent bookstore + zine press). */
export const printBlockBooks: Theme = {
  slug: "print-block-books",
  name: "Print Block",
  industry: "Bookstore / Press",
  city: "Portland",
  tagline: "Independent bookstore & zine press.",
  description:
    "Riso/halftone print-shop aesthetic. Paper + navy ink + electric pink + grass green, DM Serif Display (substituted Playfair) and Space Mono (substituted JetBrains Mono). Halftone overlays, pink dashed stamps.",
  mode: "recurring",
  vibe: "friendly-modern",
  hero: "gallery",
  heroEyebrow: "EST. SOMEWHERE BETWEEN 2003 AND TODAY",
  colors: {
    bg: "#F4EFE3",
    fg: "#15203F",
    primary: "#FF4081",
    primaryFg: "#FBF7EE",
    accent: "#4A8F3D",
    accentFg: "#FBF7EE",
    muted: "#ECE3D0",
    mutedFg: "#15203F99",
    border: "#15203F",
    surface: "#FBF7EE",
    surfaceFg: "#15203F",
  },
  fonts: { display: "playfair-display", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "2px", md: "4px", lg: "6px", pill: "999px" },
  button: { shape: "sharp", shadow: "hard-offset", weight: "bold", uppercase: true },
  heroImage: {
    url: "/themes/print-block-books/hero.jpg",
    alt: "Densely packed bookstore shelves seen from a low angle",
    credit: "Photo by Patrick Tomasso on Unsplash",
  },

  seoTitle: "Print Block — Indie Bookstore & Zine Press · Your Shopfront Portfolio",
  seoDescription:
    "Your Shopfront portfolio: an indie bookstore + zine press. Paper + navy + pink + green, halftone overlays, DM Serif Display. Built for bookstores, presses, and creative retail.",
  isThemeOption: true,
  sourceHtmlPath: "01-print-block-books.html",
  round: 2,
  content: {
    howItWorks: {
      header: {
        eyebrow: "How to find us",
        headline: "Walk in without a list —",
        highlight: "leave with three books you didn't know you needed.",
        sub: "Shelves organized by mood, staff who actually read, and local zines you won't find on any algorithm. New stock every week.",
      },
      steps: [
        {
          title: "Browse without a plan",
          body: "The shelves are organized by mood, not genre. Come in with no list and leave with three books you didn't know you needed.",
        },
        {
          title: "Ask the staff",
          body: "Everyone here reads. Tell us what you loved last and we'll find what's next. No bad recommendations, only honest ones.",
        },
        {
          title: "Pick up a zine",
          body: "We press and stock local zines, chapbooks, and small-run editions you won't find on any algorithm. New arrivals every week.",
        },
        {
          title: "Come back",
          body: "New stock weekly, monthly events, and a mailing list that's actually worth opening. No spam. Just books and stuff we like.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Indie", label: "No chain affiliations", caption: "Staff-owned and curated" },
        { value: "Local", label: "Zines and presses", caption: "Stocked fresh every week" },
        { value: "Events", label: "Monthly in-store", caption: "Readings, launches, talks" },
        { value: "No", label: "Returns policy drama", caption: "We work it out, always" },
      ],
    },
    finalCta: {
      headline: "Haven't found your next book?",
      highlight: "Walk in and ask us.",
      body: "Staff-curated shelves, local zines, honest recommendations. New stock every week.",
      ctaLabel: "Find us in Portland →",
      backgroundImage: {
        url: "/themes/print-block-books/cta-bg.jpg",
        alt: "Library aisle lined with tall bookshelves filled with books",
      },
    },
  },
}
