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
 * Rendered by `<ThemedHome>` only when `isDemoPreview` is true. Hidden on
 * `md+` because desktop viewers see the Hero + FinalCTA CTAs without
 * scrolling far. Mobile-first because that's where ad traffic lands.
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
      {/* Single-line layout (was 2-line "Like this design? + Cancel anytime"
          but the reassurance line pushed total bar height past iPhone home-
          indicator clearance on some themes — content overlapped the bar.
          Reassurance copy lives on the destination /checkout page now. */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <p
          className="min-w-0 flex-1 truncate text-sm font-semibold"
          style={{ color: "var(--apex-fg)" }}
        >
          Like this design?
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
