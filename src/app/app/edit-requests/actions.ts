"use server"

import { randomUUID } from "node:crypto"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import {
  EDIT_REQUEST_PRIORITIES,
  EDIT_REQUEST_SECTIONS,
  appendCommentToEditRequest,
  createEditRequestRow,
  getEditRequestById,
} from "@/lib/edit-requests"
import { requireAuth } from "@/lib/auth"
import { notifySlack } from "@/lib/notify"
import { getSiteById } from "@/lib/supabase"

// =============================================================================
// /app/edit-requests — server actions
// =============================================================================
// Defense-in-depth posture: even though RLS restricts SELECT to the auth'd
// customer, we run all mutations as the service role and verify ownership
// in code. RLS is the second line, not the first.
// =============================================================================

export type CreateEditRequestResult =
  | { ok: true; id: string }
  | { ok: false; error: string }

export type AddCommentResult =
  | { ok: true }
  | { ok: false; error: string }

const CreateSchema = z.object({
  siteId: z.string().uuid(),
  section: z.enum(EDIT_REQUEST_SECTIONS),
  description: z.string().trim().min(20).max(5000),
  priority: z.enum(EDIT_REQUEST_PRIORITIES).default("normal"),
  attachmentUrls: z.array(z.string().url()).max(10).default([]),
})

export async function createEditRequest(
  input: z.infer<typeof CreateSchema>
): Promise<CreateEditRequestResult> {
  const parsed = CreateSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." }
  }
  const data = parsed.data

  let customer: Awaited<ReturnType<typeof requireAuth>>["customer"]
  try {
    ;({ customer } = await requireAuth())
  } catch (err) {
    console.error("[edit-requests/create] auth failed", err)
    return { ok: false, error: "Not signed in." }
  }

  // Defense in depth: verify the site belongs to this customer before
  // letting them attach an edit request to it. RLS would catch a SELECT
  // forgery, but INSERTs go through the service role, so we check here.
  try {
    const site = await getSiteById(data.siteId)
    if (!site || site.customer_id !== customer.id) {
      return { ok: false, error: "Site not found." }
    }
  } catch (err) {
    console.error("[edit-requests/create] site lookup failed", err)
    return { ok: false, error: "Lookup failed." }
  }

  let created
  try {
    created = await createEditRequestRow({
      site_id: data.siteId,
      customer_id: customer.id,
      section: data.section,
      description: data.description,
      priority: data.priority,
      attachments: data.attachmentUrls,
    })
  } catch (err) {
    console.error("[edit-requests/create] insert failed", err)
    return { ok: false, error: "Could not save your request. Try again." }
  }

  await notifySlack(
    [
      `*New edit request* (${data.priority})`,
      `Customer: ${customer.email} (${customer.name})`,
      `Site: ${data.siteId}`,
      `Section: ${data.section}`,
      `Attachments: ${data.attachmentUrls.length}`,
      "",
      `> ${data.description.slice(0, 280)}${data.description.length > 280 ? "…" : ""}`,
    ].join("\n")
  )

  revalidatePath("/app/edit-requests")
  revalidatePath(`/app/edit-requests/${created.id}`)
  return { ok: true, id: created.id }
}

const CommentSchema = z.object({
  editRequestId: z.string().uuid(),
  body: z.string().trim().min(1).max(5000),
})

export async function addComment(
  input: z.infer<typeof CommentSchema>
): Promise<AddCommentResult> {
  const parsed = CommentSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." }
  }
  const data = parsed.data

  let customer: Awaited<ReturnType<typeof requireAuth>>["customer"]
  try {
    ;({ customer } = await requireAuth())
  } catch (err) {
    console.error("[edit-requests/comment] auth failed", err)
    return { ok: false, error: "Not signed in." }
  }

  let existing
  try {
    existing = await getEditRequestById(data.editRequestId)
  } catch (err) {
    console.error("[edit-requests/comment] lookup failed", err)
    return { ok: false, error: "Lookup failed." }
  }
  if (!existing) {
    return { ok: false, error: "Edit request not found." }
  }
  if (existing.customer_id !== customer.id) {
    // Same 404-equivalent for both not-found and not-yours — don't leak.
    return { ok: false, error: "Edit request not found." }
  }

  try {
    await appendCommentToEditRequest(data.editRequestId, {
      id: randomUUID(),
      author_type: "customer",
      author_id: customer.id,
      body: data.body,
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error("[edit-requests/comment] append failed", err)
    return { ok: false, error: "Could not post comment. Try again." }
  }

  await notifySlack(
    [
      `*New edit-request comment*`,
      `From: ${customer.email}`,
      `Request: ${data.editRequestId}`,
      "",
      `> ${data.body.slice(0, 280)}${data.body.length > 280 ? "…" : ""}`,
    ].join("\n")
  )

  revalidatePath(`/app/edit-requests/${data.editRequestId}`)
  return { ok: true }
}
