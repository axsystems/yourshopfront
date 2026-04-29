import type { Theme } from "./types"

export const brightsideCleaning: Theme = {
  slug: "brightside-cleaning",
  name: "Brightside Cleaning",
  industry: "Cleaning",
  city: "Seattle",
  tagline: "Book a home cleaning in 60 seconds. Flat-rate, no contracts.",
  description:
    "Friendly modern with sky + mint gradient. Plus Jakarta Sans + Caveat script. Booking-card hero.",
  mode: "recurring",
  vibe: "friendly-modern",
  hero: "booking-card",
  heroEyebrow: "BOOK ONLINE — INSTANT PRICE",
  colors: {
    bg: "#FAFCFE",
    fg: "#15293D",
    primary: "#4FA8E0",
    primaryFg: "#FFFFFF",
    accent: "#6FCFB6",
    accentFg: "#15293D",
    muted: "#C9E6F7",
    mutedFg: "#6B7B8C",
    border: "#15293D14",
    surface: "#FFFFFF",
    surfaceFg: "#15293D",
  },
  fonts: { display: "plus-jakarta-sans", body: "plus-jakarta-sans", mono: "jetbrains-mono" },
  radius: { sm: "10px", md: "14px", lg: "28px", pill: "100px" },
  button: { shape: "pill", shadow: "soft", weight: "bold", uppercase: false },
  seoTitle: "Apex Sites — Friendly Modern Booking-Card Style",
  seoDescription:
    "The Brightside Cleaning demo. Sky + mint gradient, soft pillowy cards, instant-book hero. For cleaners, dog walkers, and recurring home services.",
}
