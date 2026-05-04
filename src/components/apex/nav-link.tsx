"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  /** Match exact pathname only. Defaults to true. When false, prefix-match (useful for grouping). */
  exact?: boolean
}

export function NavLink({ href, children, className, exact = true }: NavLinkProps) {
  const pathname = usePathname() ?? "/"
  const active = exact ? pathname === href : pathname.startsWith(href)
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex items-center text-[14px] font-semibold text-apx-ink transition-colors",
        "after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-center after:scale-x-0 after:bg-apx-primary after:transition-transform after:content-['']",
        "hover:text-apx-primary hover:after:scale-x-100",
        active && "text-apx-primary after:scale-x-100",
        className
      )}
    >
      {children}
    </Link>
  )
}
