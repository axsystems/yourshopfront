import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/apex"
import { requireAuth } from "@/lib/auth"
import {
  getEditRequestById,
  type EditRequest,
  type EditRequestStatus,
} from "@/lib/edit-requests"

import { AddCommentForm } from "./add-comment-form"

export const metadata: Metadata = {
  title: "Edit request",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

const STATUS_BANNER: Record<EditRequestStatus, { label: string; className: string }> = {
  open: {
    label: "Open — we'll start on this within one business day.",
    className: "border-blue-200 bg-blue-50 text-blue-900",
  },
  in_progress: {
    label: "In progress — we're actively working on this.",
    className: "border-amber-200 bg-amber-50 text-amber-900",
  },
  done: {
    label: "Done — changes are live on your site.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
}

export default async function EditRequestDetailPage({ params }: PageProps) {
  const { id } = await params
  const { customer } = await requireAuth()

  let request: EditRequest | null = null
  try {
    request = await getEditRequestById(id)
  } catch (err) {
    console.error("[app/edit-requests/detail] lookup failed", err)
  }

  // Defense in depth: even though RLS would block a SELECT for the wrong
  // customer, we use the service-role client here (which bypasses RLS),
  // so the ownership check must happen in code.
  if (!request || request.customer_id !== customer.id) {
    notFound()
  }

  const banner = STATUS_BANNER[request.status]

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link
        href="/app/edit-requests"
        className="text-sm text-apx-mute hover:text-apx-ink"
      >
        ← All requests
      </Link>

      <div
        role="status"
        className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${banner.className}`}
      >
        {banner.label}
      </div>

      <header className="mt-6">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-apx-mute">
          <span>{request.section.replace("_", " ")}</span>
          <span aria-hidden>·</span>
          <span>Priority: {request.priority}</span>
          <span aria-hidden>·</span>
          <time dateTime={request.created_at}>
            {formatDateTime(request.created_at)}
          </time>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-apx-ink">
          {humanSection(request.section)} change request
        </h1>
      </header>

      <section className="mt-6 rounded-xl border border-apx-line bg-apx-elev p-5">
        <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-apx-mute">
          Original request
        </h2>
        <p className="mt-2 whitespace-pre-wrap text-[15px] text-apx-ink">
          {request.description}
        </p>

        {request.attachments.length > 0 ? (
          <div className="mt-5">
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-apx-mute">
              Attachments ({request.attachments.length})
            </h3>
            <ul className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {request.attachments.map((url) => (
                <li key={url}>
                  <AttachmentTile url={url} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-apx-ink">Comments</h2>
        {request.comments.length === 0 ? (
          <p className="mt-2 text-sm text-apx-mute">
            No comments yet. Add a note below if you need to add detail or ask a
            question.
          </p>
        ) : (
          <ol className="mt-4 space-y-4">
            {[...request.comments]
              .sort((a, b) => a.created_at.localeCompare(b.created_at))
              .map((c) => (
                <li
                  key={c.id}
                  className="rounded-xl border border-apx-line bg-apx-paper p-4"
                >
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-apx-mute">
                    <span>{c.author_type === "customer" ? "You" : "Your Shopfront"}</span>
                    <span aria-hidden>·</span>
                    <time dateTime={c.created_at}>
                      {formatDateTime(c.created_at)}
                    </time>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-[15px] text-apx-ink">
                    {c.body}
                  </p>
                </li>
              ))}
          </ol>
        )}

        {request.status !== "done" ? (
          <div className="mt-6">
            <AddCommentForm editRequestId={request.id} />
          </div>
        ) : (
          <p className="mt-6 text-sm text-apx-mute">
            This request is closed. Need another change?{" "}
            <Link
              href="/app/edit-requests/new"
              className="font-semibold text-apx-ink underline underline-offset-2"
            >
              Open a new request
            </Link>
            .
          </p>
        )}
      </section>

      {request.status === "done" ? (
        <div className="mt-10 text-center">
          <Button href="/app/edit-requests/new">Request another edit</Button>
        </div>
      ) : null}
    </main>
  )
}

function AttachmentTile({ url }: { url: string }) {
  // Naive image detection — both file uploads and any external pasted URL go
  // through the existing storage path which only allows jpeg/png/webp. If
  // future flows attach non-images, render a file-icon tile by extension.
  const isImage = /\.(jpe?g|png|webp)(\?|$)/i.test(url)
  if (isImage) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="relative block aspect-square overflow-hidden rounded-lg border border-apx-line bg-apx-canvas"
      >
        <Image
          src={url}
          alt=""
          fill
          sizes="(max-width: 640px) 33vw, 200px"
          className="object-cover"
          unoptimized
        />
      </a>
    )
  }
  const filename = url.split("/").pop()?.split("?")[0] ?? "attachment"
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex aspect-square items-center justify-center rounded-lg border border-apx-line bg-apx-canvas p-3 text-center text-[12px] text-apx-mute hover:text-apx-ink"
    >
      {filename}
    </a>
  )
}

function humanSection(s: string): string {
  return s.replace("_", " ").replace(/^\w/, (m) => m.toUpperCase())
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}
