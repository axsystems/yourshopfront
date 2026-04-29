import type { Theme } from "@/lib/themes/types"
import { Container, Display, Eyebrow, Section } from "./primitives"

interface HowItWorksProps {
  theme: Theme
}

const STEPS = [
  {
    n: "01",
    title: "Pick a style",
    body: "Click through 10 fully-designed homepages. When one feels right, click \"I want this look.\"",
  },
  {
    n: "02",
    title: "We swap your content in",
    body: "You send us your business info, photos, and headlines. We do the design work — you review.",
  },
  {
    n: "03",
    title: "You review",
    body: "Get a private staging URL. Request unlimited revisions on copy, photos, layout, color tweaks.",
  },
  {
    n: "04",
    title: "We launch in 24h",
    body: "Approve the final, we point your domain (or give you a custom subdomain) and your site goes live.",
  },
]

export function HowItWorks({ theme }: HowItWorksProps) {
  void theme
  return (
    <Section>
      <Container>
        <div className="max-w-3xl">
          <Eyebrow>How it works</Eyebrow>
          <Display as="h2" className="mt-5 text-4xl sm:text-5xl">
            Four steps, four days,{" "}
            <span style={{ color: "var(--apex-primary)" }}>your site live by Friday.</span>
          </Display>
          <p
            className="mt-5 max-w-xl text-lg leading-relaxed"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            We don&apos;t disappear into a six-week design process. You see progress every day, and most
            sites launch in under a week.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="p-7"
              style={{
                background: "var(--apex-surface)",
                color: "var(--apex-surface-fg)",
                border: "1px solid var(--apex-border)",
                borderRadius: "var(--apex-radius-lg)",
              }}
            >
              <p
                className="text-xs"
                style={{
                  color: "var(--apex-muted-fg)",
                  fontFamily: "var(--apex-font-mono)",
                  letterSpacing: "0.18em",
                }}
              >
                STEP / {step.n}
              </p>
              <h3
                className="mt-3 text-2xl leading-tight"
                style={{
                  fontFamily: "var(--apex-font-display)",
                  fontWeight: 700,
                  letterSpacing: "-0.015em",
                }}
              >
                {step.title}
              </h3>
              <p
                className="mt-3 text-sm leading-relaxed"
                style={{ color: "var(--apex-muted-fg)" }}
              >
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
