import Link from "next/link"

/**
 * Trade picker for the /start promo landing page.
 *
 * Every CTA on /start used to point at /portfolio, making the path to
 * payment `/start -> /portfolio -> browse 30 themes -> open one ->
 * /checkout`. Measured 2026-07-31: 14 real visitors reached /start and 3
 * reached /checkout. This cuts that to two clicks while preserving the
 * reason /portfolio was there in the first place — the CTA used to
 * hard-attach `demo=premium-trade`, so a painter reached checkout under a
 * plumbing brand. Picking the trade first means nobody lands on another
 * trade's business name.
 *
 * Slugs mirror ~/leads/trade-demo-map.json, the same mapping the outreach
 * list is built from, so a prospect DM'd about a trade sees that trade.
 */
const TRADES: ReadonlyArray<{ label: string; slug: string }> = [
  { label: "Plumbing", slug: "ironside-plumbing" },
  { label: "Electrical", slug: "voltcraft-electric" },
  { label: "HVAC", slug: "mesa-hvac" },
  { label: "Roofing", slug: "summit-roofing" },
  { label: "Painting", slug: "heritage-painters" },
  { label: "Cleaning", slug: "brightside-cleaning" },
  { label: "Landscaping", slug: "greenwise-lawn" },
  { label: "Moving", slug: "bellhorn-movers" },
]

function checkoutHref(slug: string): string {
  return `/checkout?tier=subscription&promo=launch&demo=${slug}`
}

export function TradePicker() {
  return (
    <div>
      <p className="text-center font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-apx-mute">
        Pick your trade to start
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TRADES.map((trade) => (
          <li key={trade.slug}>
            <Link
              href={checkoutHref(trade.slug)}
              className="flex h-full items-center justify-center rounded-xl border border-apx-line bg-apx-paper px-3 py-3 text-center text-sm font-semibold text-apx-ink transition-colors hover:border-apx-primary hover:text-apx-primary"
            >
              {trade.label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-center text-sm text-apx-mute">
        Not listed?{" "}
        <Link href="/portfolio" className="font-semibold text-apx-primary underline underline-offset-4">
          Browse all 30 designs
        </Link>
      </p>
    </div>
  )
}
