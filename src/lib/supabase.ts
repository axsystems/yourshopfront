import "server-only"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// =============================================================================
// Your Shopfront — typed Supabase client (server-only)
// =============================================================================
// Mirrors supabase/migrations/0001_initial.sql. Uses the service-role key,
// which bypasses RLS — never expose this client to a browser bundle. The
// `server-only` import at the top throws at build time if any file in a
// client component imports from here.
//
// We don't pass a Database generic to createClient<T>() because supabase-js
// v2's strict Database shape requires generated types. Instead we cast at
// the helper boundaries, keeping the public API of this module typed while
// staying loose internally.
// =============================================================================

export type Tier = "subscription" | "onetime"

export type SiteStatus =
  | "pending_content"
  | "awaiting_copy"
  // AI-drafted copy cycle (migration 0008). Sites with copy_addon=true
  // flow draft → review → approval → ready_to_build. Legacy
  // 'awaiting_copy' is kept for pre-AI rows that may still be in-flight.
  | "awaiting_copy_draft"
  | "awaiting_copy_review"
  | "awaiting_copy_approval"
  | "ready_to_build"
  | "provisioning"
  | "awaiting_approval"
  | "live"
  | "cancelled"
  | "refunded"
  | "failed"

/**
 * Per-site provisioning record. Persisted as JSONB in
 * sites.provisioning_state (added in migration 0003_provisioning.sql).
 * Lets the orchestrator be idempotent — re-running on a half-done site
 * skips steps already marked complete.
 */
export interface ProvisioningState {
  dns?: {
    complete: boolean
    completed_at?: string
    /** Cloudflare DNS record id, kept so we can delete on cancel. */
    record_id?: string
  }
  vercel?: {
    complete: boolean
    completed_at?: string
    /** The full hostname attached to the Vercel project. */
    domain?: string
  }
  approval_pending_at?: string
  live_at?: string
}

export interface Customer {
  id: string
  stripe_customer_id: string
  email: string
  name: string
  phone: string | null
  created_at: string
}

/**
 * Per-site onboarding step state. Persisted as JSONB in
 * sites.onboarding_state (added in migration 0002_onboarding.sql).
 * Step 1 (purchase confirmed) is intrinsic to the row existing — not
 * tracked in this object.
 */
export interface OnboardingState {
  content_sent?: { complete: boolean; completed_at?: string }
  assets_sent?: { complete: boolean; completed_at?: string }
  domain?: {
    complete: boolean
    completed_at?: string
    type?: "custom" | "subdomain"
    custom_domain?: string
  }
}

// SiteContent types + structural validator live in a client-safe module
// because both the worksheet form (client) and the customer home (server)
// need them. This module re-exports for server-side callers.
export type {
  DayHours,
  HoursMode,
  SiteContent,
  SiteContentAbout,
  SiteContentContact,
  SiteContentHero,
  SiteContentMedia,
  SiteContentReview,
  SiteContentService,
  SiteContentServiceArea,
  WeekHours,
} from "./site-content/types"
export {
  assetsAreSufficient,
  siteContentIsValid,
} from "./site-content/types"

import type { SiteContent } from "./site-content/types"
import type { Discovery, PartialSiteContent } from "./site-content/schema"

// Re-export schema-derived types so callers can import them from a single
// server-side entrypoint (mirrors the SiteContent re-exports above).
export type { Discovery, PartialSiteContent } from "./site-content/schema"

/**
 * AI-drafted copy state stored in sites.ai_copy_draft (JSONB, migration
 * 0008). Records the drafted content plus the cycle's bookkeeping fields
 * — attempt count for the 3-strike cap, operator's hand-edits applied
 * on approval, and timestamps for both approval gates.
 */
export interface AICopyDraftMeta {
  /** The drafted content from the model. */
  content: PartialSiteContent
  /** ISO timestamp of the most recent draft run. */
  draftedAt: string
  /** How many times we've drafted for this site. Hard cap at 3. */
  attemptCount: number
  /** Operator's edits, applied to `content` when they approve. */
  operatorEdits?: PartialSiteContent
  /** ISO timestamp when the operator approved (sent to customer). */
  operatorApprovedAt?: string
  /** ISO timestamp when the customer approved (flips to ready_to_build). */
  customerApprovedAt?: string
}

