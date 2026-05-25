import type { Theme } from "./types"

/**
 * Promoted from Round 1 to a homepage theme option.
 * Source: 02-doorstep-editorial.html (FOLD pickup-and-delivery laundry).
 */
export const doorstepEditorial: Theme = {
  slug: "doorstep-editorial",
  name: "Doorstep Editorial",
  industry: "Pickup & Delivery",
  city: "Brooklyn",
  tagline: "We'll take it. You take the time.",
  description:
    "Editorial pickup-and-delivery brand. Cream + forest + butter palette, address-bar booking hero, refined-modern italic display. Built for laundry pickup, dog walking, oil delivery, and any recurring delivery service.",
  mode: "recurring",
  vibe: "friendly-modern",
  hero: "booking-card",
  heroEyebrow: "WE PICK UP IN YOUR ZIP — TODAY",
  colors: {
    bg: "#F5F1EA",
    fg: "#0E1410",
    primary: "#1F3A2E",
    primaryFg: "#F5F1EA",
    accent: "#F2C94C",
    accentFg: "#0E1410",
    muted: "#EDE7DA",
    mutedFg: "#0E141099",
    border: "#0E141014",
    surface: "#FAF6EE",
    surfaceFg: "#0E1410",
  },
  fonts: { display: "playfair-display", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "8px", md: "10px", lg: "14px", pill: "999px" },
  button: { shape: "rounded", shadow: "soft", weight: "bold", uppercase: false },
  heroImage: {
    url: "/themes/doorstep-editorial/hero.jpg",
    alt: "Brown cardboard parcel sitting on a clean residential doorstep",
    credit: "Photo by Claudio Schwarz on Unsplash",
  },

  seoTitle: "Apex Sites — Editorial Pickup-and-Delivery Style",
  seoDescription:
    "The Doorstep Editorial demo. Cream + forest + butter palette, address-bar booking hero, italic editorial display. Built for laundry pickup, dog walking, oil delivery, and recurring delivery brands.",
  isThemeOption: true,
  sourceHtmlPath: "02-doorstep-editorial.html",
  round: 1,
  content: {
    howItWorks: {
      steps: [
        {
          title: "Enter your address",
          body: "Type in your zip — we tell you instantly if we pick up in your area. Most Brooklyn and Brooklyn-adjacent neighborhoods covered.",
        },
        {
          title: "Leave it at the door",
          body: "We pick up at the time you chose. Bag it, leave it — you don't even need to be home. We'll send a photo confirmation.",
        },
        {
          title: "We handle it",
          body: "Washed, folded, or cleaned with care. Every order treated like it matters — because it is your stuff, not ours.",
        },
        {
          title: "Back at your door",
          body: "Delivered to your door, neatly packaged. Schedule a weekly pickup and stop thinking about it entirely.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Free", label: "Door pickup", caption: "No extra fee to collect" },
        { value: "Same", label: "Driver each week", caption: "Someone who knows your place" },
        { value: "No", label: "Contracts", caption: "Pause or skip anytime" },
        { value: "Photo", label: "Pickup confirmation", caption: "Timestamped, every time" },
      ],
    },
    finalCta: {
      headline: "Hate running errands?",
      highlight: "We'll take it from your door.",
      body: "Free pickup, no contracts, same driver each week. Enter your address — we'll tell you if we cover your zip.",
      ctaLabel: "Check your zip →",
      backgroundImage: {
        url: "/themes/doorstep-editorial/cta-bg.jpg",
        alt: "White delivery van parked along the side of a quiet street",
      },
    },
  },
}
