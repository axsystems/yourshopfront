import * as React from "react"

import {
  Container,
  Display,
  Eyebrow,
  Section,
  SiteFooter,
  SiteHeader,
} from "@/components/apex"

interface LegalPageProps {
  title: string
  /** ISO date or human-readable. Shown in the eyebrow. */
  lastUpdated?: string
  /**
   * If true, render a "drafting in progress" banner at the top. Use for the
   * placeholder-text Phase 5 deliverables until real legal copy lands.
   */
  draft?: boolean
  children: React.ReactNode
}

export function LegalPage({
  title,
  lastUpdated,
  draft,
  children,
}: LegalPageProps) {
  return (
    <>
      <SiteHeader variant="default" />
      <main id="main" className="flex-1 bg-apx-paper">
        <Section bg="canvas" className="py-16 md:py-20">
          <Container>
            <Eyebrow>
              {lastUpdated ? `Last updated · ${lastUpdated}` : "Legal"}
            </Eyebrow>
            <Display level="display-xl" as="h1" className="mt-4">
              {title}
            </Display>
            {draft ? (
              <div className="mt-6 rounded-xl border border-apx-warn bg-apx-coral-soft px-4 py-3 font-mono text-[12px] text-apx-warn">
                <strong className="font-bold">Drafting in progress.</strong>{" "}
                This page contains placeholder language only. Contact{" "}
                <a
                  href="mailto:hello@apexsites.com"
                  className="underline underline-offset-2"
                >
                  hello@apexsites.com
                </a>{" "}
                for the current terms before relying on anything below.
              </div>
            ) : null}
          </Container>
        </Section>
        <Section bg="paper">
          <Container>
            <article
              className="
                mx-auto max-w-[720px] text-[16px] leading-[1.65] text-apx-ink
                [&_h2]:mt-12 [&_h2]:font-sans [&_h2]:text-[24px] [&_h2]:font-bold [&_h2]:tracking-[-0.01em] [&_h2]:text-apx-ink
                [&_h2:first-child]:mt-0
                [&_h3]:mt-8 [&_h3]:font-sans [&_h3]:text-[18px] [&_h3]:font-bold [&_h3]:text-apx-ink
                [&_p]:mt-4 [&_p]:text-apx-ink
                [&_ul]:mt-4 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5
                [&_li]:text-apx-ink
                [&_a]:font-semibold [&_a]:text-apx-ink [&_a]:underline [&_a]:underline-offset-2
                hover:[&_a]:text-apx-primary
                [&_strong]:font-semibold [&_strong]:text-apx-ink
              "
            >
              {children}
            </article>
          </Container>
        </Section>
      </main>
      <SiteFooter variant="default" />
    </>
  )
}
