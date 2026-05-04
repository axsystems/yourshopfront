import Link from "next/link"

import type { Theme } from "@/lib/themes/types"
import { FadeUp } from "@/components/apex/motion/fade-up"
import { themeOptions } from "@/lib/themes"
import { Container, Display, Eyebrow, Section } from "./primitives"

interface ShowcaseProps {
  theme: Theme
  activeSlug?: string
}

export function Showcase({ theme, activeSlug }: ShowcaseProps) {
  void theme
  return (
    <Section id="showcase">
      <Container>
        <FadeUp>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <Eyebrow>Showcase</Eyebrow>
              <Display as="h2" className="mt-5 text-4xl sm:text-5xl">
                {themeOptions.length} fully-designed homepages.{" "}
                <span style={{ color: "var(--apex-primary)" }}>Click any one to preview.</span>
              </Display>
              <p
                className="mt-5 max-w-xl text-lg leading-relaxed"
                style={{ color: "var(--apex-muted-fg)" }}
              >
                The whole homepage re-themes when you click. Find a vibe that fits, then click
                &quot;I want this look&quot; in the top bar.
              </p>
            </div>
          </div>
        </FadeUp>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {themeOptions.map((t) => (
            <ThumbnailCard key={t.slug} theme={t} active={activeSlug === t.slug} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1.5 text-base font-bold underline-offset-4 hover:underline"
            style={{ color: "var(--apex-fg)" }}
          >
            See all 24 designs (10 options + 14 custom-build inspiration) →
          </Link>
        </div>
      </Container>
    </Section>
  )
}

function ThumbnailCard({ theme, active }: { theme: Theme; active?: boolean }) {
  return (
    <Link
      href={`/demos/${theme.slug}`}
      prefetch
      data-active={active || undefined}
      className="group relative block overflow-hidden transition-transform hover:-translate-y-1 focus:outline-none"
      style={{
        borderRadius: "var(--apex-radius-md)",
        border: active
          ? "2px solid var(--apex-primary)"
          : "1px solid var(--apex-border)",
        background: theme.colors.surface,
      }}
      aria-label={`Preview the ${theme.name} style — ${theme.industry}`}
    >
      <div
        className="relative aspect-[4/3] w-full overflow-hidden"
        style={{ background: theme.colors.bg }}
      >
        <iframe
          src={`/demos/${theme.slug}?embed=1`}
          title={`${theme.name} preview`}
          aria-hidden="true"
          tabIndex={-1}
          loading="lazy"
          className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
          style={{
            width: "238%",
            height: "238%",
            transform: "scale(0.42)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full px-3 py-2 text-[11px] font-semibold transition-transform duration-200 group-hover:translate-y-0"
          style={{
            background: "color-mix(in oklab, var(--apex-fg) 92%, transparent)",
            color: "var(--apex-bg)",
          }}
        >
          <span className="font-bold">{theme.name}</span>{" "}
          <span style={{ opacity: 0.7 }}>· {theme.industry}</span>
        </div>
      </div>
    </Link>
  )
}
