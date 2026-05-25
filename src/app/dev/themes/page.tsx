import { notFound } from "next/navigation"

import { ThemeProvider } from "@/components/theme-provider"
import { allThemes } from "@/lib/themes"
import type { Theme } from "@/lib/themes/types"

export const dynamic = "force-static"

/**
 * NOTE on path: spec asked for `_dev/themes/page.tsx`, but Next.js App Router
 * treats `_`-prefixed folders as private (excluded from routing) — the page
 * would be unreachable in any environment. This route lives at /dev/themes
 * and is gated behind NODE_ENV !== 'production' below.
 */
export default function DevThemesPage() {
  if (process.env.NODE_ENV === "production") notFound()
  const themes = Object.values(allThemes)
  const byRound: Record<1 | 2 | 3, Theme[]> = {
    1: themes.filter((t) => t.round === 1),
    2: themes.filter((t) => t.round === 2),
    3: themes.filter((t) => t.round === 3),
  }
  const optionsCount = themes.filter((t) => t.isThemeOption).length
  const portfolioCount = themes.filter((t) => !t.isThemeOption).length
  return (
    <main className="min-h-screen bg-neutral-100 p-8">
      <header className="mx-auto mb-10 max-w-7xl">
        <h1 className="text-3xl font-bold text-neutral-900">Your Shopfront theme audit</h1>
        <p className="mt-2 text-sm text-neutral-600">
          {themes.length} themes · {optionsCount} switchable options ·{" "}
          {portfolioCount} portfolio pieces. Visually verify each theme&apos;s
          colors, fonts, radii, button shapes are distinct. Themes marked{" "}
          <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            option
          </span>{" "}
          are offered as homepage theme swaps.
        </p>
      </header>
      {[3, 1, 2].map((round) => {
        const list = byRound[round as 1 | 2 | 3]
        return (
          <section key={round} className="mx-auto mb-14 max-w-7xl">
            <header className="mb-5 flex items-baseline gap-3 border-b border-neutral-300 pb-3">
              <h2 className="text-xl font-bold text-neutral-900">Round {round}</h2>
              <p className="text-xs text-neutral-500">
                {round === 3 && "Home-service brand demos (8 themes — all options)"}
                {round === 1 && "Abstract concept explorations (8 themes — 2 options, 6 portfolio)"}
                {round === 2 && "Brand-personality explorations (8 themes — 8 portfolio)"}
              </p>
            </header>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {list.map((theme) => (
                <ThemeSwatch key={theme.slug} theme={theme} />
              ))}
            </div>
          </section>
        )
      })}
    </main>
  )
}

function ThemeSwatch({ theme }: { theme: Theme }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-start justify-between border-b border-neutral-200 bg-neutral-50 px-5 py-3">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-neutral-500">
            {theme.slug}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-neutral-900">{theme.name}</p>
          <p className="text-xs text-neutral-500">
            {theme.vibe} · {theme.mode} · {theme.hero}
          </p>
        </div>
        {theme.isThemeOption ? (
          <span className="flex-none rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Option
          </span>
        ) : (
          <span className="flex-none rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-700">
            Portfolio
          </span>
        )}
      </div>
      <ThemeProvider theme={theme} className="!min-h-0 p-6">
        <div className="space-y-4">
          <p
            className="text-xs uppercase tracking-[0.2em]"
            style={{ color: "var(--apex-accent)" }}
          >
            {theme.heroEyebrow}
          </p>
          <h3
            className="text-2xl leading-[0.95]"
            style={{
              fontFamily: "var(--apex-font-display)",
              fontWeight: 700,
              color: "var(--apex-fg)",
            }}
          >
            Your Shopfront in the {theme.name} style.
          </h3>
          <p className="text-sm" style={{ color: "var(--apex-muted-fg)" }}>
            {theme.tagline}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              style={{
                background: "var(--apex-primary)",
                color: "var(--apex-primary-fg)",
                borderRadius:
                  theme.button.shape === "pill"
                    ? "var(--apex-radius-pill)"
                    : theme.button.shape === "sharp"
                      ? "var(--apex-radius-sm)"
                      : "var(--apex-radius-md)",
                fontFamily: "var(--apex-font-display)",
                padding: "10px 18px",
                fontWeight: theme.button.weight === "heavy" ? 800 : 600,
                textTransform: theme.button.uppercase ? "uppercase" : "none",
                letterSpacing: theme.button.uppercase ? "0.04em" : "0",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Get a quote
            </button>
            <button
              type="button"
              style={{
                background: "transparent",
                color: "var(--apex-fg)",
                border: "1.5px solid var(--apex-fg)",
                borderRadius:
                  theme.button.shape === "pill"
                    ? "var(--apex-radius-pill)"
                    : "var(--apex-radius-md)",
                fontFamily: "var(--apex-font-body)",
                padding: "10px 18px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              See pricing
            </button>
          </div>
          <div className="flex gap-2 pt-3">
            {[
              theme.colors.bg,
              theme.colors.fg,
              theme.colors.primary,
              theme.colors.accent,
              theme.colors.muted,
              theme.colors.surface,
            ].map((c, i) => (
              <div
                key={`${c}-${i}`}
                title={c}
                className="h-7 w-7 rounded border"
                style={{ background: c, borderColor: theme.colors.border || "#0001" }}
              />
            ))}
          </div>
        </div>
      </ThemeProvider>
    </section>
  )
}
