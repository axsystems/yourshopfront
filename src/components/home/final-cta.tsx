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

export function FinalCTA({ theme, ctaPrimaryHref = "#showcase" }: FinalCTAProps) {
  const cta = theme.content?.finalCta
  const headline = cta?.headline ?? DEFAULT_COPY.headline
  const highlight = cta?.highlight ?? DEFAULT_COPY.highlight
  const body = cta?.body ?? DEFAULT_COPY.body
  const ctaLabel = cta?.ctaLabel ?? DEFAULT_COPY.ctaLabel
  const bg = cta?.backgroundImage

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
            <span style={{ color: "var(--apex-primary)" }}>{highlight}</span>
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
