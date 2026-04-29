import * as React from "react"

import type { Theme } from "@/lib/themes/types"
import { ApexButton, Container, Display } from "./primitives"

interface HeroProps {
  theme: Theme
  ctaPrimaryHref?: string
  ctaSecondaryHref?: string
  isDemoPreview?: boolean
}

const DEFAULT_HEADLINE_PARTS = [
  "We build websites for ",
  "home-service",
  " businesses that book more jobs.",
] as const

const DEFAULT_LEDE =
  "Pick a style, we swap your content in, your site goes live in 24 hours. Subscription or one-time. Cancel anytime."

export function Hero({
  theme,
  ctaPrimaryHref = "/checkout?tier=subscription",
  ctaSecondaryHref = "/pricing",
  isDemoPreview = false,
}: HeroProps) {
  const headlineParts: readonly [string, string, string] = isDemoPreview
    ? ([
        "Apex Sites in the ",
        theme.name,
        ` style — built for ${theme.industry.toLowerCase()} brands.`,
      ] as const)
    : DEFAULT_HEADLINE_PARTS
  const lede = isDemoPreview
    ? `${theme.description} Same Apex Sites service underneath — pick this style and we'll have your site live in 24 hours.`
    : DEFAULT_LEDE
  const isDark =
    theme.colors.bg.startsWith("#0") ||
    theme.colors.bg.startsWith("#1") ||
    theme.colors.bg.startsWith("#2")
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "var(--apex-bg)",
        color: "var(--apex-fg)",
        paddingTop: "60px",
        paddingBottom: "100px",
      }}
    >
      {theme.vibe === "bold-industrial" && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-0 h-2"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, var(--apex-primary) 0 16px, var(--apex-fg) 16px 32px)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 bottom-0 h-2"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, var(--apex-primary) 0 16px, var(--apex-fg) 16px 32px)",
            }}
          />
        </>
      )}
      <Container className="relative grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div className="max-w-2xl">
          <span
            className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{
              background: "var(--apex-accent)",
              color: "var(--apex-accent-fg)",
              borderRadius: "var(--apex-radius-pill)",
            }}
          >
            {theme.heroEyebrow}
          </span>
          <Display
            as="h1"
            className="text-5xl sm:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--apex-font-display)" }}
          >
            {headlineParts[0]}
            <em
              className="not-italic"
              style={{
                color: "var(--apex-primary)",
                background:
                  theme.vibe === "bold-industrial" ? "var(--apex-primary)" : undefined,
                ...(theme.vibe === "bold-industrial"
                  ? {
                      color: "var(--apex-primary-fg)",
                      padding: "0 0.25em",
                      display: "inline-block",
                      transform: "skew(-4deg)",
                    }
                  : {}),
              }}
            >
              {headlineParts[1]}
            </em>
            {headlineParts[2]}
          </Display>
          <p
            className="mt-6 max-w-xl text-lg leading-relaxed"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            {lede}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ApexButton theme={theme} variant="primary" size="lg" asChildHref={ctaPrimaryHref}>
              Pick a style →
            </ApexButton>
            <ApexButton theme={theme} variant="outline" size="lg" asChildHref={ctaSecondaryHref}>
              See pricing
            </ApexButton>
          </div>
          <p
            className="mt-6 text-xs"
            style={{
              color: "var(--apex-muted-fg)",
              fontFamily: "var(--apex-font-mono)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            $499 setup + $199/mo · or $2,997 one-time · live in 24h
          </p>
        </div>
        <div className="lg:justify-self-end lg:self-center">
          <HeroVisual variant={theme.hero} theme={theme} dark={isDark} />
        </div>
      </Container>
    </section>
  )
}

function HeroVisual({
  variant,
  theme,
  dark,
}: {
  variant: Theme["hero"]
  theme: Theme
  dark: boolean
}) {
  void dark
  switch (variant) {
    case "phone-first":
      return <PhoneFirstHero theme={theme} />
    case "calculator":
      return <CalculatorHero theme={theme} />
    case "gallery":
      return <GalleryHero theme={theme} />
    case "booking-card":
      return <BookingCardHero theme={theme} />
    case "form-card":
      return <FormCardHero theme={theme} />
  }
}

