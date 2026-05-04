import * as React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "./button"
import { Container } from "./container"
import { Logo } from "./logo"
import { NavLink } from "./nav-link"
import { cn } from "@/lib/utils"

type Variant = "default" | "themed" | "minimal"

interface SiteHeaderProps {
  variant?: Variant
  /** For variant="minimal" only — back link target + label. */
  backHref?: string
  backLabel?: string
  className?: string
}

/**
 * Unified Apex chrome header. Three variants:
 *   - default : on /, /pricing, /portfolio, /contact, /about, legal pages.
 *   - themed  : inside <ThemedHome> (i.e. /demos/[slug] and /portfolio/[slug])
 *               where it must color itself in theme tokens but keep Apex layout.
 *   - minimal : on /checkout, /onboarding (logo + back link only, no nav).
 *
 * Includes a skip-to-content link as the first focusable element.
 */
export function SiteHeader({
  variant = "default",
  backHref,
  backLabel,
  className,
}: SiteHeaderProps) {
  const themed = variant === "themed"
  return (
    <header
      className={cn(
        "relative z-30 border-b",
        themed
          ? "border-[var(--apex-border)] bg-[var(--apex-bg)] text-[var(--apex-fg)]"
          : "border-apx-line bg-apx-paper text-apx-ink",
        className
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-apx-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-apx-primary-fg"
      >
        Skip to content
      </a>
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 md:h-20">
          <Logo size="md" />
          {variant === "default" ? <DefaultNav /> : null}
          {variant === "themed" ? <ThemedNav /> : null}
          {variant === "minimal" ? (
            <MinimalNav backHref={backHref} backLabel={backLabel} />
          ) : null}
        </div>
      </Container>
    </header>
  )
}

function DefaultNav() {
  return (
    <nav
      aria-label="Primary"
      className="flex items-center gap-6 md:gap-8"
    >
      <div className="hidden items-center gap-6 md:flex">
        <NavLink href="/portfolio" exact={false}>
          Portfolio
        </NavLink>
        <NavLink href="/pricing">Pricing</NavLink>
        <NavLink href="/about">About</NavLink>
      </div>
      <Button href="/portfolio" variant="primary" size="sm">
        Pick a style →
      </Button>
    </nav>
  )
}

function ThemedNav() {
  return (
    <nav
      aria-label="Primary"
      className="flex items-center gap-4 md:gap-6"
    >
      <Link
        href="/portfolio"
        className="hidden text-sm font-semibold transition-colors hover:opacity-70 md:inline"
        style={{ color: "var(--apex-fg)" }}
      >
        Portfolio
      </Link>
      <Link
        href="/pricing"
        className="hidden text-sm font-semibold transition-colors hover:opacity-70 md:inline"
        style={{ color: "var(--apex-fg)" }}
      >
        Pricing
      </Link>
      <Link
        href="/"
        className="rounded-full px-4 py-2 text-sm font-semibold transition-transform hover:-translate-y-px"
        style={{
          background: "var(--apex-primary)",
          color: "var(--apex-primary-fg)",
        }}
      >
        Apex Sites home →
      </Link>
    </nav>
  )
}

function MinimalNav({
  backHref,
  backLabel,
}: {
  backHref?: string
  backLabel?: string
}) {
  return (
    <nav aria-label="Page" className="flex items-center gap-4">
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-semibold text-apx-mute transition-colors hover:text-apx-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          {backLabel ?? "Back"}
        </Link>
      ) : null}
      <a
        href="mailto:hello@apexsites.com"
        className="text-sm font-semibold text-apx-mute transition-colors hover:text-apx-ink"
      >
        hello@apexsites.com
      </a>
    </nav>
  )
}
