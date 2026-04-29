import Link from "next/link"

import type { Theme } from "@/lib/themes/types"
import { themeOptions } from "@/lib/themes"
import { Container, Display, Eyebrow, Section } from "./primitives"

interface ShowcaseProps {
  theme: Theme
  activeSlug?: string
}

export function Showcase({ theme, activeSlug }: ShowcaseProps) {
  void theme
  return (
    <Section id="demos">
      <Container>
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
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {themeOptions.map((t) => (
            <Link
              key={t.slug}
              href={`/demos/${t.slug}`}
              data-active={activeSlug === t.slug || undefined}
              className="group block focus:outline-none"
            >
              <ThemeThumbnail theme={t} active={activeSlug === t.slug} />
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  )
}

function ThemeThumbnail({ theme, active }: { theme: Theme; active?: boolean }) {
  return (
    <div
      className="overflow-hidden transition-transform group-hover:-translate-y-1"
      style={{
        borderRadius: "var(--apex-radius-md)",
        border: active ? "2px solid var(--apex-primary)" : "1px solid var(--apex-border)",
        background: theme.colors.bg,
        color: theme.colors.fg,
      }}
    >
      <div className="aspect-[4/3] p-4" style={{ background: theme.colors.bg }}>
        <div className="mb-2 flex items-center gap-1.5">
          {[theme.colors.primary, theme.colors.accent, theme.colors.fg].map((c) => (
            <span
              key={c}
              className="h-2 w-2 rounded-full"
              style={{ background: c }}
              aria-hidden
            />
          ))}
        </div>
        <p
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: theme.colors.mutedFg }}
        >
          {theme.heroEyebrow}
        </p>
        <p
          className="mt-2 text-base leading-tight"
          style={{
            fontFamily: theme.fonts.display === "fraunces" || theme.fonts.display === "playfair-display" ? "serif" : "sans-serif",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: theme.colors.fg,
          }}
        >
          We build sites that book{" "}
          <span style={{ color: theme.colors.primary }}>jobs.</span>
        </p>
        <div className="mt-3 flex gap-1.5">
          <span
            className="px-2 py-1 text-[9px] font-bold uppercase"
            style={{
              background: theme.colors.primary,
              color: theme.colors.primaryFg,
              borderRadius: theme.radius.pill,
            }}
          >
            Quote →
          </span>
          <span
            className="px-2 py-1 text-[9px] font-bold uppercase"
            style={{
              background: "transparent",
              color: theme.colors.fg,
              border: `1px solid ${theme.colors.fg}`,
              borderRadius: theme.radius.pill,
            }}
          >
            Pricing
          </span>
        </div>
      </div>
      <div
        className="border-t px-4 py-2"
        style={{
          background: theme.colors.surface,
          color: theme.colors.surfaceFg,
          borderColor: theme.colors.border,
        }}
      >
        <p className="text-[11px] font-semibold">{theme.name}</p>
        <p className="text-[10px]" style={{ color: theme.colors.mutedFg }}>
          {theme.vibe}
        </p>
      </div>
    </div>
  )
}