function VisualCard({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className="relative w-full max-w-md"
      style={{
        background: "var(--apex-surface)",
        color: "var(--apex-surface-fg)",
        borderRadius: "var(--apex-radius-lg)",
        padding: "32px",
        boxShadow: accent
          ? "0 30px 60px -20px color-mix(in oklab, var(--apex-fg) 25%, transparent), 0 0 0 4px color-mix(in oklab, var(--apex-primary) 20%, transparent)"
          : "0 30px 60px -24px color-mix(in oklab, var(--apex-fg) 25%, transparent)",
        border: "1px solid var(--apex-border)",
      }}
    >
      {children}
    </div>
  )
}

function PhoneFirstHero({ theme }: { theme: Theme }) {
  return (
    <VisualCard>
      <p
        className="text-xs font-semibold uppercase tracking-[0.18em]"
        style={{
          color: "var(--apex-muted-fg)",
          fontFamily: "var(--apex-font-mono)",
        }}
      >
        Call now — answered live
      </p>
      <a
        href="tel:+15551234567"
        className="mt-3 block text-5xl leading-none sm:text-6xl"
        style={{
          fontFamily: "var(--apex-font-display)",
          color: "var(--apex-fg)",
          fontWeight: 800,
          letterSpacing: "-0.02em",
        }}
      >
        (555) 123-{theme.slug.length.toString().padStart(4, "0")}
      </a>
      <ul className="mt-6 space-y-2 text-sm" style={{ color: "var(--apex-muted-fg)" }}>
        <li className="flex items-center gap-2">
          <span style={{ color: "var(--apex-primary)" }}>●</span> Avg pickup: 12 sec
        </li>
        <li className="flex items-center gap-2">
          <span style={{ color: "var(--apex-primary)" }}>●</span> Same-day dispatch
        </li>
        <li className="flex items-center gap-2">
          <span style={{ color: "var(--apex-primary)" }}>●</span> Licensed &amp; bonded
        </li>
      </ul>
      <ApexButton theme={theme} variant="primary" size="lg" className="mt-6 w-full">
        Or text us →
      </ApexButton>
      <p
        className="mt-3 text-center text-[11px]"
        style={{ color: "var(--apex-muted-fg)", letterSpacing: "0.06em" }}
      >
        24/7 availability · No-show fee waived
      </p>
    </VisualCard>
  )
}

function CalculatorHero({ theme }: { theme: Theme }) {
  return (
    <VisualCard accent>
      <span
        className="absolute -top-3 left-7 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
        style={{
          background: "var(--apex-primary)",
          color: "var(--apex-primary-fg)",
          borderRadius: "var(--apex-radius-pill)",
        }}
      >
        Instant quote
      </span>
      <h3
        className="mt-3 text-2xl font-bold"
        style={{ fontFamily: "var(--apex-font-display)" }}
      >
        Get a price in 30 seconds
      </h3>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {[
          { label: "From", value: "Boston, MA" },
          { label: "To", value: "Cambridge" },
          { label: "Bedrooms", value: "2 BR" },
          { label: "Date", value: "Sat, Jun 8" },
        ].map((f) => (
          <div key={f.label}>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--apex-muted-fg)" }}
            >
              {f.label}
            </p>
            <div
              className="mt-1 px-3 py-2.5 text-sm font-medium"
              style={{
                background: "var(--apex-bg)",
                border: "2px solid var(--apex-border)",
                borderRadius: "var(--apex-radius-md)",
              }}
            >
              {f.value}
            </div>
          </div>
        ))}
      </div>
      <div
        className="mt-5 flex items-center justify-between px-4 py-3.5"
        style={{
          background: "var(--apex-accent)",
          color: "var(--apex-accent-fg)",
          borderRadius: "var(--apex-radius-md)",
        }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] opacity-80">
          Estimated total
        </p>
        <p
          className="text-3xl font-extrabold"
          style={{
            fontFamily: "var(--apex-font-display)",
            color: "var(--apex-primary)",
          }}
        >
          $487 <span className="text-sm font-medium opacity-70">flat</span>
        </p>
      </div>
      <ApexButton theme={theme} variant="primary" size="lg" className="mt-4 w-full">
        Book this slot
      </ApexButton>
    </VisualCard>
  )
}

