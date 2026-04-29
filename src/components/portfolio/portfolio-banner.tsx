import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

import type { Theme } from "@/lib/themes/types"

export function PortfolioBanner({ theme }: { theme: Theme }) {
  const isOption = theme.isThemeOption
  return (
    <div
      className="border-b"
      style={{
        background: isOption ? "#064E3B" : "#7C2D12",
        color: "#FFFFFF",
        borderColor: isOption ? "#065F46" : "#9A3412",
      }}
    >
      <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex flex-none items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
            style={{
              background: isOption ? "#10B981" : "#F59E0B",
              color: isOption ? "#052E1A" : "#451A03",
            }}
          >
            {isOption ? "Theme option" : "Custom build"}
          </span>
          <p className="leading-snug">
            {isOption ? "Previewing demo" : "Showcase piece"}:{" "}
            <strong className="font-bold">{theme.name}</strong>
            <span className="ml-2 hidden text-white/70 sm:inline">
              — {isOption ? "available as a theme option" : "available as a fully-custom build"}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white/85 hover:text-white hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            See all portfolio
          </Link>
          {isOption ? (
            <Link
              href={`/checkout?tier=subscription&demo=${theme.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-emerald-950 transition hover:-translate-y-0.5"
            >
              I want this look
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <Link
              href={`/contact?ref=portfolio&piece=${theme.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-4 py-1.5 text-xs font-bold text-amber-950 transition hover:-translate-y-0.5"
            >
              Get a custom quote
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
