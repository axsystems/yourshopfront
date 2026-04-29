import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Lightweight chrome for non-themed utility pages (/pricing, /contact).
 * Themed pages (/, /demos, /portfolio/[slug]) use ThemedHome which has
 * its own themed nav + footer.
 */
export function SiteShellHeader({ backHref, backLabel }: { backHref?: string; backLabel?: string }) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-tight text-neutral-900 hover:opacity-80">
          <span className="grid h-8 w-8 place-items-center rounded bg-neutral-900 text-sm font-black text-white">
            A
          </span>
          Apex Sites
        </Link>
        <nav className="flex items-center gap-5 text-sm font-semibold text-neutral-700">
          {backHref && (
            <Link href={backHref} className="inline-flex items-center gap-1 hover:text-neutral-900">
              <ArrowLeft className="h-3.5 w-3.5" />
              {backLabel ?? "Back"}
            </Link>
          )}
          <Link href="/portfolio" className="hover:text-neutral-900">
            Portfolio
          </Link>
          <Link href="/pricing" className="hover:text-neutral-900">
            Pricing
          </Link>
          <Link
            href="/contact"
            className="hidden rounded-full bg-neutral-900 px-4 py-1.5 text-white hover:bg-neutral-800 sm:inline-flex"
          >
            Talk to us
          </Link>
        </nav>
      </div>
    </header>
  )
}

export function SiteShellFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t border-neutral-200 bg-white", className)}>
      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-3 px-6 py-8 text-xs text-neutral-500 sm:flex-row sm:items-center md:px-10">
        <p>© {new Date().getFullYear()} Apex Sites. All rights reserved.</p>
        <p className="font-mono uppercase tracking-[0.06em]">hello@apexsites.com</p>
      </div>
    </footer>
  )
}
