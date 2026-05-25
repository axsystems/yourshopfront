import { Clock, Code2, RefreshCcw, ShieldCheck } from "lucide-react"

/**
 * Chrome-styled trust strip between the FinalCTA and the SiteFooter on
 * `/demos/[slug]`. Catches prospects who scrolled past FinalCTA without
 * clicking the CTA — typically the "what if I don't like it?" hesitators.
 *
 * Deliberately uses Your Shopfront chrome tokens (`apx-paper`, `apx-ink`,
 * `apx-mute`) NOT the active theme's color tokens — the strip reads as
 * Your Shopfront's reassurance, not the imagined business's. This keeps
 * the immersive demo body unchanged and adds a single clearly-chrome
 * surface right before the footer, where the prospect's eye naturally
 * lands after scrolling.
 *
 * Rendered by `<ThemedHome>` only when `isDemoPreview` is true. No CTA
 * button — the MobileStickyCta handles persistent action on mobile and
 * the FinalCTA + Hero already carry CTAs on desktop.
 */
export function DemoBuyGuarantees() {
  return (
    <section
      className="border-t border-apx-line bg-apx-paper py-10"
      aria-label="Your Shopfront buyer guarantees"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <p className="mb-6 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-apx-mute">
          From Your Shopfront
        </p>
        <ul className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          <GuaranteeItem
            icon={<Clock className="h-5 w-5" strokeWidth={2.25} />}
            label="Live in 24 hours"
            sub="From content receipt"
          />
          <GuaranteeItem
            icon={<RefreshCcw className="h-5 w-5" strokeWidth={2.25} />}
            label="Cancel anytime"
            sub="One click, no calls"
          />
          <GuaranteeItem
            icon={<ShieldCheck className="h-5 w-5" strokeWidth={2.25} />}
            label="30-day money-back"
            sub="On the setup fee"
          />
          <GuaranteeItem
            icon={<Code2 className="h-5 w-5" strokeWidth={2.25} />}
            label="Own your code"
            sub="One-time tier includes source"
          />
        </ul>
      </div>
    </section>
  )
}

function GuaranteeItem({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode
  label: string
  sub: string
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden
        className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-apx-tint text-apx-ink"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold leading-tight text-apx-ink">{label}</p>
        <p className="mt-1 text-xs leading-tight text-apx-mute">{sub}</p>
      </div>
    </li>
  )
}
