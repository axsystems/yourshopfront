"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Loader2, Upload, X } from "lucide-react"

import { Button, TextField } from "@/components/apex"

import { createEditRequest } from "../actions"

// =============================================================================
// New edit-request form (client)
// =============================================================================
// Server component fetches the customer's sites and hands them down.
// Uploads use /api/upload/sign with kind="edit-request"; the route checks
// auth + site ownership before minting. Files land under
// {site_id}/edit-requests/_pending/ because the request_id doesn't exist
// yet — orphan cleanup is deferred (MVP trade-off, documented in
// src/lib/storage.ts).
// =============================================================================

const SECTIONS: Array<{ value: SectionValue; label: string }> = [
  { value: "hero", label: "Hero / homepage banner" },
  { value: "contact", label: "Contact info" },
  { value: "services", label: "Services" },
  { value: "about", label: "About / story" },
  { value: "service_area", label: "Service area" },
  { value: "reviews", label: "Reviews / testimonials" },
  { value: "media", label: "Photos / media" },
  { value: "other", label: "Other" },
]

type SectionValue =
  | "hero"
  | "contact"
  | "services"
  | "about"
  | "service_area"
  | "reviews"
  | "media"
  | "other"

type Priority = "low" | "normal" | "urgent"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const ALLOWED_HINT = ".jpg, .png, .webp"
const MAX_ATTACHMENTS = 10

interface SiteOption {
  id: string
  business_name: string
}

