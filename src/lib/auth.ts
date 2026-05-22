import "server-only"

import { redirect } from "next/navigation"

import { supabaseServer } from "./supabase-server"
import { supabase as supabaseAdmin, type Customer } from "./supabase"

// =============================================================================
// Your Shopfront — server-side auth helpers
// =============================================================================
// All helpers use supabase.auth.getUser() — never getSession().
// getUser() makes a network call to the Supabase auth server to verify the
// JWT, which is required for authorization. getSession() only reads the
// cookie and does NOT verify against the server — unsafe for access control.
// =============================================================================

/**
 * Returns the currently authenticated Supabase user, or null if the session
 * is missing or expired. Safe to call from any Server Component or Route
 * Handler. Does NOT redirect.
 */
export async function getCurrentUser() {
  const sb = await supabaseServer()
  const {
    data: { user },
  } = await sb.auth.getUser()
  return user
}

/**
 * Enforces auth + customer-row existence. Call at the top of any dashboard
 * Server Component or Route Handler that requires a logged-in customer.
 *
 * Redirects to /login if the user is not authenticated.
 * Redirects to /login?error=no_customer if the user is authenticated but has
 * no matching customers row (hasn't purchased yet, or used a different email).
 *
 * Returns the verified Supabase user and the linked Customer row together so
 * the caller never needs to do the lookup itself.
 */
export async function requireAuth(): Promise<{
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>
  customer: Customer
}> {
  const user = await getCurrentUser()

  if (!user || !user.email) {
    redirect("/login")
  }

  // Use the service-role RPC so RLS doesn't block the lookup.
  // get_customer_by_email is SECURITY DEFINER and revoked from
  // public/anon/authenticated — only the service role can call it.
  const { data, error } = await supabaseAdmin().rpc("get_customer_by_email", {
    p_email: user.email,
  })

  if (error || !data) {
    // Authenticated but no customer row — they haven't purchased.
    redirect("/login?error=no_customer")
  }

  return { user, customer: data as Customer }
}
