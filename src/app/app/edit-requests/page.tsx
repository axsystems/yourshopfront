import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/apex"
import {
  listEditRequestsForCustomer,
  type EditRequest,
  type EditRequestStatus,
} from "@/lib/edit-requests"

// STREAM-A-DEPENDENCY: replace with real @/lib/auth import after merge
async function requireAuth(): Promise<StubAuthReturn> {
  const { redirect } = await import("next/navigation")
  redirect("/login")
  throw new Error("unreachable")
}
type StubAuthReturn = {
  user: { id: string; email: string }
  customer: {
    id: string
    auth_user_id: string | null
    email: string
    name: string
  }
}

export const metadata: Metadata = {
  title: "Edit requests",
  description: "Request changes to your site copy, photos, and content.",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

type FilterKey = "open" | "in_progress" | "done" | "all"

interface PageProps {
  searchParams: Promise<{ filter?: string }>
}

const STATUS_LABEL: Record<EditRequestStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  done: "Done",
}

const PRIORITY_DOT: Record<EditRequest["priority"], string> = {
  low: "bg-slate-400",
  normal: "bg-blue-500",
  urgent: "bg-red-500",
}

export default async function EditRequestsPage({ searchParams }: PageProps) {
  const { customer } = await requireAuth()
  const { filter: rawFilter } = await searchParams
  const filter = normalizeFilter(rawFilter)

  let requests: EditRequest[] = []
  let loadError: string | null = null
  try {
    requests = await listEditRequestsForCustomer(customer.id)
  } catch (err) {
    console.error("[app/edit-requests] list failed", err)
    loadError = "Could not load your edit requests."
  }

  const filtered =
    filter === "all" ? requests : requests.filter((r) => r.status === filter)

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-apx-ink">
            Edit requests
          </h1>
          <p className="mt-1 text-sm text-apx-mute">
            Tell us what to change. We&apos;ll update your site within one
            business day.
          </p>
        </div>
        <Button href="/app/edit-requests/new" size="md">
          New request
        </Button>
      </header>

      <nav className="mt-8 flex flex-wrap gap-2 border-b border-apx-line">
        {(["open", "in_progress", "done", "all"] as const).map((key) => (
          <FilterTab key={key} target={key} active={filter === key} />
        ))}
      </nav>

      {loadError ? (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-apx-danger/40 bg-apx-danger/5 p-4 text-sm text-apx-danger"
        >
          {loadError}
        </p>
      ) : filtered.length === 0 ? (
        <EmptyState totalCount={requests.length} />
      ) : (
        <ul className="mt-6 space-y-3">
          {filtered.map((req) => (
            <li key={req.id}>
              <Link
                href={`/app/edit-requests/${req.id}`}
                className="block rounded-xl border border-apx-line bg-apx-elev p-5 transition hover:border-apx-ink/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-apx-mute">
                      <span
                        aria-hidden
                        className={`inline-block h-2 w-2 rounded-full ${PRIORITY_DOT[req.priority]}`}
                      />
                      <span>{req.section.replace("_", " ")}</span>
                      <span aria-hidden>·</span>
                      <span>{STATUS_LABEL[req.status]}</span>
                      {req.comments.length > 0 ? (
                        <>
                          <span aria-hidden>·</span>
                          <span>
                            {req.comments.length} comment
                            {req.comments.length === 1 ? "" : "s"}
                          </span>
                        </>
                      ) : null}
                    </div>
                    <p className="mt-2 line-clamp-2 text-[15px] text-apx-ink">
                      {req.description}
                    </p>
                  </div>
                  <time
                    dateTime={req.created_at}
                    className="shrink-0 text-[12px] text-apx-mute"
                  >
                    {formatDate(req.created_at)}
                  </time>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

function FilterTab({
  target,
  active,
}: {
  target: FilterKey
  active: boolean
}) {
  const label =
    target === "open"
      ? "Open"
      : target === "in_progress"
        ? "In progress"
        : target === "done"
          ? "Done"
          : "All"
  const href =
    target === "open" ? "/app/edit-requests" : `/app/edit-requests?filter=${target}`
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "-mb-px border-b-2 border-apx-primary px-3 py-2 text-sm font-semibold text-apx-ink"
          : "-mb-px border-b-2 border-transparent px-3 py-2 text-sm text-apx-mute hover:text-apx-ink"
      }
    >
      {label}
    </Link>
  )
}

function EmptyState({ totalCount }: { totalCount: number }) {
  if (totalCount === 0) {
    return (
      <div className="mt-10 rounded-xl border border-dashed border-apx-line p-10 text-center">
        <p className="text-[15px] text-apx-ink">No edit requests yet.</p>
        <p className="mt-1 text-sm text-apx-mute">
          Need a tweak to your site? Open one and we&apos;ll handle it.
        </p>
        <div className="mt-5">
          <Button href="/app/edit-requests/new">Request your first edit</Button>
        </div>
      </div>
    )
  }
  return (
    <p className="mt-10 text-center text-sm text-apx-mute">
      No requests in this view. Try the{" "}
      <Link
        href="/app/edit-requests"
        className="font-semibold text-apx-ink underline underline-offset-2"
      >
        Open
      </Link>{" "}
      tab or{" "}
      <Link
        href="/app/edit-requests?filter=all"
        className="font-semibold text-apx-ink underline underline-offset-2"
      >
        All
      </Link>
      .
    </p>
  )
}

function normalizeFilter(raw: string | undefined): FilterKey {
  if (raw === "in_progress" || raw === "done" || raw === "all") return raw
  return "open"
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
  } catch {
    return ""
  }
}