function GalleryHero({ theme }: { theme: Theme }) {
  void theme
  const tiles = [
    { tag: "Restoration", swatch: ["#A04D38", "#C8634A", "#6B7C5F"] },
    { tag: "Exterior", swatch: ["#1A1614", "#6B5544", "#B8985F"] },
    { tag: "Cabinetry", swatch: ["#5C3A4A", "#C4978A", "#E8DFC8"] },
    { tag: "Heritage", swatch: ["#3F5965", "#6B7C5F", "#FAF6EE"] },
  ]
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-3">
      {tiles.map((t, i) => (
        <div
          key={t.tag}
          className="group relative aspect-[4/5] overflow-hidden"
          style={{
            borderRadius: "var(--apex-radius-md)",
            background: `linear-gradient(160deg, ${t.swatch[0]} 0%, ${t.swatch[1]} 60%, ${t.swatch[2]} 100%)`,
            transform: i % 2 ? "translateY(20px)" : undefined,
          }}
        >
          <div
            className="absolute inset-x-3 bottom-3 px-3 py-2"
            style={{
              background: "color-mix(in oklab, var(--apex-surface) 92%, transparent)",
              backdropFilter: "blur(6px)",
              borderRadius: "var(--apex-radius-sm)",
              fontFamily: "var(--apex-font-display)",
              color: "var(--apex-surface-fg)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "-0.005em",
            }}
          >
            {t.tag}
          </div>
        </div>
      ))}
    </div>
  )
}

function BookingCardHero({ theme }: { theme: Theme }) {
  return (
    <VisualCard accent>
      <span
        className="absolute -top-3 left-7 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
        style={{
          background: "var(--apex-primary)",
          color: "var(--apex-primary-fg)",
          borderRadius: "var(--apex-radius-pill)",
        }}
      >
        Book online
      </span>
      <h3
        className="mt-3 text-2xl font-bold"
        style={{ fontFamily: "var(--apex-font-display)" }}
      >
        Pick a date — see your price
      </h3>
      <div className="mt-6 grid grid-cols-3 gap-2">
        {["Tue 4", "Wed 5", "Thu 6", "Fri 7", "Sat 8", "Sun 9"].map((d, i) => (
          <button
            key={d}
            type="button"
            className="px-2 py-3 text-sm font-semibold"
            style={{
              background: i === 4 ? "var(--apex-primary)" : "var(--apex-bg)",
              color: i === 4 ? "var(--apex-primary-fg)" : "var(--apex-fg)",
              border: "1.5px solid var(--apex-border)",
              borderRadius: "var(--apex-radius-md)",
            }}
          >
            {d}
          </button>
        ))}
      </div>
      <div
        className="mt-5 flex items-center justify-between px-4 py-3.5"
        style={{
          background: "var(--apex-bg)",
          border: "1.5px solid var(--apex-border)",
          borderRadius: "var(--apex-radius-md)",
        }}
      >
        <p className="text-sm font-medium" style={{ color: "var(--apex-muted-fg)" }}>
          3-bedroom deep clean
        </p>
        <p
          className="text-2xl font-extrabold"
          style={{ fontFamily: "var(--apex-font-display)", color: "var(--apex-fg)" }}
        >
          $189
        </p>
      </div>
      <ApexButton theme={theme} variant="primary" size="lg" className="mt-4 w-full">
        Book Saturday
      </ApexButton>
    </VisualCard>
  )
}

function FormCardHero({ theme }: { theme: Theme }) {
  return (
    <VisualCard>
      <h3
        className="text-2xl font-bold"
        style={{ fontFamily: "var(--apex-font-display)" }}
      >
        Free inspection — no pressure
      </h3>
      <p className="mt-1 text-sm" style={{ color: "var(--apex-muted-fg)" }}>
        We&apos;ll walk your roof and email you a written quote within 24 hours.
      </p>
      {[
        { label: "Name", value: "Sarah Whitman" },
        { label: "Address", value: "1428 Oak St, Dallas TX" },
        { label: "Phone", value: "(214) 555-0142" },
      ].map((f) => (
        <div key={f.label} className="mt-3">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            {f.label}
          </p>
          <div
            className="mt-1 px-3 py-2.5 text-sm font-medium"
            style={{
              background: "var(--apex-bg)",
              border: "1.5px solid var(--apex-border)",
              borderRadius: "var(--apex-radius-md)",
            }}
          >
            {f.value}
          </div>
        </div>
      ))}
      <ApexButton theme={theme} variant="primary" size="lg" className="mt-5 w-full">
        Schedule inspection →
      </ApexButton>
      <p className="mt-3 text-center text-[11px]" style={{ color: "var(--apex-muted-fg)" }}>
        No phone tag · No spam · Real human reply
      </p>
    </VisualCard>
  )
}
