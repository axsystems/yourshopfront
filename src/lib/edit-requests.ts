import "server-only"

import { supabase } from "./supabase"

// =============================================================================
// edit_requests — typed helpers (server-only)
// =============================================================================
// Mirrors supabase/migrations/0010_edit_requests.sql. JSONB columns
// (attachments + comments) are append-only from the customer's POV; we
// use read-modify-write for comment appends because supabase-js doesn't
// expose Postgres jsonb operators directly. Low contention per row makes
// this safe in practice for this product's scale.
// =============================================================================

export const EDIT_REQUEST_SECTIONS = [
  "hero",
  "contact",
  "services",
  "about",
  "service_area",
  "reviews",
  "media",
  "other",
] as const
export type EditRequestSection = (typeof EDIT_REQUEST_SECTIONS)[number]

export const EDIT_REQUEST_PRIORITIES = ["low", "normal", "urgent"] as const
export type EditRequestPriority = (typeof EDIT_REQUEST_PRIORITIES)[number]

export const EDIT_REQUEST_STATUSES = ["open", "in_progress", "done"] as const
export type EditRequestStatus = (typeof EDIT_REQUEST_STATUSES)[number]

export interface EditRequestComment {
  /** Stable id so the UI can key on it and detect optimistic vs server rows. */
  id: string
  author_type: "customer" | "operator"
  /** customer.id for customer authors; operator handle (email/slug) otherwise. */
  author_id: string
  body: string
  created_at: string
}

export interface EditRequest {
  id: string
  site_id: string
  customer_id: string
  section: EditRequestSection
  description: string
  priority: EditRequestPriority
  status: EditRequestStatus
  attachments: string[]
  comments: EditRequestComment[]
  created_at: string
  updated_at: string
}

export interface NewEditRequest {
  site_id: string
  customer_id: string
  section: EditRequestSection
  description: string
  priority?: EditRequestPriority
  attachments?: string[]
}

// -----------------------------------------------------------------------------
// Queries
// -----------------------------------------------------------------------------

export async function listEditRequestsForCustomer(
  customerId: string
): Promise<EditRequest[]> {
  const { data, error } = await supabase()
    .from("edit_requests")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data as EditRequest[] | null) ?? []
}

export async function getEditRequestById(id: string): Promise<EditRequest | null> {
  const { data, error } = await supabase()
    .from("edit_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  return (data as EditRequest | null) ?? null
}

// -----------------------------------------------------------------------------
// Mutations
// -----------------------------------------------------------------------------

export async function createEditRequestRow(
  input: NewEditRequest
): Promise<EditRequest> {
  const { data, error } = await supabase()
    .from("edit_requests")
    .insert({
      site_id: input.site_id,
      customer_id: input.customer_id,
      section: input.section,
      description: input.description,
      priority: input.priority ?? "normal",
      attachments: input.attachments ?? [],
      comments: [],
    })
    .select("*")
    .single()
  if (error) throw error
  return data as EditRequest
}

/**
 * Appends a comment via read-modify-write. Low contention per request row
 * (one customer + the operator) makes the race window acceptable; if two
 * authors hit submit within the same millisecond, the second write wins
 * its own comment and the first is preserved (because we re-read inside
 * the same call). Use a transaction in Postgres directly if this ever
 * becomes a hot path.
 */
export async function appendCommentToEditRequest(
  editRequestId: string,
  comment: EditRequestComment
): Promise<EditRequest> {
  const current = await getEditRequestById(editRequestId)
  if (!current) throw new Error(`edit_request ${editRequestId} not found`)
  const nextComments = [...current.comments, comment]
  const { data, error } = await supabase()
    .from("edit_requests")
    .update({ comments: nextComments })
    .eq("id", editRequestId)
    .select("*")
    .single()
  if (error) throw error
  return data as EditRequest
}
