import type { Theme } from "@/lib/themes/types"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Container, Display, Eyebrow, Section } from "./primitives"

interface FAQProps {
  theme: Theme
}

const QUESTIONS = [
  {
    q: "How fast can you really launch in 24 hours?",
    a: "From receipt of your content. We provide a fillable worksheet that takes about 30 minutes — once you submit it, the 24-hour clock starts. Most clients complete the worksheet the same day they buy and are live by the next morning.",
  },
  {
    q: "What if I don't see a style I like?",
    a: "We have 30 designs available as theme options — every one is buyable under either tier. The 10 featured on the homepage are our highest-converting starting lineup; the other 20 live in the portfolio. If none fits, get in touch — we add new themes regularly and may have something in the pipeline that suits you.",
  },
  {
    q: "Can I edit my own content?",
    a: "Yes. Subscription includes unlimited edits via your customer portal — copy, photos, colors, layout. One-time customers get 30 days of free edits after launch, then read-only access unless you add the $29/mo hosting plan, which keeps edits flowing.",
  },
  {
    q: "Who owns the site?",
    a: "You do. Subscription customers can export their content + design at any time. One-time customers receive the full source code on launch — host it on your own Vercel, Netlify, or anywhere else you want.",
  },
  {
    q: "Can I use my own domain?",
    a: "Yes. We launch on a temporary apex-sites.com subdomain within 24 hours, then migrate to your domain when DNS propagates (usually a few hours). If you don't have a domain yet, we'll register one for you.",
  },
  {
    q: "What if I want to cancel?",
    a: "Subscription cancels anytime — one click in the portal, no phone call, no retention pitch. Your site stays live for 30 days post-cancellation as a grace period so you can migrate or restart.",
  },
  {
    q: "What's the refund policy?",
    a: "30-day money-back guarantee, no questions asked, on the $499 setup fee. Monthly fees are non-refundable, but you can cancel anytime so you only pay for the months you actually use.",
  },
  {
    q: "What's different about Apex vs Wix or Squarespace?",
    a: "We're done-for-you, conversion-focused, and home-service specialized. They sell tools and a blank canvas; we sell finished sites built on conversion patterns that actually work for trades. You don't pick a template — we build the site.",
  },
]

export function FAQ({ theme }: FAQProps) {
  void theme
  return (
    <Section>
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <div>
            <Eyebrow>FAQ</Eyebrow>
            <Display as="h2" className="mt-5 text-4xl sm:text-5xl">
              Questions you&apos;d{" "}
              <span style={{ color: "var(--apex-primary)" }}>actually</span> ask.
            </Display>
            <p className="mt-5 text-lg leading-relaxed" style={{ color: "var(--apex-muted-fg)" }}>
              Still wondering something? Email us at{" "}
              <a
                href="mailto:hello@apexsites.com"
                className="underline underline-offset-2"
                style={{ color: "var(--apex-fg)" }}
              >
                hello@apexsites.com
              </a>
              .
            </p>
          </div>
          <Accordion multiple={false} className="w-full">
            {QUESTIONS.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`faq-${i}`}
                className="border-b"
                style={{ borderColor: "var(--apex-border)" }}
              >
                <AccordionTrigger
                  className="py-5 text-left text-lg font-semibold hover:no-underline"
                  style={{
                    fontFamily: "var(--apex-font-display)",
                    color: "var(--apex-fg)",
                    letterSpacing: "-0.005em",
                  }}
                >
                  {item.q}
                </AccordionTrigger>
                <AccordionContent
                  className="pb-5 text-base leading-relaxed"
                  style={{ color: "var(--apex-muted-fg)" }}
                >
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </Section>
  )
}
