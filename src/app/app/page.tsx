import Link from "next/link"

import { requireAuth } from "@/lib/auth"
import { ExternalLink } from "lucide-react"

import { supabase, type Site } from "@/lib/supabase"
import { Button } from "@/components/apex/button"
import { StatusPill } from "./components/status-pill"
import { SiteCard } from "./components/site-card"
import { CopyUrlButton } from "./components/copy-url-button"

// No caching — dashboard reflects live state
export const dynamic = "force-dynamic"

async function getSitesByCustomer(customerId: string): Promise<Site[]> {
  const { data, error } = await supabase()
    .from("sites")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data as Site[] | null) ?? []
}

export default async function DashboardHomePage() {
  const { customer } = await requireAuth()

  let sites: Site[] = []
  try {
    sites = await getSitesByCustomer(customer.id)
  } catch (err) {
    console.error("[dashboard/home] supabase lookup failed", err)
    return <ErrorState />
  }

  if (sites.length === 0) {
    return <NoSiteState />
  }

  if (sites.length === 1) {
    return <SingleSiteView site={sites[0]} />
  }

  return <MultiSiteView sites={sites} />
}

// ---------------------------------------------------------------------------
// Single-site view (default case)
// ---------------------------------------------------------------------------

function SingleSiteView({ site }: { site: Site }) {
  const isLive = site.status === "live" && site.live_url

  return (
    <div className="mx-auto max-w-2xl">
      {/* Status pill — highest signal element, visible above the fold */}
      <StatusPill status={site.status} />

      {/* Business name */}
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-apx-ink md:text-3xl">
        {site.business_name}
      </h1>

      {/* Live URL */}
      {isLive && site.live_url ? (
        <div className="mt-3 flex items-center gap-2">
          <a
            href={site.live_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-apx-mute underline-offset-2 hover:text-apx-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apx-primary focus-visible:ring-offset-2 rounded"
          >
            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" aria-hidden />
            <span className="truncate">{site.live_url.replace(/^https?:\/\//, "")}</span>
          </a>
          <CopyUrlButton url={site.live_url} />
        </div>
      ) : null}

      {/* Primary CTA */}
      <div className="mt-8">
        <Button href="/app/edit-requests/new" variant="primary" size="md">
          Request an edit
        </Button>
      </div>

      {/* Divider */}
      <div className="mt-10 border-t border-apx-line" />

      {/* Recent edit requests */}
      <section aria-labelledby="edit-requests-heading" className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2
            id="edit-requests-heading"
            className="text-base font-bold text-apx-ink"
          >
            Recent edit requests
          </h2>
          <Link
            href="/app/edit-requests"
            className="text-sm font-medium text-apx-mute underline-offset-2 hover:text-apx-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apx-primary focus-visible:ring-offset-2 rounded"
          >
            View all
          </Link>
        </div>

        {/* STREAM-C-DEPENDENCY: replace with real edit request list once the
            edit-requests data layer ships. The empty state below is the MVP. */}
        <EditRequestsEmptyState />
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Multi-site view
// ---------------------------------------------------------------------------

function MultiSiteView({ sites }: { sites: Site[] }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-apx-ink md:text-3xl">
        Your sites
      </h1>
      <p className="mt-1 text-sm text-apx-mute">
        {sites.length} site{sites.length === 1 ? "" : "s"} in your account
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sites.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty / error states
// ---------------------------------------------------------------------------

function EditRequestsEmptyState() {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-apx-line bg-apx-tint px-6 py-8 text-center">
      <p className="text-sm font-medium text-apx-mute">No edit requests yet</p>
      <p className="mt-1 text-xs text-apx-soft">
        When you submit a change request, it will appear here.
      </p>
      <div className="mt-4">
        <Button href="/app/edit-requests/new" variant="secondary" size="sm">
          Make your first request
        </Button>
      </div>
    </div>
  )
}

function NoSiteState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-xl font-bold text-apx-ink">No site found</h1>
      <p className="mt-2 max-w-xs text-sm text-apx-mute">
        We couldn&apos;t find a site linked to your account. If you just purchased,
        your account may still be setting up — check back in a moment.
      </p>
      <div className="mt-6">
        <Button href="mailto:hello@yourshopfront.com" variant="secondary" size="sm">
          Contact support
        </Button>
      </div>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-xl font-bold text-apx-ink">Something went wrong</h1>
      <p className="mt-2 max-w-xs text-sm text-apx-mute">
        We couldn&apos;t load your site data. Your account is safe — this is a
        display issue. Refresh in a moment, or contact us if it persists.
      </p>
      <div className="mt-6">
        <Button href="mailto:hello@yourshopfront.com" variant="secondary" size="sm">
          Contact support
        </Button>
      </div>
    </div>
  )
}