export interface Site {
  id: string
  customer_id: string
  stripe_session_id: string
  tier: Tier
  demo_slug: string
  business_name: string
  industry: string | null
  headline_pref: string | null
  current_website_url: string | null
  hosting_addon: boolean
  copy_addon: boolean
  status: SiteStatus
  live_url: string | null
  onboarding_state: OnboardingState
  /** Customer-authored content (worksheet output). Empty `{}` until the
   * customer starts filling in step 2 of onboarding. */
  site_content: SiteContent
  /** Set when provisioning starts; unique across all sites. */
  provision_slug: string | null
  provisioning_state: ProvisioningState
  /** Populated when status='failed'. Plain text for ops. */
  failure_reason: string | null
  /** Customer's raw answers to the 5-fact discovery form. Null until
   * the customer submits. Persisted separately from site_content so we
   * keep an audit trail of what they told us vs what got drafted. */
  discovery_answers: Discovery | null
  /** AI draft + cycle bookkeeping. Null until the first draft attempt. */
  ai_copy_draft: AICopyDraftMeta | null
  created_at: string
  updated_at: string
}

export interface NewCustomer {
  stripe_customer_id: string
  email: string
  name: string
  phone?: string | null
}

export interface NewSite {
  id?: string
  customer_id: string
  stripe_session_id: string
  tier: Tier
  demo_slug: string
  business_name: string
  industry?: string | null
  headline_pref?: string | null
  current_website_url?: string | null
  hosting_addon?: boolean
  copy_addon?: boolean
  status?: SiteStatus
  live_url?: string | null
}

let cached: SupabaseClient | null = null

/**
 * Lazily-instantiated server-side Supabase client. Throws at first call
 * (request time) if env vars are missing — `next build` doesn't trip on
 * this because nothing at module-init touches process.env.
 */
export function supabase(): SupabaseClient {
  if (cached) return cached
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      "supabase(): SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in env"
    )
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}

// -----------------------------------------------------------------------------
// Customers
// -----------------------------------------------------------------------------

export async function getCustomerByStripeId(
  stripeCustomerId: string
): Promise<Customer | null> {
  const { data, error } = await supabase()
    .from("customers")
    .select("*")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle()
  if (error) throw error
  return (data as Customer | null) ?? null
}

export async function createCustomer(input: NewCustomer): Promise<Customer> {
  const { data, error } = await supabase()
    .from("customers")
    .insert(input)
    .select("*")
    .single()
  if (error) throw error
  return data as Customer
}

/**
 * Insert-or-fetch by stripe_customer_id. Used by the Stripe webhook to
 * survive idempotent retries — Stripe sends checkout.session.completed
 * more than once in some failure modes.
 */
export async function getOrCreateCustomer(input: NewCustomer): Promise<Customer> {
  const existing = await getCustomerByStripeId(input.stripe_customer_id)
  if (existing) return existing
  return createCustomer(input)
}

// -----------------------------------------------------------------------------
// Sites
// -----------------------------------------------------------------------------

export async function getSiteByStripeSessionId(
  stripeSessionId: string
): Promise<Site | null> {
  const { data, error } = await supabase()
    .from("sites")
    .select("*")
    .eq("stripe_session_id", stripeSessionId)
    .maybeSingle()
  if (error) throw error
  return (data as Site | null) ?? null
}

export async function createSite(input: NewSite): Promise<Site> {
  const { data, error } = await supabase()
    .from("sites")
    .insert(input)
    .select("*")
    .single()
  if (error) throw error
  return data as Site
}

export async function updateSiteStatus(
  id: string,
  status: SiteStatus
): Promise<void> {
  const { error } = await supabase()
    .from("sites")
    .update({ status })
    .eq("id", id)
  if (error) throw error
}

export async function getSiteById(id: string): Promise<Site | null> {
  const { data, error } = await supabase()
    .from("sites")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  return (data as Site | null) ?? null
}

/**
 * Looks up a site by its provision_slug — the host segment used on
 * yourshopfront.com subdomains. Returns null if no match. Used by the
 * multi-tenant tenant page at /_tenant to resolve hostname → site.
 */
