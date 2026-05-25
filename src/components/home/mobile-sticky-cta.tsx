import type { Theme } from "@/lib/themes/types"
import { ApexButton } from "./primitives"

interface MobileStickyCtaProps {
  theme: Theme
  ctaHref: string
}

/**
 * Fixed-bottom mobile CTA bar. Persistent conversion surface for ad-traffic
 * prospects on `/demos/[slug]` — the highest-leverage mobile conversion
 * lever. Hero + FinalCTA already carry the action above- and below-fold
 * respectively; this bar fills the middle of the scroll where no CTA is
 * visible.
 *
 * Single variant: "From $99 · cancel anytime" + buy CTA. Same across all 30
 * themes. (The prior emergency-theme phone-icon variant was removed —
 * Your Shopfront's purchase + onboarding is fully online; surfacing
 * "24/7 calls" chrome implied the prospect needed phone infrastructure
 * to buy, which was off-message.)
 *
 * Bottom inset uses `env(safe-area-inset-bottom)` so the button clears the
 * iOS home indicator on notched devices.
 */
export function MobileStickyCta({ theme, ctaHref }: MobileStickyCtaProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t md:hidden"
      style={{
        background: "var(--apex-bg)",
        borderColor: "var(--apex-border)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        boxShadow: "0 -8px 24px -12px color-mix(in oklab, var(--apex-fg) 25%, transparent)",
      }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight">
          <span style={{ color: "var(--apex-fg)" }}>From $99</span>{" "}
          <span style={{ color: "var(--apex-muted-fg)" }}>· cancel anytime</span>
        </p>
        <ApexButton
          theme={theme}
          variant="primary"
          size="sm"
          asChildHref={ctaHref}
          className="flex-shrink-0 whitespace-nowrap"
        >
          Get this design →
        </ApexButton>
      </div>
    </div>
  )
}
