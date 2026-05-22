import * as React from "react"

import { Container, Display, Eyebrow, Lede, Section } from "@/components/apex"
import { FadeUp } from "@/components/apex/motion/fade-up"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const QUESTIONS = [
  {
    q: "How fast can you really launch in 24 hours?",
    a: "From receipt of your content. We provide a fillable worksheet that takes about 30 minutes — once you submit, the 24-hour clock starts. Most clients complete the worksheet the same day they buy and are live by the next morning.",
  },
  {
    q: "What if I don't see a style I like?",
    a: "We have 30 designs available, every one buyable under either tier. The 10 featured on the homepage are our highest-converting starting lineup; the other 20 live in the portfolio. If none fits, get in touch — we add new themes regularly.",
  },
  {
    q: "Can I edit my own content?",
    a: "Yes. Subscription includes unlimited edits via your customer portal — copy, photos, colors, layout. One-time customers get 30 days of free edits after launch, then read-only unless you add the $29/mo hosting plan.",
  },
  {
    q: "Who owns the site?",
    a: "You do. Subscription customers can export their content + design at any time. One-time customers receive the full source code on launch — host it on your own Vercel, Netlify, or anywhere else.",
  },
  {
    q: "Can I use my own domain?",
    a: "Yes. We launch on a temporary yourshopfront.com subdomain within 24 hours, then migrate to your domain when DNS propagates. If you don't have a domain yet, we'll register one for you.",
  },
  {
    q: "What's different about Your Shopfront vs Wix or Squarespace?",
    a: "We're done-for-you and conversion-focused. They sell tools and a blank canvas; we sell finished sites built on patterns that actually work. You don't pick a template — we build the site for you, and you're live the next day.",
  },
]

export function HomeFaq() {
  return (
    <Section bg="paper" id="faq">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <FadeUp>
            <Eyebrow>FAQ</Eyebrow>
            <Display level="display-xl" className="mt-5">
              Questions you&apos;d actually ask.
            </Display>
            <Lede className="mt-5">
              Still wondering something? Email us at{" "}
              <a
                href="mailto:hello@yourshopfront.com"
                className="font-semibold text-apx-ink underline underline-offset-2 hover:text-apx-primary"
              >
                hello@yourshopfront.com
              </a>
              .
            </Lede>
          </FadeUp>
          <FadeUp delay={80}>
            <Accordion className="w-full">
              {QUESTIONS.map((item, i) => (
                <AccordionItem
                  key={item.q}
                  value={`faq-${i}`}
                  className="border-b border-apx-line"
                >
                  <AccordionTrigger className="py-5 text-left text-[17px] font-semibold text-apx-ink hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-[16px] leading-[1.55] text-apx-mute">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FadeUp>
        </div>
      </Container>
    </Section>
  )
}
