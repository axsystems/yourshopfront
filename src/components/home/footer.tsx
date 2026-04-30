import Link from "next/link"

import type { Theme } from "@/lib/themes/types"
import { Container } from "./primitives"

interface FooterProps {
  theme: Theme
}

interface FooterLink {
  label: string
  href: string
}

const PRODUCT_LINKS: FooterLink[] = [
  { label: "Pricing", href: "/pricing" },
  { label: "Demos", href: "/#showcase" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "FAQ", href: "/#faq" },
]

const COMPANY_LINKS: FooterLink[] = [
  { label: "Contact", href: "/contact" },
  { label: "About", href: "#" }, // TBD
  { label: "Refund policy", href: "#" }, // TBD
]

const LEGAL_LINKS: FooterLink[] = [
  { label: "Terms", href: "#" }, // TBD
  { label: "Privacy", href: "#" }, // TBD
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
      <Container className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p
            className="text-2xl"
            style={{
              fontFamily: "var(--apex-font-display)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Apex Sites
          </p>
          <p
            className="mt-3 max-w-sm text-sm leading-relaxed"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            Websites that book more jobs.
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
        <FooterColumn heading="Product" links={PRODUCT_LINKS} />
        <FooterColumn heading="Company" links={COMPANY_LINKS} />
        <FooterColumn heading="Legal" links={LEGAL_LINKS} />
      </Container>
      <Container
        className="mt-12 flex flex-col items-start justify-between gap-3 border-t pt-6 text-xs sm:flex-row sm:items-center"
        style={{ borderColor: "var(--apex-border)" }}
      >
        <p style={{ color: "var(--apex-muted-fg)" }}>
          © {new Date().getFullYear()} Apex Sites. All rights reserved.
        </p>
        <p
          style={{
            color: "var(--apex-muted-fg)",
            fontFamily: "var(--apex-font-mono)",
            letterSpacing: "0.06em",
          }}
        >
          Hosted on Vercel · Built with Next.js
        </p>
      </Container>
    </footer>
  )
}

function FooterColumn({ heading, links }: { heading: string; links: FooterLink[] }) {
  return (
    <div>
      <p
        className="text-xs font-bold uppercase tracking-[0.16em]"
        style={{ color: "var(--apex-muted-fg)" }}
      >
        {heading}
      </p>
      <ul className="mt-4 space-y-2">
        {links.map((l) => (
          <li key={`${heading}-${l.label}`}>
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
  )
}
