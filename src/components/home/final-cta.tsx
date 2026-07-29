import Image from "next/image"

import type { Theme } from "@/lib/themes/types"
import { FinalCtaChatCard } from "./final-cta-chat-card"
import { ApexButton, Container, Display } from "./primitives"

interface FinalCTAProps {
  theme: Theme
  /**
   * Where the primary CTA button links. On `/demos/[slug]` this should go to
   * `/checkout?tier=subscription&demo=<slug>` (the Apex Sites buy flow); on
   * `/portfolio/[slug]` it falls back to the `#showcase` anchor on the same
   * page since `<Showcase>` still renders there.
   */
  ctaPrimaryHref?: string
}

const DEFAULT_COPY = {
  headline: "Ready to",
  highlight: "book more jobs?",
  body: "Pick a style, send us your content, and we'll launch your site within 24 hours. Cancel anytime — no calls, no contracts.",
  ctaLabel: "Pick your style →",
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "")
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean.slice(0, 6)
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return [r, g, b]
}

function relativeLuminance(rgb: [number, number, number]): number {
  const [rs, gs, bs] = rgb.map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs! + 0.7152 * gs! + 0.0722 * bs!
}

function contrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(hexToRgb(hexA))
  const lumB = relativeLuminance(hexToRgb(hexB))
  const lighter = Math.max(lumA, lumB)
  const darker = Math.min(lumA, lumB)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * `primary` is designed as a button-BACKGROUND color, not text-on-dark. This
 * section inverts colors (`--apex-fg` as the fill, `--apex-bg` as the default
 * text), so on themes where `primary` is itself a dark ink — Heritage
 * Painters, Greenwise Lawn — the highlight nearly disappears against the
 * scrim. Walk primary -> accent -> bg and use the first that clears WCAG AA
 * (4.5:1) against `fg`; `bg` always clears it, since it's already this
 * section's default text color.
 */
function pickHighlightColor(theme: Theme): string {
  const { fg, primary, accent } = theme.colors
  if (contrastRatio(primary, fg) >= 4.5) return "var(--apex-primary)"
  if (contrastRatio(accent, fg) >= 4.5) return "var(--apex-accent)"
  return "var(--apex-bg)"
}

export function FinalCTA({ theme, ctaPrimaryHref = "#showcase" }: FinalCTAProps) {
  const cta = theme.content?.finalCta
  const headline = cta?.headline ?? DEFAULT_COPY.headline
  const highlight = cta?.highlight ?? DEFAULT_COPY.highlight
  const body = cta?.body ?? DEFAULT_COPY.body
  const ctaLabel = cta?.ctaLabel ?? DEFAULT_COPY.ctaLabel
  const bg = cta?.backgroundImage
  const highlightColor = pickHighlightColor(theme)

  return (
    <section
      className="relative isolate py-24"
      style={{
        background: "var(--apex-fg)",
        color: "var(--apex-bg)",
      }}
    >
      {bg && (
        <>
          <Image
            src={bg.url}
            alt={bg.alt}
            fill
            sizes="100vw"
            className="-z-10 object-cover"
            priority={false}
          />
          {/* Scrim — guarantees text contrast on top of any photo, regardless
              of theme. Tuned darker on the left where the copy sits and softer
              on the right where the chat card overlays the image. */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(90deg, color-mix(in oklab, var(--apex-fg) 88%, transparent) 0%, color-mix(in oklab, var(--apex-fg) 78%, transparent) 50%, color-mix(in oklab, var(--apex-fg) 60%, transparent) 100%)",
            }}
          />
        </>
      )}
      <Container className="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <Display as="h2" className="text-4xl sm:text-5xl lg:text-6xl">
            {headline}{" "}
            <span style={{ color: highlightColor }}>{highlight}</span>
          </Display>
          <p className="mt-5 max-w-xl text-lg leading-relaxed opacity-80">
            {body}
          </p>
          <div className="mt-8">
            <ApexButton theme={theme} variant="primary" size="lg" asChildHref={ctaPrimaryHref}>
              {ctaLabel}
            </ApexButton>
          </div>
        </div>
        <FinalCtaChatCard theme={theme} />
      </Container>
    </section>
  )
}
