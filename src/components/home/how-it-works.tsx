import type { Theme } from "@/lib/themes/types"
import { Container, Display, Eyebrow, Section } from "./primitives"

interface HowItWorksProps {
  theme: Theme
}

const STEPS = [
  {
    n: "01",
    title: "Pick a style",
    body: "Browse our 10 theme options (or all 24 if you want a fully-custom build). Click the one that fits your business — every detail re-skins to that style instantly.",
  },
  {
    n: "02",
    title: "Send your content",
    body: "Logo, photos, copy, services, contact info, hours. We provide a fillable worksheet that takes about 30 minutes to complete.",
  },
  {
    n: "03",
    title: "We swap it in",
    body: "We rebuild your site in your chosen style with your content. 24 hours from receipt — no agency timelines, no design-by-committee delay.",
  },
  {
    n: "04",
    title: "Review and launch",
    body: "You approve via a private staging URL. We launch on your domain (or our subdomain while DNS propagates). Done.",
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
            Four steps,{" "}
            <span style={{ color: "var(--apex-primary)" }}>
              your site live by the end of the week.
            </span>
          </Display>
          <p
            className="mt-5 max-w-xl text-lg leading-relaxed"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            We don&apos;t disappear into a six-week design process. You see progress every day,
            and most sites launch in under a week from the day you sign up.
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
