import Link from "next/link"

import type { Theme } from "@/lib/themes/types"
import { Container } from "./primitives"

interface FooterProps {
  theme: Theme
}

const COLS = [
  {
    heading: "Sites",
    links: [
      { label: "Showcase", href: "/#demos" },
      { label: "Pricing", href: "/pricing" },
      { label: "How it works", href: "/#how" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Customer login", href: "/portal" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Refund policy", href: "/refund-policy" },
    ],
  },
]

export function Footer({ theme }: FooterProps) {
  void theme
  return (
    <footer
      className="border-t py-16"
      style={{
        background: "var(--apex-bg)",
        color: "var(--apex-fg)",
        borderColor: "var(--apex-border)",
      }}
    >
      <Container className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
        <div>
          <p
            className="text-2xl"
            style={{ fontFamily: "var(--apex-font-display)", fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            Apex Sites
          </p>
          <p
            className="mt-3 max-w-sm text-sm leading-relaxed"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            Productized websites for home-service businesses. Pick a style, we launch in 24
            hours. Subscription or one-time.
          </p>
          <p
            className="mt-5 text-xs"
            style={{
              color: "var(--apex-muted-fg)",
              fontFamily: "var(--apex-font-mono)",
              letterSpacing: "0.06em",
            }}
          >
            hello@apexsites.com
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {COLS.map((col) => (
            <div key={col.heading}>
              <p
                className="text-xs font-bold uppercase tracking-[0.16em]"
                style={{ color: "var(--apex-muted-fg)" }}
              >
                {col.heading}
              </p>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm hover:underline"
                      style={{ color: "var(--apex-fg)" }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
      <Container className="mt-12 flex flex-col items-start justify-between gap-3 border-t pt-6 text-xs sm:flex-row sm:items-center" style={{ borderColor: "var(--apex-border)" }}>
        <p style={{ color: "var(--apex-muted-fg)" }}>
          © {new Date().getFullYear()} Apex Sites. All rights reserved.
        </p>
        <p style={{ color: "var(--apex-muted-fg)", fontFamily: "var(--apex-font-mono)", letterSpacing: "0.06em" }}>
          Built on Next.js · Hosted on Vercel
        </p>
      </Container>
    </footer>
  )
}
