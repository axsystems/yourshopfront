import type { Theme } from "./types"

export const westwoodTree: Theme = {
  slug: "westwood-tree",
  name: "Westwood Tree Care",
  industry: "Tree Care",
  city: "Portland",
  tagline: "ISA Certified Arborists. Free estimate.",
  description:
    "Naturalist + safety-orange. Forest greens, editorial Fraunces serif. Gallery hero for project showcase.",
  mode: "project",
  vibe: "naturalist",
  hero: "gallery",
  heroEyebrow: "ISA CERTIFIED — FULLY INSURED",
  colors: {
    bg: "#F5F1E6",
    fg: "#1A1612",
    primary: "#FF6A1A",
    primaryFg: "#122019",
    accent: "#1F3528",
    accentFg: "#F5F1E6",
    muted: "#ECE5D2",
    mutedFg: "#6B6259",
    border: "#1F352826",
    surface: "#FAF6EC",
    surfaceFg: "#1A1612",
  },
  colorVariants: [
    {
      name: "Deep Forest",
      colors: {
        bg: "#F2EDE0",
        fg: "#15191A",
        primary: "#1B4332",
        primaryFg: "#F5F1E6",
        accent: "#A0522D",
        accentFg: "#F5F1E6",
        muted: "#E5DEC8",
        mutedFg: "#5C5F58",
        border: "#1B433226",
        surface: "#FAF6EC",
        surfaceFg: "#15191A",
      },
    },
    {
      name: "Burgundy Heritage",
      colors: {
        bg: "#F5F1E6",
        fg: "#1A1612",
        primary: "#7D3C2E",
        primaryFg: "#F5F1E6",
        accent: "#1F3528",
        accentFg: "#F5F1E6",
        muted: "#ECE5D2",
        mutedFg: "#6B6259",
        border: "#7D3C2E26",
        surface: "#FAF6EC",
        surfaceFg: "#1A1612",
      },
    },
  ],
  fonts: { display: "fraunces", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "2px", lg: "4px", pill: "0" },
  button: { shape: "sharp", shadow: "hard-offset", weight: "heavy", uppercase: true },
  heroImage: {
    url: "/themes/westwood-tree/hero.jpg",
    alt: "Tall trees seen from below against a bright canopy of leaves",
    credit: "Photo by Sergei Akulich on Unsplash",
  },

  seoTitle: "Apex Sites — Naturalist Style with Safety-Orange Accents",
  seoDescription:
    "The Westwood Tree Care demo. Forest greens, safety orange, gallery hero. For arborists, landscapers, and rugged outdoor trades.",
  isThemeOption: true,
  sourceHtmlPath: "07-westwood-tree.html",
  round: 3,
  content: {
    howItWorks: {
      header: {
        eyebrow: "How we work",
        headline: "Estimate to clean yard —",
        highlight: "no debris left behind.",
        sub: "A certified arborist walks the property, tells you what the tree actually needs, and puts an ISA-trained crew on it. Everything chipped or hauled same day.",
      },
      steps: [
        {
          title: "Free on-site estimate",
          body: "Certified arborist walks your property, assesses every tree, and gives you a written quote before any work is scheduled.",
        },
        {
          title: "We explain your options",
          body: "Prune, cable, or remove — we tell you what the tree actually needs, not just the most expensive option on the list.",
        },
        {
          title: "ISA-certified crew",
          body: "Climbing arborists trained to ISA standards, rigging gear for tight yards, full liability coverage on every job.",
        },
        {
          title: "Clean property, no trace",
          body: "All debris chipped or hauled same day. Stump grinding available. We leave your yard looking better than we found it.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Free", label: "On-site estimate", caption: "Certified arborist visit" },
        { value: "ISA", label: "Certified arborists", caption: "Trained and insured" },
        { value: "Same-day", label: "Debris removal", caption: "Chipped or hauled clean" },
        { value: "Insured", label: "Full liability coverage", caption: "Every job, every crew" },
      ],
    },
    finalCta: {
      headline: "Tree looking dangerous?",
      highlight: "We assess it free.",
      body: "ISA-certified arborists, full insurance, same-day debris removal. Free estimate, no pressure.",
      ctaLabel: "Schedule free estimate →",
      backgroundImage: {
        url: "/themes/westwood-tree/cta-bg.jpg",
        alt: "Arborist using a chainsaw to cut into a tree trunk",
      },
    },
  },
}
