import Link from "next/link"

interface MobileStickyCTAProps {
  href: string
  label: string
  subLabel?: string
}

/**
 * Fixed bottom bar on mobile only (hidden on md+). Shows a single primary
 * CTA with optional risk-reversal subLabel. Keeps 20px bottom clearance
 * via a companion <MobileStickySpacer> so page content isn't obscured.
 */
export function MobileStickyCTA({ href, label, subLabel }: MobileStickyCTAProps) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-apx-line bg-apx-paper px-4 py-3">
      <Link
        href={href}
        className="flex w-full items-center justify-center rounded-xl bg-apx-primary px-5 py-3.5 font-sans text-[15px] font-bold text-apx-primary-fg transition-opacity active:opacity-80"
      >
        {label}
      </Link>
      {subLabel ? (
        <p className="mt-1.5 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-apx-mute">
          {subLabel}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Spacer placed at the bottom of pages that use MobileStickyCTA so content
 * isn't hidden behind the bar on mobile. Renders nothing on md+.
 */
export function MobileStickySpacer() {
  return <div className="h-20 md:hidden" aria-hidden />
}
