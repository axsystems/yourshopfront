import Link from "next/link"

import type { Theme } from "@/lib/themes/types"
import { DemoCard } from "@/components/apex/demo-card"
import { FadeUp } from "@/components/apex/motion/fade-up"
import { themeOptions } from "@/lib/themes"
import { cn } from "@/lib/utils"
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
        {/* DemoCard handles the mobile-img/desktop-iframe split + IntersectionObserver
            (kills the prior pattern where every visible thumbnail mounted a full demo
            iframe up-front). Active-slug border preserved via className. */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {themeOptions.map((t) => (
            <DemoCard
              key={t.slug}
              slug={t.slug}
              href={`/demos/${t.slug}`}
              className={cn(
                activeSlug === t.slug && "border-2 border-apx-primary"
              )}
            />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1.5 text-base font-bold underline-offset-4 hover:underline"
            style={{ color: "var(--apex-fg)" }}
          >
            See all 30 designs (10 options + 20 custom-build inspiration) →
          </Link>
        </div>
      </Container>
    </Section>
  )
}
