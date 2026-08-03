"use client"

import * as React from "react"

import type { SiteContentCalculator } from "@/lib/site-content/types"
import { Container, Display, Eyebrow, Section } from "@/components/home/primitives"

import { CustomerEstimator, INITIAL_ESTIMATOR_UNITS } from "./customer-estimator"
import { CustomerLeadForm } from "./customer-lead-form"

interface CustomerLeadSectionProps {
  /** Public subdomain slug. The API resolves the real site row from it. */
  siteSlug: string
  /**
   * Estimate config, when the owner filled one in. Optional on purpose:
   * the calculator is an ENHANCEMENT layered on the lead form, never a
   * gate in front of it. A photographer or a bookstore has nothing to
   * meter by the unit and still needs a way to be contacted in writing.
   */
  calculator?: SiteContentCalculator
}

/**
 * Lead capture for a delivered tenant site — the form always, the estimator
 * only when configured.
 *
 * The unit count lives here rather than inside <CustomerEstimator> because
 * the two are siblings: the estimator writes it, the form sends it. Nothing
 * about the money crosses that boundary — the form posts a unit COUNT and
 * /api/leads recomputes the dollar figure from the site's stored config.
 */
export function CustomerLeadSection({
  siteSlug,
  calculator,
}: CustomerLeadSectionProps): React.JSX.Element {
  const [units, setUnits] = React.useState(INITIAL_ESTIMATOR_UNITS)

  if (!calculator) {
    return (
      <Section id="contact-form">
        <Container>
          {/* Same vertical structure as the calculator branch below — intro
              block, then the card at the same width the form has there. A
              two-column split was tried first and read badly: three lines of
              intro beside a 500px form leaves a hole in the left column. */}
          <div className="max-w-2xl">
            <Eyebrow>Send a message</Eyebrow>
            <Display as="h2" className="mt-5 text-4xl sm:text-5xl">
              Tell us what you need.
            </Display>
            <p
              className="mt-5 text-lg leading-relaxed"
              style={{ color: "var(--apex-muted-fg)" }}
            >
              Fill in the form and we&apos;ll come back to you with next
              steps. No obligation, no pressure.
            </p>
          </div>
          <div className="mt-12 max-w-2xl">
            <CustomerLeadForm
              siteSlug={siteSlug}
              heading="Your details"
              blurb="The more you can tell us, the more useful our reply."
              sourcePage="lead-form"
            />
          </div>
        </Container>
      </Section>
    )
  }

  return (
    <Section id="estimate">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>Instant estimate</Eyebrow>
          <Display as="h2" className="mt-5 text-4xl sm:text-5xl">
            {calculator.heading}
          </Display>
          <p
            className="mt-5 text-lg leading-relaxed"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            Move the number and see roughly what the job runs. It&apos;s a
            ballpark, not a quote — the real price comes after we look at it.
          </p>
        </div>

        {/* items-start, not the default stretch: the lead form is always the
            taller column, and stretching the calculator to match opens a
            hole inside a bordered card. Two cards of honest height read as
            deliberate; one card with a void in it reads as broken. */}
        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-8">
          <CustomerEstimator
            calculator={calculator}
            units={units}
            onUnitsChange={setUnits}
          />
          <CustomerLeadForm
            siteSlug={siteSlug}
            heading={calculator.leadFormHeading}
            blurb={calculator.leadFormBlurb}
            calculatorUnits={units}
            sourcePage="estimate-form"
          />
        </div>
      </Container>
    </Section>
  )
}
