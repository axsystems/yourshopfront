import type { Metadata } from "next"
import Link from "next/link"

import { requireAuth } from "@/lib/auth"
import { listSitesForCustomer, type Site } from "@/lib/supabase"

import { NewEditRequestForm } from "./new-edit-request-form"

export const metadata: Metadata = {
  title: "New edit request",
  description: "Request a change to your site.",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function NewEditRequestPage() {
  const { customer } = await requireAuth()

  let sites: Site[] = []
  let loadError: string | null = null
  try {
    sites = await listSitesForCustomer(customer.id)
  } catch (err) {
    console.error("[app/edit-requests/new] sites lookup failed", err)
    loadError = "Could not load your sites."
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link
        href="/app/edit-requests"
        className="text-sm text-apx-mute hover:text-apx-ink"
      >
        ← All requests
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-apx-ink">
        New edit request
      </h1>
      <p className="mt-1 text-sm text-apx-mute">
        Tell us what to change. Attach reference photos if it helps.
      </p>

      {loadError ? (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-apx-danger/40 bg-apx-danger/5 p-4 text-sm text-apx-danger"
        >
          {loadError}
        </p>
      ) : sites.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-apx-line p-8 text-center text-sm text-apx-mute">
          You don&apos;t have any sites yet. Once your first site is purchased,
          you&apos;ll be able to request edits from this page.
        </p>
      ) : (
        <div className="mt-8">
          <NewEditRequestForm
            sites={sites.map((s) => ({
              id: s.id,
              business_name: s.business_name,
            }))}
          />
        </div>
      )}
    </main>
  )
}
