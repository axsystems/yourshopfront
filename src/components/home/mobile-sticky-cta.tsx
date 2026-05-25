import { Phone } from "lucide-react"

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
 * Variants:
 *   - default — "From $99 · cancel anytime" + buy CTA. For recurring/project
 *     themes. Price is the #1 conversion lever; surfacing the launch promo
 *     here means prospects see it without clicking through to /checkout.
 *   - emergency — phone icon + "24/7 ready · $99 launch" + buy CTA. Picked
 *     when `theme.mode === "emergency"` (currently plumbing/HVAC/electric).
 *     Bundles the call-conversion mechanic with price prominence; the
 *     button still routes to /checkout so the actual conversion target is
 *     unchanged.
 *
 * Bottom inset uses `env(safe-area-inset-bottom)` so the button clears the
 * iOS home indicator on notched devices.
 */
export function MobileStickyCta({ theme, ctaHref }: MobileStickyCtaProps) {
  const isEmergency = theme.mode === "emergency"
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
        {isEmergency ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span
              aria-hidden
              className="flex h-7 w-7 flex-none items-center justify-center rounded-full"
              style={{
                background: "var(--apex-primary)",
                color: "var(--apex-primary-fg)",
              }}
            >
              <Phone className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            <p className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight">
              <span style={{ color: "var(--apex-fg)" }}>24/7 ready</span>{" "}
              <span style={{ color: "var(--apex-muted-fg)" }}>· from $99</span>
            </p>
          </div>
        ) : (
          <p className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight">
            <span style={{ color: "var(--apex-fg)" }}>From $99</span>{" "}
            <span style={{ color: "var(--apex-muted-fg)" }}>· cancel anytime</span>
          </p>
        )}
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
