import type { Theme } from "./types"

/** Round 1 portfolio piece. Source: 01-daylight-lounge.html (SUDS & Co. laundromat lounge). */
export const daylightLounge: Theme = {
  slug: "daylight-lounge",
  name: "Daylight Lounge",
  industry: "Laundromat / Hospitality",
  city: "Brooklyn",
  tagline: "Laundry, but make it a lounge.",
  description:
    "Indie laundromat-as-lounge. Cream + terracotta + sage + sky pastels, Fraunces serif display, soft Caveat script accents. Editorial-photo collage hero.",
  mode: "recurring",
  vibe: "warm-premium",
  hero: "gallery",
  heroEyebrow: "OPEN DAILY — 7AM TO 10PM",
  colors: {
    bg: "#F4ECDC",
    fg: "#1E1B16",
    primary: "#D26A3F",
    primaryFg: "#FBF9F4",
    accent: "#8AA47A",
    accentFg: "#1E1B16",
    muted: "#EFE5D2",
    mutedFg: "#1E1B16BF",
    border: "#1E1B1614",
    surface: "#FBF9F4",
    surfaceFg: "#1E1B16",
  },
  fonts: { display: "fraunces", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "8px", md: "12px", lg: "16px", pill: "999px" },
  button: { shape: "pill", shadow: "soft", weight: "bold", uppercase: false },
  heroImage: {
    url: "/themes/daylight-lounge/hero.jpg",
    alt: "Warm sunlit lounge interior with natural woods and soft textiles",
    credit: "Photo by Spacejoy on Unsplash",
  },

  seoTitle: "Daylight Lounge — Laundry-as-Lounge Concept · Apex Sites Portfolio",
  seoDescription:
    "Apex Sites portfolio: an indie laundromat lounge concept. Cream + terracotta + sage palette, Fraunces serif, photo-collage hero.",
  isThemeOption: true,
  sourceHtmlPath: "01-daylight-lounge.html",
  round: 1,
  content: {
    howItWorks: {
      header: {
        eyebrow: "How it works",
        headline: "Come in, load a machine,",
        highlight: "and actually enjoy the wait.",
        sub: "Good seating, free wifi, coffee at the counter, and text alerts when your cycle's done. Or drop off a bag and pick it up two hours later.",
      },
      steps: [
        {
          title: "Drop in anytime",
          body: "Machines are open 7am to 10pm. No reservation, no lines — just a calm, well-lit space with actual seating worth sitting in.",
        },
        {
          title: "Load and settle in",
          body: "Start a wash, grab a coffee from the counter, and sit. We have free wifi, magazines worth reading, and good natural light.",
        },
        {
          title: "We notify you when done",
          body: "Text alerts when your cycle finishes. No hovering, no checking — you'll know the moment it's ready to move to a dryer.",
        },
        {
          title: "Fold and go — or drop off",
          body: "Folding tables are generous and never crowded. Or drop your bag at the counter and we'll have it done in two hours.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Open", label: "7am – 10pm daily", caption: "Early risers and late nights" },
        { value: "Free", label: "WiFi and coffee refills", caption: "Bring your laptop" },
        { value: "Text", label: "Alerts when done", caption: "No cycle-watching needed" },
        { value: "2-hr", label: "Wash-and-fold drop-off", caption: "Leave the bag, pick it up later" },
      ],
    },
    finalCta: {
      headline: "Laundry day doesn't have to be dreadful.",
      highlight: "Come in and see.",
      body: "Good light, good coffee, text alerts when your cycle's done. Open daily, 7am to 10pm.",
      ctaLabel: "Find us →",
      backgroundImage: {
        url: "/themes/daylight-lounge/cta-bg.jpg",
        alt: "Calm living room interior flooded with light from a large window",
      },
    },
  },
}
