import { notFound } from "next/navigation"

import { ThemeProvider } from "@/components/theme-provider"
import { themeList } from "@/lib/themes"

export const dynamic = "force-static"

export default function DevThemesPage() {
  if (process.env.NODE_ENV === "production") notFound()
  return (
    <main className="min-h-screen bg-neutral-100 p-8">
      <header className="mx-auto mb-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-neutral-900">Apex theme preview</h1>
        <p className="mt-2 text-sm text-neutral-600">
          {themeList.length} themes. Each card renders inside a ThemeProvider — visually verify
          colors, fonts, radii, button shapes are distinct.
        </p>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-3">
        {themeList.map((theme) => (
          <section
            key={theme.slug}
            className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
          >
            <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-3">
              <p className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                {theme.slug}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-neutral-900">{theme.name}</p>
              <p className="text-xs text-neutral-500">
                {theme.vibe} · {theme.mode} · {theme.hero}
              </p>
            </div>
            <ThemeProvider theme={theme} className="!min-h-0 p-6">
              <div className="space-y-4">
                <p
                  className="text-xs uppercase tracking-[0.2em]"
                  style={{ color: "var(--apex-accent)" }}
                >
                  {theme.heroEyebrow}
                </p>
                <h2
                  className="text-3xl leading-[0.95]"
                  style={{
                    fontFamily: "var(--apex-font-display)",
                    fontWeight: 700,
                    color: "var(--apex-fg)",
                  }}
                >
                  Apex Sites in the {theme.name} style.
                </h2>
                <p className="text-sm" style={{ color: "var(--apex-muted-fg)" }}>
                  {theme.tagline}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    style={{
                      background: "var(--apex-primary)",
                      color: "var(--apex-primary-fg)",
                      borderRadius: "var(--apex-radius-md)",
                      fontFamily: "var(--apex-font-display)",
                      padding: "12px 20px",
                      fontWeight: theme.button.weight === "heavy" ? 800 : 600,
                      textTransform: theme.button.uppercase ? "uppercase" : "none",
                      letterSpacing: theme.button.uppercase ? "0.04em" : "0",
                      border: "none",
                      cursor: "pointer",
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
                      borderRadius: "var(--apex-radius-md)",
                      fontFamily: "var(--apex-font-body)",
                      padding: "12px 20px",
                      fontWeight: 600,
                      cursor: "pointer",
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
                  ].map((c) => (
                    <div
                      key={c}
                      title={c}
                      className="h-8 w-8 rounded border"
                      style={{ background: c, borderColor: theme.colors.border }}
                    />
                  ))}
                </div>
              </div>
            </ThemeProvider>
          </section>
        ))}
      </div>
    </main>
  )
}
