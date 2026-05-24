import "server-only"

import { supabase } from "./supabase"

// =============================================================================
// edit_requests — typed helpers (server-only)
// =============================================================================
// Mirrors supabase/migrations/0010_edit_requests.sql and
// 0012_edit_request_append_comment.sql.
//
// Attachments are appended by the create-row path. Comments are appended via
// the `append_edit_request_comment` Postgres RPC (0012) which uses
// SELECT ... FOR UPDATE + the jsonb || operator inside a single transaction
// so concurrent customer/operator submits never clobber each other.
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
 * Appends a comment atomically via the `append_edit_request_comment` RPC
 * (migration 0012). The RPC takes a row-level lock and uses the jsonb ||
 * operator, so concurrent customer+operator submits cannot lose comments.
 */
export async function appendCommentToEditRequest(
  editRequestId: string,
  comment: EditRequestComment
): Promise<EditRequest> {
  const { data, error } = await supabase().rpc(
    "append_edit_request_comment",
    {
      p_edit_request_id: editRequestId,
      // RPC takes jsonb — supabase-js serializes object args as JSON for us.
      p_comment: comment,
    }
  )
  if (error) throw error
  if (!data) throw new Error(`edit_request ${editRequestId} not found`)
  return data as EditRequest
}
