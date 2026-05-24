import "server-only"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// =============================================================================
// Your Shopfront — SSR Supabase client (anon key, cookie-backed)
// =============================================================================
// Use this client for auth operations that read/write the user session.
// It uses the PUBLIC anon key (safe for the browser session boundary) plus
// the @supabase/ssr cookie adapter so Next.js 16 Server Components and
// Route Handlers can read and refresh the auth token automatically.
//
// DO NOT use this for privileged DB operations — use the service-role client
// in src/lib/supabase.ts for that. The anon key is subject to RLS.
// =============================================================================

/**
 * Async factory that returns a Supabase client wired to the Next.js cookie
 * store. Must be called inside a Server Component, Server Action, or Route
 * Handler — it cannot be called from a Client Component.
 *
 * The `setAll` path swallows errors silently because Server Components
 * can't set cookies; cookie mutation only succeeds from Route Handlers and
 * Server Actions. The proxy (proxy.ts) is responsible for refreshing the
 * token on every request so Server Components always see a fresh session.
 */
export async function supabaseServer() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component context — cookies are read-only here.
            // Token refresh is handled by proxy.ts on every request.
          }
        },
      },
    }
  )
}
