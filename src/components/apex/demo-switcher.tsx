"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

import { themeList, defaultThemeSlug } from "@/lib/themes"
import { cn } from "@/lib/utils"

export function DemoSwitcher() {
  const pathname = usePathname()
  const match = pathname?.match(/^\/demos\/([^/]+)/)
  const activeSlug = match ? match[1] : null
  const onDemoPage = !!activeSlug
  const onHome = pathname === "/"
  const [collapsed, setCollapsed] = React.useState(false)

  if (!onHome && !onDemoPage) return null

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-lg transition hover:translate-y-[-1px]"
      >
        <span className="flex gap-1">
          {themeList.slice(0, 4).map((t) => (
            <span
              key={t.slug}
              className="h-2 w-2 rounded-full"
              style={{ background: t.colors.primary }}
            />
          ))}
        </span>
        Browse demos
      </button>
    )
  }

  return (
    <div
      className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur"
      data-demo-switcher
    >
      <div className="mx-auto flex max-w-[1500px] items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-5">
        <Link
          href="/"
          className="flex flex-shrink-0 items-center gap-1.5 text-sm font-bold tracking-tight text-neutral-900 hover:opacity-70"
        >
          <span className="grid h-7 w-7 place-items-center rounded bg-neutral-900 text-xs font-black text-white">
            A
          </span>
          <span className="hidden sm:inline">Apex Sites</span>
        </Link>
        <div className="hidden h-5 w-px flex-shrink-0 bg-neutral-200 sm:block" />
        <div
          className="-mx-1 flex flex-1 items-center gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Demo theme switcher"
        >
          <Link
            href="/"
            className={cn(
              "flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition hover:bg-neutral-100",
              !activeSlug && "bg-neutral-900 text-white hover:bg-neutral-800"
            )}
          >
            Default
          </Link>
          {themeList.map((t) => {
            const active = activeSlug === t.slug
            return (
              <Link
                key={t.slug}
                href={`/demos/${t.slug}`}
                className={cn(
                  "flex flex-shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold transition hover:bg-neutral-100",
                  active && "bg-neutral-900 text-white hover:bg-neutral-800"
                )}
                aria-current={active ? "true" : undefined}
                title={t.name}
              >
                <span
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ background: t.colors.primary }}
                  aria-hidden
                />
                <span className="hidden whitespace-nowrap md:inline">{t.name}</span>
                <span className="md:hidden">{t.industry}</span>
              </Link>
            )
          })}
        </div>
        {onDemoPage && (
          <Link
            href={`/checkout?tier=subscription&demo=${activeSlug}`}
            className="hidden flex-shrink-0 items-center gap-1.5 rounded-full bg-neutral-900 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-neutral-800 sm:inline-flex"
          >
            I want this look
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          aria-label="Hide demo switcher"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {onDemoPage && (
        <div className="border-t border-amber-200/60 bg-amber-50">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-3 py-2 text-xs sm:px-5">
            <p className="flex items-center gap-2 font-medium text-amber-900">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-amber-500 text-[10px] font-black text-white">
                !
              </span>
              <span className="hidden sm:inline">You&apos;re previewing the </span>
              <span className="font-bold">
                {themeList.find((t) => t.slug === activeSlug)?.name ?? "demo"}
              </span>
              <span> style.</span>
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="hidden items-center gap-1 font-semibold text-amber-900 hover:underline sm:inline-flex"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back to default
              </Link>
              <Link
                href={`/checkout?tier=subscription&demo=${activeSlug}`}
                className="inline-flex items-center gap-1 rounded-full bg-amber-900 px-3 py-1 font-bold text-amber-50 hover:bg-amber-800 sm:hidden"
              >
                Pick this →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

DemoSwitcher.defaultSlug = defaultThemeSlug
