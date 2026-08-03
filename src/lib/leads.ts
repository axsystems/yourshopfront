import "server-only"
import { getCustomerById, supabase, type Site } from "./supabase"

// =============================================================================
// Leads — visitor submissions on delivered customer sites (server-only)
// =============================================================================
// Mirrors supabase/migrations/0014_leads.sql. Uses the same service-role
// client as src/lib/supabase.ts, so the `server-only` import above is what
// keeps this out of a browser bundle.
//
// Failure semantics, decided by the owner:
//   - The DB write is AUTHORITATIVE. If it fails the caller must tell the
//     visitor, so a lead is never silently dropped.
//   - The notification email is BEST-EFFORT (see sendLeadNotificationEmail in
//     ./email), matching every other sendEmail caller in this repo.
// =============================================================================

export interface Lead {
  id: string
  site_id: string
  name: string
  email: string | null
  phone: string | null
  message: string | null
  /** Pathname or named form the submission came from, e.g. "/" or "calculator". */
  source_page: string | null
  /**
   * Raw calculator answers as stored in JSONB. Deliberately untyped here —
   * the per-vertical input shape is owned elsewhere, and this layer must not
   * need a change every time a calculator gains a field.
   */
  calculator_input: Record<string, unknown>
  /** Computed quote in dollars. Null when the form had no calculator. */
  calculator_estimate: number | null
  created_at: string
}

export interface NewLead {
  site_id: string
  name: string
  email?: string | null
  phone?: string | null
  message?: string | null
  source_page?: string | null
  calculator_input?: Record<string, unknown>
  calculator_estimate?: number | null
}

/**
 * Outcome of an attempted lead insert. Three-way on purpose: the caller has
 * to distinguish "we lost it, tell the visitor to try again" from "we didn't
 * persist it but it is fully recoverable from the error log", and those two
 * deserve different HTTP responses.
 *
 * Suggested handling in the route:
 *   persisted   → 200. Normal path.
 *   logged_only → 200. The migration is gated on the owner, so this code can
 *                 ship before the table exists. The lead is NOT recoverable:
 *                 the log carries only non-PII keys (see createLead), so the
 *                 contact details are gone. The notification email is the
 *                 only copy. Applying 0014_leads.sql is a hard prerequisite
 *                 to putting the form in front of visitors.
 *   failed      → 5xx. Genuinely lost; the visitor must be told so they can
 *                 retry or call instead.
 */
export type CreateLeadResult =
  | { outcome: "persisted"; lead: Lead }
  | { outcome: "logged_only" }
  | { outcome: "failed"; message: string }

/**
 * Error codes that mean "the leads table isn't there yet", as opposed to any
 * other insert failure.
 *
 * Both are needed. PostgREST answers a request for an unknown table from its
 * schema cache with PGRST205 (404) before Postgres is ever asked, so that —
 * not the raw Postgres code — is what Supabase returns in practice. 42P01 is
 * Postgres's own undefined_table, which still surfaces when the schema cache
 * is warm but the relation is gone (e.g. dropped underneath a running
 * PostgREST). Matching on code, never on message text.
 * Refs: postgrest.org errors reference, group 2 (schema cache); PG appendix A.
 */
const TABLE_MISSING_CODES = ["PGRST205", "42P01"] as const

function isTableMissing(code: string): boolean {
  return TABLE_MISSING_CODES.some((c) => c === code)
}

/**
 * Inserts one lead. Never throws — every failure mode, including a thrown
 * one, is expressed in the returned union so the route handler decides the
 * visitor-facing response. (`supabase()` throws synchronously when the
 * service-role env vars are unset, which is why the body is wrapped.)
 *
 * The table-missing log carries only non-PII recovery keys. These are a
 * customer's customers: their name, email, phone, and free-text message do
 * not go to the platform log. The trade-off is explicit — with the table
 * absent the lead is NOT recoverable from logs, so 0014_leads.sql must be
 * applied before the form is enabled for real visitors.
 */
export async function createLead(input: NewLead): Promise<CreateLeadResult> {
  const row = {
    site_id: input.site_id,
    name: input.name,
    email: input.email ?? null,
    phone: input.phone ?? null,
    message: input.message ?? null,
    source_page: input.source_page ?? null,
    calculator_input: input.calculator_input ?? {},
    calculator_estimate: input.calculator_estimate ?? null,
  }

  try {
    const { data, error } = await supabase()
      .from("leads")
      .insert(row)
      .select("*")
      .single()

    if (error) {
      if (isTableMissing(error.code)) {
        console.error(
          "[leads] LEAD LOST — the leads table does not exist, so this submission was NOT persisted. Apply supabase/migrations/0014_leads.sql; until then the notification email is the only copy of the lead. Visitor contact details are deliberately omitted from this log (PII).",
          {
            code: error.code,
            site_id: row.site_id,
            created_at: new Date().toISOString(),
            has_email: Boolean(row.email),
            has_phone: Boolean(row.phone),
          }
        )
        return { outcome: "logged_only" }
      }
      console.error("[leads] insert failed", {
        code: error.code,
        message: error.message,
        details: error.details,
        site_id: input.site_id,
      })
      return { outcome: "failed", message: error.message }
    }

    // Cast at the helper boundary, per the convention documented at the top of
    // src/lib/supabase.ts: supabase() is created without a generated Database
    // generic, so `data` arrives untyped and every helper in that module
    // narrows the same way (`data as Site`). Narrowing here is strictly better
    // than letting an untyped value escape this module.
    return { outcome: "persisted", lead: data as Lead }
  } catch (err) {
    console.error("[leads] insert threw", {
      site_id: row.site_id,
      message: err instanceof Error ? err.message : String(err),
    })
    return { outcome: "failed", message: "lead insert threw" }
  }
}

/**
 * Where a lead notification should go for a given site.
 *
 * Preference order, and why:
 *   1. site_content.contact.email — the address the business publishes on
 *      their own site for customers to reach them. If they publish it, they
 *      read it. Optional in SiteContentContact, so it is often absent.
 *   2. customers.email — the purchaser's email. `not null` since
 *      0001_initial.sql, so this is the reliable floor. It is the billing
 *      address rather than the public inbox, which is why it is the fallback
 *      and not the first choice.
 *
 * Returns null (with a warning) when neither is available — the caller
 * should skip the email and still treat the submission as successful.
 */
export async function getLeadNotificationRecipient(
  site: Site
): Promise<string | null> {
  const published = site.site_content?.contact?.email?.trim()
  if (published) return published

  const customer = await getCustomerById(site.customer_id).catch((err) => {
    console.warn("[leads] customer lookup failed for notification", err)
    return null
  })
  const billing = customer?.email?.trim()
  if (billing) return billing

  console.warn(
    `[leads] no notification recipient for site ${site.id} — lead saved, owner not emailed`
  )
  return null
}