export function NewEditRequestForm({ sites }: { sites: SiteOption[] }) {
  const router = useRouter()
  const [siteId, setSiteId] = React.useState(sites[0]?.id ?? "")
  const [section, setSection] = React.useState<SectionValue>("hero")
  const [priority, setPriority] = React.useState<Priority>("normal")
  const [description, setDescription] = React.useState("")
  const [attachments, setAttachments] = React.useState<string[]>([])
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const descError =
    description.trim().length > 0 && description.trim().length < 20
      ? "At least 20 characters."
      : description.length > 5000
        ? "Too long (max 5000 characters)."
        : undefined

  const canSubmit =
    !submitting &&
    siteId !== "" &&
    description.trim().length >= 20 &&
    description.length <= 5000

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await createEditRequest({
        siteId,
        section,
        description: description.trim(),
        priority,
        attachmentUrls: attachments,
      })
      if (!res.ok) {
        setError(res.error)
        setSubmitting(false)
        return
      }
      router.push(`/app/edit-requests/${res.id}`)
    } catch (err) {
      console.error("[edit-requests/new] submit failed", err)
      setError("Could not submit. Try again.")
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {sites.length > 1 ? (
        <SelectField
          label="Site"
          value={siteId}
          onChange={setSiteId}
          options={sites.map((s) => ({ value: s.id, label: s.business_name }))}
          required
        />
      ) : (
        <input type="hidden" name="siteId" value={siteId} />
      )}

      <SelectField
        label="Section"
        value={section}
        onChange={(v) => setSection(v as SectionValue)}
        options={SECTIONS.map((s) => ({ value: s.value, label: s.label }))}
        required
      />

      <TextField
        label="What needs to change?"
        hint="Be specific — copy the exact wording you want, link to a competitor, paste a sentence."
        multiline
        rows={6}
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={descError}
        maxLength={5000}
      />

      <fieldset>
        <legend className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-apx-mute">
          Priority
        </legend>
        <div className="flex flex-wrap gap-3">
          {(["low", "normal", "urgent"] as const).map((p) => (
            <label
              key={p}
              className={
                priority === p
                  ? "cursor-pointer rounded-full border border-apx-ink bg-apx-canvas px-4 py-2 text-sm font-semibold text-apx-ink"
                  : "cursor-pointer rounded-full border border-apx-line bg-apx-paper px-4 py-2 text-sm text-apx-mute hover:border-apx-ink/40"
              }
            >
              <input
                type="radio"
                name="priority"
                value={p}
                checked={priority === p}
                onChange={() => setPriority(p)}
                className="sr-only"
              />
              {p === "low" ? "Low" : p === "normal" ? "Normal" : "Urgent"}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <p className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-apx-mute">
          Attachments (optional)
        </p>
        <AttachmentUploader
          siteId={siteId}
          value={attachments}
          onChange={setAttachments}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-apx-danger/40 bg-apx-danger/5 p-3 text-sm text-apx-danger"
        >
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <Button href="/app/edit-requests" variant="ghost">
          Cancel
        </Button>
        <Button
          type="submit"
          loading={submitting}
          disabled={!canSubmit}
        >
          Submit request
        </Button>
      </div>
    </form>
  )
}

// -----------------------------------------------------------------------------
// SelectField — minimal styled <select>. Inline rather than a new primitive
// because no other apex form uses a select yet.
// -----------------------------------------------------------------------------
function SelectField({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: Array<{ value: string; label: string }>
  required?: boolean
}) {
  const reactId = React.useId()
  return (
    <label htmlFor={reactId} className="block">
      <span className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-apx-mute">
        {label}
        {required ? <span className="text-apx-primary"> *</span> : null}
      </span>
      <select
        id={reactId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-apx-line bg-apx-paper px-3 py-2.5 text-[16px] text-apx-ink outline-none focus-visible:border-apx-primary focus-visible:ring-2 focus-visible:ring-apx-primary/30"
        required={required}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

// -----------------------------------------------------------------------------
// AttachmentUploader — slimmer cousin of AssetUploader, scoped to
// edit-request semantics (multi-file, image-only, max 10).
// -----------------------------------------------------------------------------
function AttachmentUploader({
  siteId,
  value,
  onChange,
}: {
  siteId: string
  value: string[]
  onChange: (next: string[]) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [pending, setPending] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)
  const [dragOver, setDragOver] = React.useState(false)

  const canAddMore = value.length < MAX_ATTACHMENTS && siteId !== ""

  const handleFiles = async (files: FileList | File[]) => {
    setError(null)
    if (siteId === "") {
      setError("Pick a site first.")
      return
    }
    const list = Array.from(files)
    if (list.length === 0) return
    const slots = MAX_ATTACHMENTS - value.length
    if (slots <= 0) {
      setError(`Up to ${MAX_ATTACHMENTS} files.`)
      return
    }
    const queue = list.slice(0, slots)
    const next: string[] = [...value]
    setPending(true)
    setProgress(0)
    try {
      for (let i = 0; i < queue.length; i++) {
        const file = queue[i]
        if (!ALLOWED_TYPES.includes(file.type)) {
          throw new Error(`Unsupported file type. Allowed: ${ALLOWED_HINT}.`)
        }
        const url = await uploadOne(siteId, file)
        next.push(url)
        setProgress(Math.round(((i + 1) / queue.length) * 100))
      }
      onChange(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-3">
      <div
        onDragEnter={(e) => {
          e.preventDefault()
          if (!pending) setDragOver(true)
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (pending) return
          if (e.dataTransfer.files.length > 0)
            void handleFiles(e.dataTransfer.files)
        }}
        className={
          dragOver
            ? "rounded-lg border-2 border-dashed border-apx-primary bg-apx-primary/5 p-6 text-center"
            : "rounded-lg border-2 border-dashed border-apx-line bg-apx-paper p-6 text-center text-apx-mute"
        }
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(",")}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files)
            e.target.value = ""
          }}
          disabled={pending || !canAddMore}
        />
        {pending ? (
          <p className="inline-flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Uploading… {progress}%
          </p>
        ) : (
          <>
            <Upload className="mx-auto h-6 w-6" aria-hidden />
            <p className="mt-2 text-sm">
              Drag and drop or{" "}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={!canAddMore}
                className="font-semibold underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ color: "var(--apex-fg)" }}
              >
                pick a file
              </button>{" "}
              ({value.length}/{MAX_ATTACHMENTS})
            </p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em]">
              {ALLOWED_HINT} · up to 10MB
            </p>
          </>
        )}
      </div>

      {error ? (
        <p className="text-sm text-apx-danger" role="alert">
          {error}
        </p>
      ) : null}

      {value.length > 0 ? (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.map((url, i) => (
            <li
              key={url}
              className="relative aspect-square overflow-hidden rounded-lg border border-apx-line bg-apx-canvas"
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="(max-width: 640px) 33vw, 200px"
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                aria-label="Remove file"
                disabled={pending}
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-slate-900/85 text-white shadow-md transition hover:scale-110 disabled:opacity-60"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

async function uploadOne(siteId: string, file: File): Promise<string> {
  const signRes = await fetch("/api/upload/sign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      kind: "edit-request",
      siteId,
      filename: file.name,
      contentType: file.type,
      contentLength: file.size,
    }),
  })
  if (!signRes.ok) {
    const body = (await signRes.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? `Sign failed (${signRes.status})`)
  }
  const { signedUrl, publicUrl } = (await signRes.json()) as {
    signedUrl: string
    publicUrl: string
  }
  const putRes = await fetch(signedUrl, {
    method: "PUT",
    headers: { "content-type": file.type },
    body: file,
  })
  if (!putRes.ok) {
    throw new Error(`Upload failed (${putRes.status})`)
  }
  return publicUrl
}
