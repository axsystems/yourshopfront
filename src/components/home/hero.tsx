import * as React from "react"
import Image from "next/image"

import {
  HideWhenEmbedded,
  ShowWhenEmbedded,
} from "@/components/hide-when-embedded"
import { previewHeadline } from "@/lib/seo-headlines"
import type { Theme } from "@/lib/themes/types"
import { ApexButton, Container, Display } from "./primitives"
import {
  PROMO_MONTHLY,
  PROMO_MONTHS,
  PROMO_SETUP_PRICE,
  STANDARD_MONTHLY,
} from "@/lib/pricing-constants"

/**
 * Phase A: dark themes need a light scrim, light themes need a dark
 * scrim so the heading stays high-contrast. We sniff the bg color hex
 * luma to decide; works for every theme's `colors.bg` regardless of vibe.
 */
function isDarkBg(hex: string): boolean {
  const v = hex.replace("#", "")
  if (v.length !== 6 && v.length !== 8) return false
  const r = parseInt(v.slice(0, 2), 16)
  const g = parseInt(v.slice(2, 4), 16)
  const b = parseInt(v.slice(4, 6), 16)
  // Rec. 709 luma.
  const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luma < 0.5
}

interface HeroProps {
  theme: Theme
  ctaPrimaryHref?: string
  ctaSecondaryHref?: string
  isDemoPreview?: boolean
  /** True only on /demos/[slug]; enables the theme's real hero copy. */
  isDemoRoute?: boolean
}

const DEFAULT_HEADLINE = "A website your business deserves."
const DEFAULT_SUBHEAD =
  "Pick a design, send us your content, your site is live in 24 hours. Built for every small business."

/**
 * Label for the hero CTA in the embedded variant. Every one of the 30
 * themes authors a business-voice CTA on `content.finalCta.ctaLabel`
 * ("Book a plumber now →", "Get move estimate →"), so reuse it rather than
 * inventing a second copy field; the fallback only guards the type.
 */
const EMBEDDED_CTA_FALLBACK = "Get a free quote →"

/**
 * Where the embedded hero CTA scrolls to — the FinalCTA block, which
 * carries the contact card. `<ThemedHome>` puts this id on the wrapper.
 */
const EMBEDDED_CTA_HREF = "#contact"

