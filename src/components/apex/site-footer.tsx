import * as React from "react"
import Link from "next/link"

import { Container } from "./container"
import { Logo } from "./logo"
import { cn } from "@/lib/utils"

type Variant = "default" | "themed" | "minimal"

interface SiteFooterProps {
  variant?: Variant
  className?: string
}

interface FooterLink {
  label: string
  href: string
}

const PRODUCT: FooterLink[] = [
  { label: "Portfolio", href: "/portfolio" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
]

const COMPANY: FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "Email us", href: "mailto:hello@apexsites.com" },
  { label: "Marketing → Axon Growth", href: "https://axongrowth.ai/?ref=apexsites" },
]

const LEGAL: FooterLink[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Refund policy", href: "/refund-policy" },
]

/**
 * Unified Apex chrome footer. Same three variants as SiteHeader.
 *
 *   - default : full 4-column footer on Apex chrome pages.
 *   - themed  : same layout but colored in --apex-* (theme) tokens.
 *   - minimal : single-line footer on /checkout, /onboarding.
 */
export function SiteFooter({ variant = "default", className }: SiteFooterProps) {
  if (variant === "minimal") return <MinimalFooter className={className} />
  return (
    <FullFooter themed={variant === "themed"} className={className} />
  )
}

function FullFooter({ themed, className }: { themed: boolean; className?: string }) {
  return (
    <footer
      className={cn(
        "border-t",
        themed
          ? "border-[var(--apex-border)] bg-[var(--apex-bg)] text-[var(--apex-fg)]"
          : "border-apx-line bg-apx-paper text-apx-ink",
        className
      )}
    >
      <Container className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:py-20">
        <div className="flex flex-col gap-4">
          <Logo size="md" />
          <p
            className={cn(
              "max-w-sm text-[14px] leading-[1.55]",
              themed ? "" : "text-apx-mute"
            )}
            style={themed ? { color: "var(--apex-muted-fg)" } : undefined}
          >
            Websites that book more jobs. Live in 24 hours.
          </p>
          <p
            className={cn(
              "font-mono text-[12px] uppercase tracking-[0.06em]",
              themed ? "" : "text-apx-mute"
            )}
            style={themed ? { color: "var(--apex-muted-fg)" } : undefined}
          >
            hello@apexsites.com
          </p>
        </div>
        <FooterColumn heading="Product" links={PRODUCT} themed={themed} />
        <FooterColumn heading="Company" links={COMPANY} themed={themed} />
        <FooterColumn heading="Legal" links={LEGAL} themed={themed} />
      </Container>
      <div
        className={cn(
          "border-t",
          themed ? "border-[var(--apex-border)]" : "border-apx-line"
        )}
      >
        <Container className="flex flex-col items-start justify-between gap-3 py-6 text-[12px] sm:flex-row sm:items-center">
          <p className={themed ? "" : "text-apx-mute"} style={themed ? { color: "var(--apex-muted-fg)" } : undefined}>
            © {new Date().getFullYear()} Apex Sites. All rights reserved.
          </p>
          <p
            className={cn("font-mono uppercase tracking-[0.06em]", themed ? "" : "text-apx-mute")}
            style={themed ? { color: "var(--apex-muted-fg)" } : undefined}
          >
            Built with Next.js · Hosted on Vercel
          </p>
        </Container>
      </div>
    </footer>
  )
}

function MinimalFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t border-apx-line bg-apx-paper", className)}>
      <Container className="flex flex-col items-start justify-between gap-2 py-6 text-[12px] text-apx-mute sm:flex-row sm:items-center">
        <p>© {new Date().getFullYear()} Apex Sites. All rights reserved.</p>
        <p className="font-mono uppercase tracking-[0.06em]">hello@apexsites.com</p>
      </Container>
    </footer>
  )
}

function FooterColumn({
  heading,
  links,
  themed,
}: {
  heading: string
  links: FooterLink[]
  themed: boolean
}) {
  return (
    <div>
      <p
        className={cn(
          "font-mono text-[11px] font-semibold uppercase tracking-[0.16em]",
          themed ? "" : "text-apx-mute"
        )}
        style={themed ? { color: "var(--apex-muted-fg)" } : undefined}
      >
        {heading}
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {links.map((l) => {
          const isExternal = l.href.startsWith("mailto:") || l.href.startsWith("http")
          const cls = cn(
            "text-[14px] transition-colors",
            themed ? "" : "text-apx-ink hover:text-apx-primary"
          )
          return (
            <li key={`${heading}-${l.label}`}>
              {isExternal ? (
                <a
                  href={l.href}
                  className={cls}
                  style={themed ? { color: "var(--apex-fg)" } : undefined}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  href={l.href}
                  className={cls}
                  style={themed ? { color: "var(--apex-fg)" } : undefined}
                >
                  {l.label}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
