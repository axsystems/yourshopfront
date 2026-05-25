import type { Theme } from "./types"

/** Round 2 portfolio piece. Source: 08-switchback.html (observability SaaS — Linear-style). */
export const switchback: Theme = {
  slug: "switchback",
  name: "Switchback",
  industry: "Developer Tools / SaaS",
  city: "San Francisco",
  tagline: "Observability that ships with you.",
  description:
    "Linear-style developer SaaS. Near-black background grid + emerald glow + JetBrains Mono labels. Centered hero with code-card preview, multi-tile feature grid, gradient text.",
  mode: "recurring",
  vibe: "sleek-tech",
  hero: "form-card",
  heroEyebrow: "v3.4 · NOW SHIPPING",
  colors: {
    bg: "#0A0E12",
    fg: "#E6EDF3",
    primary: "#10B981",
    primaryFg: "#052E1A",
    accent: "#60A5FA",
    accentFg: "#0A0E12",
    muted: "#141A21",
    mutedFg: "#8B949E",
    border: "#FFFFFF14",
    surface: "#0E1318",
    surfaceFg: "#E6EDF3",
  },
  fonts: { display: "inter", body: "inter", mono: "jetbrains-mono" },
  radius: { sm: "6px", md: "8px", lg: "12px", pill: "999px" },
  button: { shape: "rounded", shadow: "glow", weight: "bold", uppercase: false },
  heroImage: {
    url: "/themes/switchback/hero.jpg",
    alt: "Close-up of green monospaced code on a dark monitor",
    credit: "Photo by Markus Spiske on Unsplash",
  },

  seoTitle: "Switchback — Observability SaaS · Apex Sites Portfolio",
  seoDescription:
    "Apex Sites portfolio: a developer-tools observability brand. Near-black + emerald glow, JetBrains Mono, code-card hero. Built for SaaS, devtools, and B2B subscription products.",
  isThemeOption: true,
  sourceHtmlPath: "08-switchback.html",
  round: 2,
  content: {
    howItWorks: {
      header: {
        eyebrow: "How it works",
        headline: "One command,",
        highlight: "traces in seconds — no infra to manage.",
        sub: "Install the SDK, ship your code, and your first distributed traces appear immediately. Auto-instrumentation handles the rest.",
      },
      steps: [
        {
          title: "Install in one command",
          body: "npm install, add the SDK, ship. No agents to provision, no infrastructure to maintain. First traces appear in seconds.",
        },
        {
          title: "Instrument your stack",
          body: "Auto-instrumentation for Node, Go, Python, and Rust. Manual spans where you need them. The SDK gets out of your way.",
        },
        {
          title: "See everything",
          body: "Distributed traces, logs, and metrics in one view. Tail-sampled, filtered, searchable — no more grepping across five tools.",
        },
        {
          title: "Debug and ship faster",
          body: "Click a trace, find the slow span, fix the query. Structured alerts that page only when something actually matters.",
        },
      ],
    },
    trustStrip: {
      stats: [
        { value: "One", label: "Command install", caption: "npm install and ship" },
        { value: "Auto-", label: "Instrumentation", caption: "Node, Go, Python, Rust" },
        { value: "Open", label: "Telemetry standard", caption: "No proprietary lock-in" },
        { value: "Free", label: "Tier to start", caption: "No card required" },
      ],
    },
    finalCta: {
      headline: "Flying blind in production?",
      highlight: "Traces in seconds.",
      body: "One-command install, auto-instrumentation, full distributed tracing. No infra to manage.",
      ctaLabel: "Start free →",
      backgroundImage: {
        url: "/themes/switchback/cta-bg.jpg",
        alt: "Two black flat-screen developer monitors glowing in a dark room",
      },
    },
  },
}
