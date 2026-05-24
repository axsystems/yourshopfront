"use client"

import { useState, useRef, useCallback } from "react"
import { Menu } from "lucide-react"

import { DashboardSidebar } from "./dashboard-sidebar"

interface DashboardShellProps {
  email: string
  children: React.ReactNode
}

/**
 * Client shell that owns sidebar open/close state. Wraps children in the
 * full dashboard chrome. Separated from the server layout so the layout can
 * stay a pure server component.
 */
export function DashboardShell({ email, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const hamburgerRef = useRef<HTMLButtonElement>(null)

  const openSidebar = useCallback(() => setSidebarOpen(true), [])
  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
    // Return focus to hamburger after drawer closes
    hamburgerRef.current?.focus()
  }, [])

  return (
    // Full-height flex container: sidebar | content
    <div className="flex min-h-screen bg-apx-tint">
      {/* Sidebar (handles its own mobile/desktop rendering) */}
      <DashboardSidebar
        email={email}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header — mobile only (hamburger) */}
        <header className="flex h-16 flex-shrink-0 items-center gap-3 border-b border-apx-line bg-apx-paper px-4 md:hidden">
          <button
            ref={hamburgerRef}
            type="button"
            onClick={openSidebar}
            aria-label="Open navigation"
            aria-expanded={sidebarOpen}
            aria-controls="dashboard-sidebar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-apx-mute transition-colors hover:bg-apx-tint hover:text-apx-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apx-primary"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <span className="text-sm font-semibold text-apx-ink">Your Shopfront</span>
        </header>

        {/* Page content */}
        <main id="main" className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
