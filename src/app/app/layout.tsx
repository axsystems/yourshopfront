import { requireAuth } from "@/lib/auth"

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
  const { customer } = await requireAuth()

  return (
    <DashboardShell email={customer.email}>
      {children}
    </DashboardShell>
  )
}
