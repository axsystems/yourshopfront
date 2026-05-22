// STREAM-A-DEPENDENCY: remove this entire stub block and replace the
// requireAuth() call below with:
//   import { requireAuth } from "@/lib/auth"
// once the auth foundation branch merges. The stub redirects to /login
// unconditionally so this layout is non-functional until that merge.
import { redirect } from "next/navigation"
import type { Customer } from "@/lib/supabase"

type StubUser = { id: string; email: string }

async function requireAuth(): Promise<{ user: StubUser; customer: Customer }> {
  redirect("/login")
  // TypeScript needs this to see the return type; redirect() throws at runtime.
  throw new Error("unreachable")
}
// END STREAM-A-DEPENDENCY STUB

import { DashboardShell } from "./components/dashboard-shell"

interface DashboardLayoutProps {
  children: React.ReactNode
}

/**
 * Protected layout for all /app/* routes. Server component — renders auth
 * check at the top, then hands off to the DashboardShell client component
 * which owns sidebar state.
 *
 * Child pages (server components) are rendered inside the shell's {children}
 * slot, so they also benefit from the auth guard.
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Auth check. On the stub branch this redirects to /login.
  // After Stream A merges: returns { user, customer } for the session.
  const { customer } = await requireAuth()

  return (
    <DashboardShell email={customer.email}>
      {children}
    </DashboardShell>
  )
}
