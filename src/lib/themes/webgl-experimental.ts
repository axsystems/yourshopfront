import type { Theme } from "./types"

/** Round 1 portfolio piece. Source: 07-webgl-experimental.html (VOLTAGE™ next-browser tech). */
export const webglExperimental: Theme = {
  slug: "webgl-experimental",
  name: "Acid Tech",
  industry: "Tech / Product",
  city: "San Francisco",
  tagline: "Engineered for the next browser.",
  description:
    "Hyper-tech experimental. Charcoal + acid green + electric blue + violet, Inter Tight (substituted Inter), JetBrains Mono labels, custom cursor and orb. For developer products, AI tools, and devtools brands.",
  mode: "project",
  vibe: "sleek-tech",
  hero: "gallery",
  heroEyebrow: "v3.0 · NOW IN BETA",
  colors: {
    bg: "#09090B",
    fg: "#F4F4F5",
    primary: "#C5FF00",
    primaryFg: "#09090B",
    accent: "#2D5BFF",
    accentFg: "#F4F4F5",
    muted: "#1A1A1F",
    mutedFg: "#A1A1AA",
    border: "#F4F4F514",
    surface: "#131316",
    surfaceFg: "#F4F4F5",
  },
  fonts: { display: "inter", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "6px", md: "8px", lg: "12px", pill: "999px" },
  button: { shape: "rounded", shadow: "glow", weight: "bold", uppercase: false },
  heroImage: {
    url: "/themes/webgl-experimental/hero.jpg",
    alt: "Abstract blue and violet generative gradient texture",
    credit: "Photo by Solen Feyissa on Unsplash",
  },

  seoTitle: "Acid Tech — Experimental Devtools Style · Your Shopfront Portfolio",
  seoDescription:
    "Your Shopfront portfolio: a hyper-tech devtools brand. Charcoal + acid green + electric blue, Inter Tight, custom cursor. Built for AI tools, devtools, and frontier-tech products.",
  isThemeOption: true,
  sourceHtmlPath: "07-webgl-experimental.html",
  round: 1,
  content: {
    howItWorks: {
      header: {
        eyebrow: "How it works",
        headline: "Sign up, connect your stack,",
        highlight: "and ship without rebuilding.",
        sub: "No waitlist, no pitch call. Create an account, hit the dashboard, and start building inside the browser. Deploy in one click, roll back if it breaks.",
      },
      steps: [
        {
          title: "Sign up in beta",
          body: "Early access. No waitlist, no form, no pitch call. Create an account, hit the dashboard, start building inside the browser.",
        },
        {
          title: "Connect your stack",
          body: "APIs, WebSockets, WebGL pipelines — native integrations for modern runtimes. The SDK speaks your language, not ours.",
        },
        {
          title: "Ship and experiment",
          body: "Deploy in one click. Iterate without rebuilding. Roll back if it breaks. The feedback loop is tight by design.",
        },
        {
          title: "Scale when you're ready",
          body: "Usage-based pricing, no minimums. Run it solo, hand it to a team, or embed it in something bigger. We don't get in the way.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "Beta", label: "Early access open", caption: "No waitlist, start now" },
        { value: "Browser-", label: "Native runtime", caption: "No backend required to start" },
        { value: "Usage-", label: "Based pricing", caption: "No minimums, no seat fees" },
        { value: "Open", label: "API standard", caption: "No proprietary lock-in" },
      ],
    },
    finalCta: {
      headline: "Building something that doesn't exist yet?",
      highlight: "Ship it here.",
      body: "Browser-native runtime, no-config deploys, usage-based pricing. Early access open now.",
      ctaLabel: "Get beta access →",
      backgroundImage: {
        url: "/themes/webgl-experimental/cta-bg.jpg",
        alt: "Smooth blue and pink gradient light illustration",
      },
    },
  },
}
