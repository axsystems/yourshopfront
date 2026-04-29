import { ImageResponse } from "next/og"

import { defaultTheme, getTheme } from "@/lib/themes"

export const runtime = "edge"

interface RouteContext {
  params: Promise<{ slug: string }>
}

const SIZE = { width: 1200, height: 630 }

export async function GET(_req: Request, ctx: RouteContext) {
  const { slug } = await ctx.params
  const theme = slug === "default" ? defaultTheme : getTheme(slug) ?? defaultTheme

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: theme.colors.bg,
          color: theme.colors.fg,
          padding: "72px",
          fontFamily: "Inter, system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: theme.colors.mutedFg,
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              background: theme.colors.fg,
              color: theme.colors.bg,
              fontSize: 22,
              fontWeight: 900,
            }}
          >
            A
          </span>
          Apex Sites · {theme.name}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
            gap: 24,
          }}
        >
          <span
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "6px 18px",
              background: theme.colors.primary,
              color: theme.colors.primaryFg,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              borderRadius: theme.radius.pill,
            }}
          >
            {theme.heroEyebrow}
          </span>
          <p
            style={{
              fontSize: 84,
              lineHeight: 0.96,
              fontWeight: 800,
              letterSpacing: "-0.025em",
              margin: 0,
              maxWidth: "90%",
              color: theme.colors.fg,
            }}
          >
            {slug === "default"
              ? "Websites that book home-service jobs."
              : `Apex Sites in the ${theme.name} style.`}
          </p>
          <p
            style={{
              fontSize: 26,
              lineHeight: 1.35,
              color: theme.colors.mutedFg,
              maxWidth: "82%",
              margin: 0,
            }}
          >
            {theme.tagline}
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            top: 72,
            right: 72,
            display: "flex",
            gap: 10,
          }}
        >
          {[theme.colors.primary, theme.colors.accent, theme.colors.fg, theme.colors.muted].map(
            (c) => (
              <span
                key={c}
                style={{
                  width: 28,
                  height: 28,
                  background: c,
                  border: `2px solid ${theme.colors.border}`,
                }}
              />
            )
          )}
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 8,
            background: theme.colors.primary,
          }}
        />
      </div>
    ),
    SIZE
  )
}

