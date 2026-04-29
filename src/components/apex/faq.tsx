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
    q: "How fast is \"24-hour delivery,\" really?",
    a: "Once we have your content (logo, copy, photos), we have your site live within 24 hours. Most clients send content the same day they buy and are live by the next morning.",
  },
  {
    q: "What content do I need to provide?",
    a: "Your business name, contact info, service areas, list of services, headshots or job photos, and your logo. Don't have a logo? We'll mock one up. Don't have copy? We have templates per industry.",
  },
  {
    q: "What does \"unlimited edits\" mean on the subscription plan?",
    a: "Email or Loom us a request — copy changes, photo swaps, color tweaks, new sections, blog posts. We turn most edits around within 48 hours. There's no per-request fee and no edit cap.",
  },
  {
    q: "Who owns the site?",
    a: "Subscription: we host and maintain it; if you cancel, you keep your domain and get 30 days to migrate. One-time: you own the source code outright at delivery, hosted wherever you want.",
  },
  {
    q: "Can I use my own domain?",
    a: "Yes. Whether you already own one or need to register one, we handle DNS setup. If you don't have a domain yet, you can use a free apex-sites.com subdomain while you decide.",
  },
  {
    q: "How do I cancel the subscription?",
    a: "One click in the customer portal — no phone call, no retention pitch. Your site stays online for 30 days after cancellation so you have time to migrate or restart.",
  },
  {
    q: "Do you do refunds?",
    a: "Yes — 30-day money-back guarantee on every plan. If we haven't earned your business in the first month, you get a full refund and you keep any work delivered so far.",
  },
  {
    q: "What makes Apex Sites different from a generic website builder?",
    a: "Three things: (1) you don't build it — we do; (2) the designs were made for home-service brands, not generic templates; (3) we manage your Google Business Profile too, which is where most service-business leads actually come from.",
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
