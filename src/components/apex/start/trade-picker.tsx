import Image from "next/image"
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
 * Each tile carries a real screenshot of the demo it buys, captured by
 * `scripts/generate-demo-previews.mjs` into `public/start/previews/`. The
 * same audit found /start showed no picture of an actual website anywhere
 * above the fold, which is the one thing a prospect is here to judge.
 *
 * Slugs mirror ~/leads/trade-demo-map.json, the same mapping the outreach
 * list is built from, so a prospect DM'd about a trade sees that trade.
 */
interface Trade {
  label: string
  slug: string
  /** Demo business the slug renders as — shown under the trade label. */
  business: string
  /**
   * Set only when the demo's screenshot is not shippable, in which case
   * the tile shows this instead. `heritage-painters` uses the `gallery`
   * hero, which renders CSS gradient placeholders rather than photos, so
   * half its capture is coloured rectangles. Its own hero photograph is
   * real imagery in the same card silhouette. Delete this field and
   * re-run the capture script once the gallery hero has real photos.
   */
  fallbackImage?: { url: string; alt: string }
}

const TRADES: ReadonlyArray<Trade> = [
  { label: "Plumbing", slug: "ironside-plumbing", business: "Ironside Plumbing" },
  { label: "Electrical", slug: "voltcraft-electric", business: "Voltcraft Electric" },
  { label: "HVAC", slug: "mesa-hvac", business: "Mesa HVAC" },
  { label: "Roofing", slug: "summit-roofing", business: "Summit Roofing" },
  {
    label: "Painting",
    slug: "heritage-painters",
    business: "Heritage Painters",
    fallbackImage: {
      url: "/themes/heritage-painters/hero.jpg",
      alt: "Painter using a roller on an interior wall in warm afternoon light",
    },
  },
  { label: "Cleaning", slug: "brightside-cleaning", business: "Brightside Cleaning" },
  { label: "Landscaping", slug: "greenwise-lawn", business: "Greenwise Lawn" },
  { label: "Moving", slug: "bellhorn-movers", business: "Bellhorn Movers" },
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
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TRADES.map((trade) => (
          <li key={trade.slug}>
            <Link
              href={checkoutHref(trade.slug)}
              className="group block overflow-hidden rounded-xl border border-apx-line bg-apx-elev text-left outline-none transition-[border-color,transform] duration-150 ease-out hover:-translate-y-px hover:border-apx-primary focus-visible:ring-2 focus-visible:ring-apx-primary focus-visible:ring-offset-2 focus-visible:ring-offset-apx-paper active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
            >
              <span className="relative block aspect-[16/10] overflow-hidden bg-apx-tint">
                <Image
                  src={trade.fallbackImage?.url ?? `/start/previews/${trade.slug}.webp`}
                  alt={
                    trade.fallbackImage?.alt ??
                    `${trade.business} — ${trade.label.toLowerCase()} website design`
                  }
                  fill
                  sizes="(min-width: 640px) 22vw, 44vw"
                  className="object-cover object-top"
                />
              </span>
              <span className="block border-t border-apx-line px-3 py-2.5">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-[14px] font-semibold leading-tight text-apx-ink">
                    {trade.label}
                  </span>
                  <span
                    aria-hidden
                    className="flex-none font-mono text-[13px] leading-none text-apx-mute transition-colors duration-150 ease-out group-hover:text-apx-primary group-focus-visible:text-apx-primary"
                  >
                    →
                  </span>
                </span>
                <span className="mt-1 block truncate font-mono text-[10px] uppercase tracking-[0.06em] text-apx-mute">
                  {trade.business}
                </span>
              </span>
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
