import type { Theme } from "./types"

export const ironsidePlumbing: Theme = {
  slug: "ironside-plumbing",
  name: "Ironside Plumbing",
  industry: "Plumbing",
  city: "Denver",
  tagline: "Same-Day Service. 24/7. Or It's Free.",
  description:
    "Bold, industrial, urgency-first. Built for emergency service businesses where a job needs booking now.",
  mode: "emergency",
  vibe: "bold-industrial",
  hero: "form-card",
  heroEyebrow: "24/7 ONLINE BOOKING",
  colors: {
    bg: "#F4F4F5",
    fg: "#0A0A0A",
    primary: "#FACC15",
    primaryFg: "#0A0A0A",
    accent: "#0A0A0A",
    accentFg: "#FACC15",
    muted: "#D4D4D8",
    mutedFg: "#6E6E70",
    border: "#0A0A0A",
    surface: "#FFFFFF",
    surfaceFg: "#0A0A0A",
  },
  colorVariants: [
    {
      name: "Hazard Red",
      colors: {
        bg: "#F4F4F5",
        fg: "#0A0A0A",
        primary: "#DC2626",
        primaryFg: "#FFFFFF",
        accent: "#0A0A0A",
        accentFg: "#FACC15",
        muted: "#D4D4D8",
        mutedFg: "#6E6E70",
        border: "#0A0A0A",
        surface: "#FFFFFF",
        surfaceFg: "#0A0A0A",
      },
    },
    {
      name: "Steel Blue",
      colors: {
        bg: "#F4F4F5",
        fg: "#0A0A0A",
        primary: "#2563EB",
        primaryFg: "#FFFFFF",
        accent: "#0A0A0A",
        accentFg: "#2563EB",
        muted: "#D4D4D8",
        mutedFg: "#6E6E70",
        border: "#0A0A0A",
        surface: "#FFFFFF",
        surfaceFg: "#0A0A0A",
      },
    },
  ],
  fonts: { display: "archivo-black", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "0", md: "0", lg: "0", pill: "0" },
  button: { shape: "sharp", shadow: "hard-offset", weight: "heavy", uppercase: true },
  heroImage: {
    url: "/themes/ironside-plumbing/hero.jpg",
    alt: "Plumber's hand tightening a brass fitting on copper pipework",
    credit: "Photo by Sigmund on Unsplash",
  },

  seoTitle: "Your Shopfront — Bold Industrial Style for Emergency Service Brands",
  seoDescription:
    "The Ironside Plumbing demo. A heavy, urgency-led design for plumbers, HVAC, and 24/7 trades. Online quote-form hero, hazard-stripe accents, hard-edged buttons.",
  isThemeOption: true,
  sourceHtmlPath: "01-ironside-plumbing.html",
  round: 3,
  content: {
    howItWorks: {
      header: {
        eyebrow: "How we work",
        headline: "Four steps,",
        highlight: "and we're at your driveway.",
        sub: "Book online any hour. A licensed plumber confirms within minutes and is on your doorstep within 90.",
      },
      steps: [
        {
          title: "Book online, 24/7",
          body: "Burst pipe? Slow drain? Submit a job any hour — instant booking, no callback queues, no menu trees.",
        },
        {
          title: "We diagnose on site",
          body: "Licensed plumber arrives, walks the issue with you, hands you a flat-rate quote before any wrench turns.",
        },
        {
          title: "We fix it right",
          body: "Commercial-grade parts, code-compliant work, no surprise upsells. You see the invoice before we start.",
        },
        {
          title: "Backed by warranty",
          body: "Every repair carries a 1-year warranty on parts and labor. Something goes wrong? We come back, no charge.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "24/7", label: "Online booking", caption: "Always available, never a machine" },
        { value: "Licensed", label: "ROC certified", caption: "Bonded and insured" },
        { value: "Flat-rate", label: "Quoted before we start", caption: "No surprise add-ons" },
        { value: "1-year", label: "Parts + labor warranty", caption: "Every repair, no exceptions" },
      ],
    },
    finalCta: {
      headline: "Pipe burst?",
      highlight: "Book online, we're on the truck.",
      body: "24/7 online booking, flat-rate quotes, 1-year warranty. Submit a job — a real plumber confirms in minutes.",
      ctaLabel: "Book a plumber now →",
      backgroundImage: {
        url: "/themes/ironside-plumbing/cta-bg.jpg",
        alt: "Black and white work truck on a road during daytime",
      },
    },
  },
}
