import "server-only"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// =============================================================================
// Apex Sites — typed Supabase client (server-only)
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
  | "ready_to_build"
  | "awaiting_approval"
  | "live"
  | "cancelled"
  | "refunded"

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
  status: SiteStatus
  live_url: string | null
  onboarding_state: OnboardingState
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
