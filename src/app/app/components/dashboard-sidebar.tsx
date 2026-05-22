"use client"

import { useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileEdit, CreditCard, User, X } from "lucide-react"

import { Logo } from "@/components/apex/logo"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>
  disabled?: boolean
  disabledLabel?: string
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/app",
    icon: Home,
  },
  {
    label: "Edit Requests",
    href: "/app/edit-requests",
    icon: FileEdit,
  },
  {
    label: "Billing",
    href: "/app/billing",
    icon: CreditCard,
  },
  {
    label: "Account",
    href: "/app/account",
    icon: User,
    disabled: true,
    disabledLabel: "Coming soon",
  },
]

interface DashboardSidebarProps {
  email: string
  isOpen: boolean
  onClose: () => void
}

export function DashboardSidebar({ email, isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)

  // Focus the close button when drawer opens on mobile
  useEffect(() => {
    if (isOpen) {
      // Brief delay to let the drawer animate into position
      const id = setTimeout(() => closeButtonRef.current?.focus(), 50)
      return () => clearTimeout(id)
    }
  }, [isOpen])

  // ESC closes the drawer
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    },
    [isOpen, onClose]
  )

  // Focus trap inside the sidebar while open on mobile
  const handleTabKey = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen || !sidebarRef.current || e.key !== "Tab") return
      const focusable = sidebarRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    [isOpen]
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keydown", handleTabKey)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("keydown", handleTabKey)
    }
  }, [handleKeyDown, handleTabKey])

  // Prevent body scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        ref={sidebarRef}
        id="dashboard-sidebar"
        aria-label="Dashboard navigation"
        className={cn(
          // Base layout
          "flex h-full w-64 flex-shrink-0 flex-col bg-apx-paper",
          // Desktop: static in flow
          "md:static md:translate-x-0 md:border-r md:border-apx-line",
          // Mobile: fixed drawer that slides in from left
          "fixed inset-y-0 left-0 z-50 md:z-auto",
          "transition-transform duration-200 ease-in-out md:transition-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-apx-line px-5">
          <Logo size="sm" />
          {/* Close button — mobile only */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-apx-mute transition-colors hover:bg-apx-tint hover:text-apx-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apx-primary md:hidden"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Nav */}
        <nav aria-label="Dashboard" className="flex-1 overflow-y-auto px-3 py-4">
          <ul role="list" className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => {
              // Exact match for /app, prefix match for sub-routes
              const isActive =
                item.href === "/app"
                  ? pathname === "/app"
                  : pathname.startsWith(item.href)

              if (item.disabled) {
                return (
                  <li key={item.href}>
                    <div
                      title={item.disabledLabel}
                      aria-disabled="true"
                      className="group flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-apx-soft select-none"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" aria-hidden />
                      <span>{item.label}</span>
                      <span className="ml-auto rounded-full bg-apx-tint px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-apx-soft">
                        Soon
                      </span>
                    </div>
                  </li>
                )
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apx-primary focus-visible:ring-offset-1",
                      isActive
                        ? "bg-apx-primary-soft text-apx-primary-ink"
                        : "text-apx-mute hover:bg-apx-tint hover:text-apx-ink"
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" aria-hidden />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer: email + sign out */}
        <div className="border-t border-apx-line px-5 py-4">
          <p className="truncate text-xs text-apx-soft" title={email}>
            {email}
          </p>
          {/* STREAM-A-DEPENDENCY: replace href with real sign-out action once
              auth foundation merges. Stream A will ship POST /auth/signout. */}
          <Link
            href="/login"
            className="mt-2 inline-flex items-center text-xs font-medium text-apx-mute underline-offset-2 transition-colors hover:text-apx-danger hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apx-primary focus-visible:ring-offset-1 rounded"
          >
            Sign out
          </Link>
        </div>
      </aside>

    </>
  )
}
