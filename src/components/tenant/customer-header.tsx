import * as React from "react"
import { Phone } from "lucide-react"

import type { SiteContentContact } from "@/lib/site-content/types"

interface CustomerHeaderProps {
  businessName: string
  contact: SiteContentContact
  hasReviews?: boolean
}

/**
 * Sticky themed header for the customer's tenant page. Replaces SiteHeader
 * variant="themed" — that one shows the Apex logo, which is wrong for a
 * customer subdomain. Here the wordmark IS the business name, styled with
 * the chosen theme's display font.
 */
export function CustomerHeader({
  businessName,
  contact,
  hasReviews,
}: CustomerHeaderProps) {
  const telHref = `tel:${stripPhoneFormatting(contact.phone)}`
  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-md"
      style={{
        background: "color-mix(in oklab, var(--apex-bg) 92%, transparent)",
        borderColor: "var(--apex-border)",
        color: "var(--apex-fg)",
      }}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
        style={{ background: "var(--apex-fg)", color: "var(--apex-bg)" }}
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-6 md:h-20 md:px-10">
        <a
          href="#"
          className="text-xl font-bold leading-none tracking-tight md:text-2xl"
          style={{ fontFamily: "var(--apex-font-display)" }}
        >
          {businessName}
        </a>
        <nav
          aria-label="Page sections"
          className="hidden items-center gap-6 md:flex"
        >
          <NavAnchor href="#services">Services</NavAnchor>
          <NavAnchor href="#about">About</NavAnchor>
          {hasReviews ? <NavAnchor href="#reviews">Reviews</NavAnchor> : null}
          <NavAnchor href="#contact">Contact</NavAnchor>
        </nav>
        <a
          href={telHref}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold transition hover:-translate-y-0.5 md:px-4"
          style={{
            background: "var(--apex-primary)",
            color: "var(--apex-primary-fg)",
            borderRadius: "var(--apex-radius-md)",
            fontFamily: "var(--apex-font-display)",
          }}
        >
          <Phone className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{contact.phone}</span>
          <span className="sr-only sm:hidden">Call {contact.phone}</span>
        </a>
      </div>
    </header>
  )
}

function NavAnchor({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-sm font-semibold transition-opacity hover:opacity-70"
      style={{ color: "var(--apex-fg)" }}
    >
      {children}
    </a>
  )
}

function stripPhoneFormatting(phone: string): string {
  return phone.replace(/[^\d+]/g, "")
}
