import { NextResponse } from "next/server"
import { z } from "zod"

import { requireAuth } from "@/lib/auth"
import { checkRateLimit } from "@/lib/chat/rate-limit"
import { getSiteById, getSiteByStripeSessionId } from "@/lib/supabase"
import {
  StorageInputError,
  mintSignedUpload,
} from "@/lib/storage"

// =============================================================================
// POST /api/upload/sign
// =============================================================================
// Issues a one-shot signed upload URL the browser can PUT a file to.
//
// Two auth modes, discriminated on `kind`:
//
//   - kind in ("logo" | "hero" | "gallery"):
//       Stripe-session-id bearer-token, used during onboarding. Site must
//       still be in pending_content status (onboarding lock).
//
//   - kind === "edit-request":
//       Authed customer mode (Stream A). Requires { siteId } and resolves
//       the customer from the Supabase auth user, then verifies the site
//       belongs to that customer. Works at any site status — edit
//       requests are explicitly for the post-launch lifecycle.
//
// Response (200): { signedUrl, publicUrl, path }
// =============================================================================

const BaseFields = {
  filename: z.string().min(1).max(120),
  contentType: z.string().min(1).max(120),
  contentLength: z.number().int().positive().optional(),
}

const RequestSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.enum(["logo", "hero", "gallery"]),
    sessionId: z.string().min(20).max(200),
    ...BaseFields,
  }),
  z.object({
    kind: z.literal("edit-request"),
    siteId: z.string().uuid(),
    ...BaseFields,
  }),
])

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

  const input = parsed.data

  // --- Resolve siteId based on auth mode --------------------------------
  let siteId: string
  if (input.kind === "edit-request") {
    const { customer } = await requireAuth()

    // Rate-limit per authed customer — prevents a compromised/buggy client
    // from minting unlimited signed URLs (each one consumes Supabase
    // storage operations). 20/min is well above any legitimate flow
    // (the form caps at 10 attachments per request).
    const rl = checkRateLimit(`upload-sign:${customer.id}`, 20)
    if (!rl.ok) {
      return NextResponse.json(
        { error: "rate_limited" },
        {
          status: 429,
          headers: { "Retry-After": String(rl.retryAfterSeconds) },
        }
      )
    }

    let site
    try {
      site = await getSiteById(input.siteId)
    } catch (err) {
      console.error("[upload/sign] supabase lookup failed", err)
      return NextResponse.json({ error: "Lookup failed." }, { status: 500 })
    }
    if (!site) {
      return NextResponse.json({ error: "Site not found." }, { status: 404 })
    }
    if (site.customer_id !== customer.id) {
      // Don't leak existence — same 404 as not-found.
      return NextResponse.json({ error: "Site not found." }, { status: 404 })
    }
    siteId = site.id
  } else {
    let site
    try {
      site = await getSiteByStripeSessionId(input.sessionId)
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
    siteId = site.id
  }

  // --- Mint --------------------------------------------------------------
  try {
    const result = await mintSignedUpload({
      siteId,
      kind: input.kind,
      filename: input.filename,
      contentType: input.contentType,
      contentLength: input.contentLength,
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

