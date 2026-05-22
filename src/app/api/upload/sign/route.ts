import { NextResponse } from "next/server"
import { z } from "zod"

import { getSiteByStripeSessionId } from "@/lib/supabase"
import {
  ASSET_KINDS,
  StorageInputError,
  mintSignedUpload,
} from "@/lib/storage"

// =============================================================================
// POST /api/upload/sign
// =============================================================================
// Issues a one-shot signed upload URL the browser can PUT a file to. Same
// Stripe-session-id bearer-token model as the rest of /onboarding — the
// session id resolves to a site_id which becomes the path prefix.
//
// Request:
//   { sessionId, kind, filename, contentType, contentLength? }
//
// Response (200):
//   { signedUrl, publicUrl, path }
// =============================================================================

const RequestSchema = z.object({
  sessionId: z.string().min(20).max(200),
  kind: z.enum(ASSET_KINDS as unknown as [string, ...string[]]),
  filename: z.string().min(1).max(120),
  contentType: z.string().min(1).max(120),
  contentLength: z.number().int().positive().optional(),
})

export async function POST(req: Request) {
  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    )
  }

  const { sessionId, kind, filename, contentType, contentLength } = parsed.data

  let site
  try {
    site = await getSiteByStripeSessionId(sessionId)
  } catch (err) {
    console.error("[upload/sign] supabase lookup failed", err)
    return NextResponse.json({ error: "Lookup failed." }, { status: 500 })
  }
  if (!site) {
    return NextResponse.json(
      { error: "Site not found for that session." },
      { status: 404 }
    )
  }
  if (site.status !== "pending_content") {
    return NextResponse.json(
      {
        error: `Uploads locked (status: ${site.status}). Email hello@yourshopfront.com to change anything.`,
      },
      { status: 409 }
    )
  }

  try {
    const result = await mintSignedUpload({
      siteId: site.id,
      kind: kind as "logo" | "hero" | "gallery",
      filename,
      contentType,
      contentLength,
    })
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof StorageInputError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error("[upload/sign] mint failed", err)
    return NextResponse.json(
      { error: "Could not start upload." },
      { status: 500 }
    )
  }
}