export function Hero({
  theme,
  ctaPrimaryHref = "/checkout?tier=subscription",
  ctaSecondaryHref = "/pricing",
  isDemoPreview = false,
  isDemoRoute = false,
}: HeroProps) {
  // `/demos/[slug]` shows the business's own copy when the theme provides
  // it; `/portfolio/[slug]` keeps the descriptive headline, which is the
  // SEO surface. Both routes set isDemoPreview, so the demo route needs
  // its own flag — see src/lib/themes/types.ts.
  const realHero = isDemoRoute ? theme.content?.hero : undefined
  const headline = realHero
    ? realHero.headline
    : isDemoPreview
      ? previewHeadline(theme)
      : DEFAULT_HEADLINE
  const subhead = realHero
    ? realHero.sub
    : isDemoPreview
      ? `${theme.description} Same Your Shopfront service underneath — pick this style and we'll have your site live in 24 hours.`
      : DEFAULT_SUBHEAD

  // Gallery puts the visual below the headline, full-width.
  // The other 4 patterns use a 2-col grid with the visual on the right.
  const isStacked = theme.hero === "gallery"

  const dark = isDarkBg(theme.colors.bg)
  // Scrim gradient: stronger over the headline column, fading toward the
  // widget side so it doesn't dull the card. Direction flips when the
  // hero is stacked (image becomes a top band; scrim runs vertically).
  const scrimRgb = dark ? "0,0,0" : "255,255,255"
  const scrimGradient = isStacked
    ? `linear-gradient(180deg, rgba(${scrimRgb},0.88) 0%, rgba(${scrimRgb},0.78) 40%, rgba(${scrimRgb},0.55) 100%)`
    : `linear-gradient(${dark ? "100deg" : "95deg"}, rgba(${scrimRgb},0.92) 0%, rgba(${scrimRgb},0.82) 45%, rgba(${scrimRgb},0.45) 100%)`

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
      {/*
        Phase A: themed hero photo. Lives in public/themes/<slug>/hero.jpg
        so it's served same-origin (no need to allowlist a remote CDN in
        next.config or the strict img-src CSP). Rendered with priority so
        it's the LCP element. A theme-coloured scrim sits on top to keep
        the heading contrast high.
      */}
      <Image
        src={theme.heroImage.url}
        alt={theme.heroImage.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ zIndex: 0 }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: scrimGradient, zIndex: 1 }}
      />
      {theme.vibe === "bold-industrial" && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-0 h-2"
            style={{
              zIndex: 2,
              backgroundImage:
                "repeating-linear-gradient(45deg, var(--apex-primary) 0 16px, var(--apex-fg) 16px 32px)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 bottom-0 h-2"
            style={{
              zIndex: 2,
              backgroundImage:
                "repeating-linear-gradient(45deg, var(--apex-primary) 0 16px, var(--apex-fg) 16px 32px)",
            }}
          />
        </>
      )}
      <Container
        style={{ position: "relative", zIndex: 3 }}
        className={
          isStacked
            ? "relative flex flex-col gap-12"
            : "relative grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16"
        }
      >
        <div className={isStacked ? "max-w-3xl" : "max-w-2xl"}>
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
            {headline}
          </Display>
          <p
            className="mt-6 max-w-xl text-lg leading-relaxed"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            {subhead}
          </p>
          {/*
            Inside a frame the page is standing in for the customer's own
            site (the /start previews, <RotatingPreview>, <DemoCard>), so
            our two meta CTAs are replaced by the business's single one and
            the promo strip is dropped entirely. Frame-based, like the rest
            of the embed suppression — a human visit to /demos/[slug] is
            byte-identical to before.
          */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <HideWhenEmbedded>
              <ApexButton theme={theme} variant="primary" size="lg" asChildHref={ctaPrimaryHref}>
                Pick a style →
              </ApexButton>
              <ApexButton theme={theme} variant="outline" size="lg" asChildHref={ctaSecondaryHref}>
                See pricing
              </ApexButton>
            </HideWhenEmbedded>
            <ShowWhenEmbedded>
              <ApexButton
                theme={theme}
                variant="primary"
                size="lg"
                asChildHref={EMBEDDED_CTA_HREF}
              >
                {theme.content?.finalCta?.ctaLabel ?? EMBEDDED_CTA_FALLBACK}
              </ApexButton>
            </ShowWhenEmbedded>
          </div>
          <HideWhenEmbedded>
            <p
              className="mt-6 text-xs"
              style={{
                color: "var(--apex-muted-fg)",
                fontFamily: "var(--apex-font-mono)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              ${PROMO_SETUP_PRICE} today · first month free · then {PROMO_MONTHLY} for {PROMO_MONTHS} months, then {STANDARD_MONTHLY} · live in 24h
            </p>
          </HideWhenEmbedded>
        </div>
        <div className={isStacked ? "" : "lg:justify-self-end lg:self-center"}>
          <HeroVisual variant={theme.hero} theme={theme} />
        </div>
      </Container>
    </section>
  )
}

function HeroVisual({ variant, theme }: { variant: Theme["hero"]; theme: Theme }) {
  switch (variant) {
    case "phone-first":
      return <HeroPhoneFirst theme={theme} />
    case "calculator":
      return <HeroCalculator theme={theme} />
    case "gallery":
      return <HeroGallery theme={theme} />
    case "booking-card":
      return <HeroBookingCard theme={theme} />
    case "form-card":
      return <HeroFormCard theme={theme} />
  }
}

/**
 * Annotation under each hero widget explaining what the real thing would
 * do on the customer's live site. It is the loudest piece of Your
 * Shopfront meta-copy left in the hero, so it is gated here rather than at
 * each of the five call sites.
 */
function PreviewCaption({ children }: { children: React.ReactNode }) {
  return (
    <HideWhenEmbedded>
      {/* Sits on its own translucent chip: half the themes put a photo behind
          the hero, and muted-fg mono over a photo was effectively unreadable
          — a caption nobody can read does none of the work it is here for. */}
      <p
        className="mt-3 inline-block max-w-md px-3 py-2 text-[11px] leading-snug"
        style={{
          color: "var(--apex-muted-fg)",
          background: "color-mix(in oklab, var(--apex-surface) 92%, transparent)",
          border: "1px solid var(--apex-border)",
          borderRadius: "var(--apex-radius-md)",
          backdropFilter: "blur(6px)",
          fontFamily: "var(--apex-font-mono)",
          letterSpacing: "0.04em",
        }}
      >
        ← {children}
      </p>
    </HideWhenEmbedded>
  )
}

function VisualCard({
  children,
  accent = false,
}: {
  children: React.ReactNode
  accent?: boolean
}) {
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

function HeroPhoneFirst({ theme }: { theme: Theme }) {
  // Spec: giant H1 left-aligned, massive phone-style click-to-call as
  // the primary CTA. No widget on the right. Convey urgency.
  return (
    <div className="w-full max-w-md">
      <p
        className="text-xs font-bold uppercase tracking-[0.18em]"
        style={{
          color: "var(--apex-primary)",
          fontFamily: "var(--apex-font-mono)",
        }}
      >
        ⚠ EMERGENCY DISPATCH — ANSWERED LIVE 24/7
      </p>
      {/*
        Demo phone-CTA. Rendered as <button type="button"> so screen readers
        do not announce it as a dial-able tel: link — the number is
        illustrative, not real. On a customer's actual live site the
        equivalent CTA gets the customer's real number.
      */}
      <button
        type="button"
        aria-label="Demo number — your real Your Shopfront tap-to-call goes here"
        className="mt-4 block w-full cursor-default border-0 text-center transition-transform"
        style={{
          background: "var(--apex-primary)",
          color: "var(--apex-primary-fg)",
          padding: "32px 24px",
          borderRadius: "var(--apex-radius-lg)",
          boxShadow:
            "0 0 0 4px color-mix(in oklab, var(--apex-primary) 18%, transparent), 0 24px 48px -12px color-mix(in oklab, var(--apex-fg) 35%, transparent)",
        }}
      >
        <span
          className="block text-[11px] font-bold uppercase tracking-[0.2em]"
          style={{
            opacity: 0.7,
            fontFamily: "var(--apex-font-mono)",
          }}
        >
          Demo · tap-to-call
        </span>
        <span
          className="mt-2 block text-4xl leading-none sm:text-5xl"
          style={{
            fontFamily: "var(--apex-font-display)",
            fontWeight: 800,
            letterSpacing: "-0.025em",
          }}
        >
          (555) 000-{theme.slug.length.toString().padStart(4, "0")}
        </span>
        <span
          className="mt-3 block text-xs font-semibold"
          style={{ opacity: 0.85 }}
        >
          On your live site this dials your real number
        </span>
      </button>
      <PreviewCaption>
        This is a live preview. On YOUR live site this dials your real number, and the same tap-to-call sits in the sticky header at every scroll position.
      </PreviewCaption>
    </div>
  )
}

function HeroCalculator({ theme }: { theme: Theme }) {
  return (
    <div className="w-full max-w-md">
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
          Get your quote in 60 seconds →
        </ApexButton>
      </VisualCard>
      <PreviewCaption>
        This is a live preview. YOUR live site gets a real estimate tool built on your own starting price, per-unit rate, and minimum, and it shows its math.
      </PreviewCaption>
    </div>
  )
}

const DEFAULT_GALLERY_TAGS = ["Featured work", "Recent project", "Client favorite", "This week"]

function HeroGallery({ theme }: { theme: Theme }) {
  // Falls back to a neutral, theme-tinted set when a theme has not been
  // migrated to `content.heroGallery` yet — never another trade's words.
  const fallbackSwatch: [string, string, string] = [
    theme.colors.primary,
    theme.colors.accent,
    theme.colors.muted,
  ]
  const tiles =
    theme.content?.heroGallery?.tiles ??
    DEFAULT_GALLERY_TAGS.map((tag) => ({ tag, swatch: fallbackSwatch }))
  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
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
      <PreviewCaption>
        This is a live preview. YOUR live site&apos;s gallery is the photos you send us — a twelve-photo grid or six full-size uncropped shots, above or below your services.
      </PreviewCaption>
    </div>
  )
}

function HeroBookingCard({ theme }: { theme: Theme }) {
  return (
    <div className="w-full max-w-md">
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
        <input
          type="email"
          placeholder="you@example.com"
          aria-label="Email for booking confirmation"
          className="mt-4 w-full px-3 py-2.5 text-sm"
          style={{
            background: "var(--apex-bg)",
            border: "1.5px solid var(--apex-border)",
            borderRadius: "var(--apex-radius-md)",
            color: "var(--apex-fg)",
          }}
          readOnly
          value="sarah@example.com"
        />
        <ApexButton theme={theme} variant="primary" size="lg" className="mt-4 w-full">
          Book my consultation →
        </ApexButton>
      </VisualCard>
      <PreviewCaption>
        This is a live preview — the date picker is illustration, not booking. YOUR live site converts that visitor with tap-to-call plus a request form that emails you.
      </PreviewCaption>
    </div>
  )
}

const DEFAULT_FORM_HEADING = "Get a custom quote"
const DEFAULT_FORM_BODY =
  "Tell us a bit about the job and we'll email you a quote — no pressure, no spam."

function HeroFormCard({ theme }: { theme: Theme }) {
  const heading = theme.content?.heroFormCard?.heading ?? DEFAULT_FORM_HEADING
  const body = theme.content?.heroFormCard?.body ?? DEFAULT_FORM_BODY
  const fields = [
    { label: "Name", value: "Sarah Whitman" },
    { label: "Address", value: "1428 Oak St, Dallas TX" },
    { label: "Phone", value: "(214) 555-0142" },
  ]
  const totalSteps = 4
  const currentStep = 3
  return (
    <div className="w-full max-w-md">
      <VisualCard>
        <div className="flex items-center justify-between">
          <h3
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--apex-font-display)" }}
          >
            {heading}
          </h3>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className="h-1.5 w-6 rounded-full"
                style={{
                  background:
                    i < currentStep ? "var(--apex-primary)" : "var(--apex-muted)",
                }}
                aria-hidden
              />
            ))}
          </div>
        </div>
        <p className="mt-1 text-sm" style={{ color: "var(--apex-muted-fg)" }}>
          {body}
        </p>
        {fields.map((f) => (
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
          Get my custom quote →
        </ApexButton>
        <p className="mt-3 text-center text-[11px]" style={{ color: "var(--apex-muted-fg)" }}>
          No phone tag · No spam · Real human reply
        </p>
      </VisualCard>
      <PreviewCaption>
        This is a live preview. YOUR live site&apos;s request form is one screen and emails you the lead — hit reply and it goes straight back to them. No tool to log into.
      </PreviewCaption>
    </div>
  )
}
