import "server-only"

import { timingSafeEqual } from "node:crypto"
import { headers } from "next/headers"

import type { Metadata } from "next"

import { getSiteById, type Site } from "@/lib/supabase"
import type { PartialSiteContent } from "@/lib/site-content/schema"
import { SITE_URL } from "@/lib/seo"

import { CopyReviewForm } from "./copy-review-form"

// =============================================================================
// /admin/copy-review/[siteId]
// =============================================================================
// Operator-only page. Renders the discovery answers next to the AI-drafted
// copy, with inline edit fields. Auth model copied verbatim from
// /api/provisioning/approve — ADMIN_PASSWORD bearer via either the
// Authorization header or a ?token=… query param (so it can be opened
// directly in a browser tab without curl).
//
// MUST be wrapped in noindex; the route is gated by ADMIN_PASSWORD but we
// don't want it surfaced to search engines under any circumstances.
// =============================================================================

interface PageProps {
  params: Promise<{ siteId: string }>
  searchParams: Promise<{ token?: string }>
}

export const metadata: Metadata = {
  title: "Copy review — admin",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/admin/copy-review` },
}

export const dynamic = "force-dynamic"

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return timingSafeEqual(aBuf, bBuf)
}

async function checkAdminAuth(token: string | undefined): Promise<
  | { ok: true }
  | { ok: false; reason: "not_configured" | "missing" | "invalid" }
> {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return { ok: false, reason: "not_configured" }

  // Header form: "Authorization: Bearer <password>"
  const hdrs = await headers()
  const authHeader = hdrs.get("authorization") ?? ""
  if (authHeader && safeEqual(authHeader, `Bearer ${expected}`)) {
    return { ok: true }
  }

  // Query form: ?token=<password> — convenient for opening in a browser
  // tab. Same timing-safe compare.
  if (token && safeEqual(token, expected)) {
    return { ok: true }
  }

  if (!authHeader && !token) return { ok: false, reason: "missing" }
  return { ok: false, reason: "invalid" }
}

export default async function CopyReviewPage({ params, searchParams }: PageProps) {
  // Next.js 16: params + searchParams are Promises — must await.
  const { siteId } = await params
  const { token } = await searchParams

  const auth = await checkAdminAuth(token)
  if (!auth.ok) {
    return <AdminGate reason={auth.reason} />
  }

  let site: Site | null = null
  try {
    site = await getSiteById(siteId)
  } catch (err) {
    console.error("[copy-review] supabase lookup failed", err)
    return <AdminMessage title="Database error" body="Could not load site." />
  }
  if (!site) {
    return <AdminMessage title="Not found" body={`No site with id ${siteId}.`} />
  }

  const draft: PartialSiteContent =
    site.ai_copy_draft?.operatorEdits ??
    site.ai_copy_draft?.content ??
    {}
  const attemptCount = site.ai_copy_draft?.attemptCount ?? 0
  const operatorAlreadyApproved = Boolean(site.ai_copy_draft?.operatorApprovedAt)
  const customerAlreadyApproved = Boolean(site.ai_copy_draft?.customerApprovedAt)

  return (
    <main className="mx-auto min-h-screen max-w-[1280px] bg-white px-6 py-10 text-slate-900 md:px-10">
      <header className="border-b border-slate-200 pb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Operator · Copy Review
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          {site.business_name}
        </h1>
        <dl className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-slate-600 md:grid-cols-4">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Status</dt>
            <dd className="font-mono text-slate-900">{site.status}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Industry</dt>
            <dd className="text-slate-900">{site.industry ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Demo</dt>
            <dd className="font-mono text-slate-900">{site.demo_slug}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Attempts</dt>
            <dd className="text-slate-900">{attemptCount} / 3</dd>
          </div>
        </dl>
        {(operatorAlreadyApproved || customerAlreadyApproved) && (
          <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {customerAlreadyApproved
              ? "Customer has already approved this draft. Re-sending will overwrite their approval."
              : "Operator has already approved this draft and emailed the customer. Re-submit only if changes are needed."}
          </div>
        )}
      </header>

      <div className="grid gap-8 pt-8 md:grid-cols-[minmax(0,320px),1fr]">
        <DiscoveryColumn site={site} />
        <CopyReviewForm
          siteId={site.id}
          token={token ?? ""}
          initialDraft={draft}
          attemptCount={attemptCount}
        />
      </div>
    </main>
  )
}

function DiscoveryColumn({ site }: { site: Site }) {
  const answers = site.discovery_answers ?? {}
  const entries = Object.entries(answers).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  )
  return (
    <aside className="rounded-lg border border-slate-200 bg-slate-50 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Discovery answers
      </h2>
      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">
          No discovery answers on file. The customer may not have completed
          the questionnaire yet.
        </p>
      ) : (
        <dl className="mt-4 space-y-4 text-sm">
          {entries.map(([key, value]) => (
            <div key={key}>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {humanizeKey(key)}
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-slate-900">
                {Array.isArray(value) ? value.join(", ") : String(value ?? "")}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </aside>
  )
}

function humanizeKey(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function AdminGate({ reason }: { reason: "not_configured" | "missing" | "invalid" }) {
  const message =
    reason === "not_configured"
      ? "Admin endpoint not configured."
      : reason === "missing"
        ? "Missing admin credentials. Add ?token=<ADMIN_PASSWORD> to the URL or send an Authorization: Bearer header."
        : "Invalid admin credentials."
  return <AdminMessage title="Unauthorized" body={message} />
}

function AdminMessage({ title, body }: { title: string; body: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center justify-center bg-white px-6 text-slate-900">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm text-slate-600">{body}</p>
      </div>
    </main>
  )
}
