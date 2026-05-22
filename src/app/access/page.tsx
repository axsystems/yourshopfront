import type { Metadata } from "next"

import { AccessForm } from "./access-form"
import {
  Container,
  Display,
  Eyebrow,
  Lede,
  Section,
  SiteFooter,
  SiteHeader,
} from "@/components/apex"

export const metadata: Metadata = {
  title: "Recover your access link",
  description:
    "Lost the welcome email with your onboarding link? Enter your purchase email and we'll send a fresh one.",
  robots: { index: false, follow: false },
}

export default function AccessPage() {
  return (
    <>
      <SiteHeader variant="default" />
      <main id="main" className="flex-1 bg-apx-paper">
        <Section bg="paper" className="py-20 md:py-24">
          <Container>
            <div className="mx-auto max-w-xl">
              <Eyebrow>Account recovery</Eyebrow>
              <Display level="display-lg" as="h1" className="mt-4">
                Lost your onboarding link?
              </Display>
              <Lede className="mt-5">
                Enter the email you used at checkout. We&apos;ll send you a
                fresh link to your dashboard.
              </Lede>
              <div className="mt-8">
                <AccessForm />
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter variant="default" />
    </>
  )
}
