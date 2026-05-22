import Link from "next/link"
import { ExternalLink } from "lucide-react"

import type { Site } from "@/lib/supabase"
import { StatusPill } from "./status-pill"
import { CopyUrlButton } from "./copy-url-button"

interface SiteCardProps {
  site: Site
}

/** Returns a human-readable relative time string (e.g. "3 days ago"). */
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 2) return "just now"
  if (minutes < 60) return `${minutes} minutes ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`
  const months = Math.floor(days / 30)
  return `${months} month${months === 1 ? "" : "s"} ago`
}

/**
 * Compact site card for the multi-site grid. Uses the "pseudo-link" pattern:
 * the card container is a <div> with a relative-positioned <Link> stretched
 * to fill, and any secondary interactive elements (external URL, copy button)
 * sit above it via `relative z-10`. This avoids nested <a> tags which are
 * invalid HTML and break screen readers.
 */
export function SiteCard({ site }: SiteCardProps) {
  // MVP: cards link to /app with a siteId param until per-site detail pages ship
  const href = `/app?siteId=${site.id}`
  const isLive = site.status === "live" && site.live_url

  return (
    <div className="group relative flex flex-col gap-3 rounded-2xl border border-apx-line bg-apx-paper p-5 transition-shadow hover:shadow-md">
      {/* Full-card link (stretched absolutely behind secondary elements) */}
      <Link
        href={href}
        aria-label={`View ${site.business_name}`}
        className="absolute inset-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apx-primary focus-visible:ring-offset-2"
      />

      {/* Status row */}
      <div className="flex items-center justify-between gap-2">
        <StatusPill status={site.status} />
        <span className="text-xs text-apx-soft">{relativeTime(site.updated_at)}</span>
      </div>

      {/* Business name */}
      <h2 className="text-base font-bold leading-tight text-apx-ink transition-colors group-hover:text-apx-primary">
        {site.business_name}
      </h2>

      {/* Live URL — sits above the card link via relative + z-10 */}
      {isLive && site.live_url ? (
        <div className="relative z-10 flex items-center gap-1">
          <a
            href={site.live_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 truncate text-xs font-medium text-apx-mute underline-offset-2 hover:text-apx-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apx-primary focus-visible:ring-offset-1 rounded"
            aria-label={`Visit ${site.business_name} website (opens in new tab)`}
          >
            <ExternalLink className="h-3 w-3 flex-shrink-0" aria-hidden />
            <span className="truncate">{site.live_url.replace(/^https?:\/\//, "")}</span>
          </a>
          <CopyUrlButton url={site.live_url} />
        </div>
      ) : null}
    </div>
  )
}