export async function getSiteByProvisionSlug(
  provisionSlug: string
): Promise<Site | null> {
  const { data, error } = await supabase()
    .from("sites")
    .select("*")
    .eq("provision_slug", provisionSlug)
    .maybeSingle()
  if (error) throw error
  return (data as Site | null) ?? null
}

/**
 * Replaces the entire onboarding_state JSONB. Callers should read the
 * existing state, merge in their patch, and pass the full new object.
 * Done this way (vs. jsonb_set in SQL) because supabase-js doesn't
 * expose Postgres JSONB operators directly.
 */
export async function updateOnboardingState(
  id: string,
  state: OnboardingState
): Promise<Site> {
  const { data, error } = await supabase()
    .from("sites")
    .update({ onboarding_state: state })
    .eq("id", id)
    .select("*")
    .single()
  if (error) throw error
  return data as Site
}

/**
 * Convenience: returns true when all three user-actionable steps are
 * marked complete in onboarding_state.
 */
export function isOnboardingComplete(state: OnboardingState): boolean {
  return Boolean(
    state.content_sent?.complete &&
      state.assets_sent?.complete &&
      state.domain?.complete
  )
}

/**
 * Replaces the entire site_content JSONB. Same merge-then-write pattern as
 * the other JSONB updaters — callers fetch, merge, and write the full
 * object back.
 */
export async function updateSiteContent(
  id: string,
  content: SiteContent
): Promise<Site> {
  const { data, error } = await supabase()
    .from("sites")
    .update({ site_content: content })
    .eq("id", id)
    .select("*")
    .single()
  if (error) throw error
  return data as Site
}

// -----------------------------------------------------------------------------
// Provisioning (Phase 5)
// -----------------------------------------------------------------------------

/**
 * Returns sites with the given status, oldest first. Used by the cron to
 * pick up `ready_to_build` and `provisioning` sites in the order they
 * became eligible. Limit caps the per-tick batch size so a single cron
 * invocation can't blow the function timeout.
 */
export async function getSitesByStatus(
  status: SiteStatus | SiteStatus[],
  limit = 5
): Promise<Site[]> {
  const list = Array.isArray(status) ? status : [status]
  const { data, error } = await supabase()
    .from("sites")
    .select("*")
    .in("status", list)
    .order("created_at", { ascending: true })
    .limit(limit)
  if (error) throw error
  return (data as Site[] | null) ?? []
}

export async function setProvisionSlug(
  id: string,
  provisionSlug: string
): Promise<void> {
  const { error } = await supabase()
    .from("sites")
    .update({ provision_slug: provisionSlug })
    .eq("id", id)
  if (error) throw error
}

/**
 * Replaces the entire provisioning_state JSONB. Same merge-then-write
 * pattern as updateOnboardingState.
 */
export async function updateProvisioningState(
  id: string,
  state: ProvisioningState
): Promise<Site> {
  const { data, error } = await supabase()
    .from("sites")
    .update({ provisioning_state: state })
    .eq("id", id)
    .select("*")
    .single()
  if (error) throw error
  return data as Site
}

export async function setLiveUrl(id: string, liveUrl: string): Promise<void> {
  const { error } = await supabase()
    .from("sites")
    .update({ live_url: liveUrl })
    .eq("id", id)
  if (error) throw error
}

export async function markFailed(id: string, reason: string): Promise<void> {
  const { error } = await supabase()
    .from("sites")
    .update({ status: "failed" as SiteStatus, failure_reason: reason })
    .eq("id", id)
  if (error) throw error
}

/**
 * Atomic-ish status transition guard. Updates only when current status
 * matches `from` — used by the orchestrator to avoid stomping a site
 * that another cron invocation is already working on.
 *
 * Returns true if the row was updated, false if no row matched (already
 * progressed). Supabase doesn't expose row-count directly via the JS
 * client, so we select the updated row and check.
 */
export async function transitionStatus(
  id: string,
  from: SiteStatus,
  to: SiteStatus
): Promise<boolean> {
  const { data, error } = await supabase()
    .from("sites")
    .update({ status: to })
    .eq("id", id)
    .eq("status", from)
    .select("id")
  if (error) throw error
  return Array.isArray(data) && data.length > 0
}
