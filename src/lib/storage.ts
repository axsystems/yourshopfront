import "server-only"

import { randomUUID } from "node:crypto"

import { supabase } from "./supabase"

// =============================================================================
// Apex Sites — Storage helpers (server-only)
// =============================================================================
// Wraps the Supabase Storage SDK with the apex-sites conventions:
//
//   - Bucket: "site-assets" (created in migration 0005).
//   - Path scheme: "{site_id}/{kind}/{uuid}-{safe-filename}"
//   - Kind: "logo" | "hero" | "gallery"
//
// The signed-upload-URL flow:
//
//   1. Browser POSTs { sessionId, kind, contentType, filename } to
//      /api/upload/sign.
//   2. That route validates the session and calls `mintSignedUpload` here,
//      which returns { signedUrl, publicUrl, path }.
//   3. Browser PUTs the file bytes to `signedUrl` directly.
//   4. Browser POSTs the resulting `publicUrl` back to a server action,
//      which writes it into site_content.media.
// =============================================================================

const BUCKET = "site-assets"

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
])

const MAX_BYTES = 10 * 1024 * 1024 // 10MB — matches the bucket limit.

export type AssetKind = "logo" | "hero" | "gallery"

export const ASSET_KINDS: readonly AssetKind[] = ["logo", "hero", "gallery"]

export interface SignedUploadResult {
  /** PUT-able URL with one-shot auth baked in. */
  signedUrl: string
  /** Permanent public URL after the upload completes. */
  publicUrl: string
  /** Object path within the bucket, e.g. "{site_id}/hero/{uuid}-photo.jpg". */
  path: string
}

export interface MintInput {
  siteId: string
  kind: AssetKind
  filename: string
  contentType: string
  contentLength?: number
}

export class StorageInputError extends Error {}

/**
 * Validates input + mints a signed upload URL. The path includes a fresh
 * uuid so a customer can re-upload the same filename without overwriting
 * the old object (cleaner audit trail; deletes are deliberate).
 */
export async function mintSignedUpload(
  input: MintInput
): Promise<SignedUploadResult> {
  if (!ASSET_KINDS.includes(input.kind)) {
    throw new StorageInputError(`Unsupported kind: ${input.kind}`)
  }
  if (!ALLOWED_MIME.has(input.contentType)) {
    throw new StorageInputError(
      `Unsupported file type. Allowed: ${[...ALLOWED_MIME].join(", ")}`
    )
  }
  if (
    input.contentLength !== undefined &&
    (input.contentLength <= 0 || input.contentLength > MAX_BYTES)
  ) {
    throw new StorageInputError(
      `File too large or empty. Max ${MAX_BYTES / 1024 / 1024} MB.`
    )
  }

  const safe = sanitizeFilename(input.filename)
  const path = `${input.siteId}/${input.kind}/${randomUUID()}-${safe}`

  const { data, error } = await supabase()
    .storage.from(BUCKET)
    .createSignedUploadUrl(path)
  if (error || !data) {
    throw new Error(`Could not mint signed upload URL: ${error?.message}`)
  }

  const { data: pub } = supabase().storage.from(BUCKET).getPublicUrl(path)
  return {
    signedUrl: data.signedUrl,
    publicUrl: pub.publicUrl,
    path,
  }
}

/**
 * Strips path-traversal characters and clamps length. Keeps the original
 * extension visible so the public URL still hints at the asset type.
 */
function sanitizeFilename(name: string): string {
  const cleaned = name
    .replace(/[/\\?%*:|"<>]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^\.+/, "")
    .toLowerCase()
  const trimmed = cleaned.slice(0, 80)
  return trimmed.length > 0 ? trimmed : "file"
}

/**
 * Best-effort delete of an object by its public URL. Used when a customer
 * removes a gallery photo. Failures are logged, not thrown — Storage
 * cleanup isn't allowed to block content updates.
 */
export async function deleteByPublicUrl(publicUrl: string): Promise<void> {
  const path = pathFromPublicUrl(publicUrl)
  if (!path) return
  const { error } = await supabase().storage.from(BUCKET).remove([path])
  if (error) {
    console.warn("[storage] delete failed", { path, error: error.message })
  }
}

/**
 * Pull the bucket-relative object path out of a Supabase public URL.
 * Returns null if the URL doesn't match this bucket — never throws.
 */
function pathFromPublicUrl(publicUrl: string): string | null {
  const marker = `/${BUCKET}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  return publicUrl.slice(idx + marker.length)
}
