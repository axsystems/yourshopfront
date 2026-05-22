"use client"

import * as React from "react"
import Image from "next/image"
import { Loader2, Upload, X } from "lucide-react"

import type { AssetKind } from "@/lib/storage"

interface AssetUploaderProps {
  /** Stripe session id — same bearer-token used by the worksheet actions. */
  sessionId: string
  kind: AssetKind
  /** Existing asset URLs. For "logo"/"hero", at most 1; for "gallery", many. */
  value: string[]
  /** Cap on how many URLs `value` can hold. Default: 1 for logo/hero, 40 for gallery. */
  max?: number
  disabled?: boolean
  onChange: (next: string[]) => void
  /** Optional accept hint passed to the file input. */
  accept?: string
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]
const ALLOWED_HINT = ".jpg, .png, .webp, .svg"
const DEFAULT_MAX: Record<AssetKind, number> = {
  logo: 1,
  hero: 1,
  gallery: 40,
}

/**
 * Drag-and-drop / file-picker uploader. Mints a signed upload URL via
 * /api/upload/sign, PUTs the file to Storage, then calls onChange with
 * the appended public URL. Single-file kinds (logo/hero) replace the
 * existing URL; gallery appends.
 */
export function AssetUploader({
  sessionId,
  kind,
  value,
  max,
  disabled,
  onChange,
  accept,
}: AssetUploaderProps) {
  const cap = max ?? DEFAULT_MAX[kind]
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [pending, setPending] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)
  const [dragOver, setDragOver] = React.useState(false)

  const canAddMore = value.length < cap

  const handleFiles = async (files: FileList | File[]) => {
    setError(null)
    const list = Array.from(files)
    if (list.length === 0) return
    if (!canAddMore) {
      setError(`Up to ${cap} ${cap === 1 ? "file" : "files"} allowed.`)
      return
    }
    const slots = cap - value.length
    const queue = list.slice(0, slots)

    const next: string[] = kind === "gallery" ? [...value] : []
    setPending(true)
    setProgress(0)
    try {
      for (let i = 0; i < queue.length; i++) {
        const file = queue[i]
        if (!ALLOWED_TYPES.includes(file.type)) {
          throw new Error(`Unsupported file type. Allowed: ${ALLOWED_HINT}.`)
        }
        const url = await uploadOne(sessionId, kind, file)
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

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled || pending) return
    if (e.dataTransfer.files.length > 0) void handleFiles(e.dataTransfer.files)
  }

  const removeAt = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-3">
      <div
        onDragEnter={(e) => {
          e.preventDefault()
          if (!disabled && !pending) setDragOver(true)
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className="rounded-lg border-2 border-dashed p-6 text-center transition-colors"
        style={{
          borderColor: dragOver
            ? "var(--apex-primary)"
            : "var(--apex-border)",
          background: dragOver
            ? "color-mix(in oklab, var(--apex-primary) 8%, transparent)"
            : "var(--apex-bg)",
          color: "var(--apex-muted-fg)",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={kind === "gallery"}
          accept={accept ?? ALLOWED_TYPES.join(",")}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files)
            e.target.value = ""
          }}
          disabled={disabled || pending || !canAddMore}
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
                disabled={disabled || !canAddMore}
                className="font-semibold underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ color: "var(--apex-fg)" }}
              >
                pick a file
              </button>
              {kind === "gallery" ? <span> ({value.length}/{cap})</span> : null}
            </p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em]">
              {ALLOWED_HINT} · up to 10MB
            </p>
          </>
        )}
      </div>

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {value.length > 0 ? (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.map((url, i) => (
            <li
              key={url}
              className="relative aspect-square overflow-hidden rounded-lg border"
              style={{
                background: "var(--apex-surface)",
                borderColor: "var(--apex-border)",
              }}
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
                onClick={() => removeAt(i)}
                aria-label="Remove file"
                disabled={disabled || pending}
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full text-white shadow-md transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: "rgba(15, 23, 42, 0.85)" }}
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

async function uploadOne(
  sessionId: string,
  kind: AssetKind,
  file: File
): Promise<string> {
  const signRes = await fetch("/api/upload/sign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      sessionId,
      kind,
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
