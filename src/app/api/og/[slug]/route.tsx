import { ImageResponse } from "next/og"

import { previewHeadlineShort } from "@/lib/seo-headlines"
import { defaultTheme, getTheme } from "@/lib/themes"
import type { FontFamily } from "@/lib/themes/types"

export const runtime = "edge"

interface RouteContext {
  params: Promise<{ slug: string }>
}

const SIZE = { width: 1200, height: 630 }

// Fontsource CDN serves TTF binaries directly — Satori (which next/og uses
// under the hood) can't decode woff2 from the Google Fonts CSS endpoint, so
// we go to Fontsource for an uncompressed format.
//
// Pattern: https://cdn.jsdelivr.net/npm/@fontsource/{key}/files/{key}-latin-{weight}-normal.ttf
const FONTSOURCE_KEY: Record<FontFamily, string> = {
  inter: "inter",
  "archivo-black": "archivo-black",
  fraunces: "fraunces",
  "bricolage-grotesque": "bricolage-grotesque",
  "plus-jakarta-sans": "plus-jakarta-sans",
  oswald: "oswald",
  "playfair-display": "playfair-display",
  "jetbrains-mono": "jetbrains-mono",
  caveat: "caveat",
}

const DISPLAY_NAME: Record<FontFamily, string> = {
  inter: "Inter",
  "archivo-black": "Archivo Black",
  fraunces: "Fraunces",
  "bricolage-grotesque": "Bricolage Grotesque",
  "plus-jakarta-sans": "Plus Jakarta Sans",
  oswald: "Oswald",
  "playfair-display": "Playfair Display",
  "jetbrains-mono": "JetBrains Mono",
  caveat: "Caveat",
}

// Weight to fetch for the OG headline. Variable fonts on Fontsource ship
// individual weight files; pick a heavy one for impact. Archivo Black only
// ships at 400 (it IS the heavy weight by design).
const FONT_WEIGHT: Record<FontFamily, number> = {
  inter: 800,
  "archivo-black": 400,
  fraunces: 700,
  "bricolage-grotesque": 800,
  "plus-jakarta-sans": 800,
  oswald: 700,
  "playfair-display": 800,
  "jetbrains-mono": 700,
  caveat: 700,
}

async function fetchFontTtf(family: FontFamily): Promise<ArrayBuffer | null> {
  try {
    const key = FONTSOURCE_KEY[family]
    const weight = FONT_WEIGHT[family]
    const url = `https://cdn.jsdelivr.net/npm/@fontsource/${key}/files/${key}-latin-${weight}-normal.ttf`
    const res = await fetch(url)
    if (!res.ok) return null
    return await res.arrayBuffer()
  } catch {
    return null
  }
}

export async function GET(_req: Request, ctx: RouteContext) {
  const { slug } = await ctx.params
  const theme = slug === "default" ? defaultTheme : getTheme(slug) ?? defaultTheme

  const displayFontName = DISPLAY_NAME[theme.fonts.display]
  const displayFontData = await fetchFontTtf(theme.fonts.display)

  const headline =
    slug === "default"
      ? "Websites that book more jobs."
      : previewHeadlineShort(theme)

  const headlineFontFamily = displayFontData
    ? `"${displayFontName}", system-ui, sans-serif`
    : "system-ui, sans-serif"

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
          fontFamily: "system-ui, sans-serif",
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
          Your Shopfront · {theme.name}
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
              fontSize: 70,
              lineHeight: 0.98,
              fontWeight: theme.fonts.display === "archivo-black" ? 400 : 800,
              letterSpacing: "-0.025em",
              margin: 0,
              maxWidth: "94%",
              color: theme.colors.fg,
              fontFamily: headlineFontFamily,
            }}
          >
            {headline}
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
    {
      ...SIZE,
      fonts: displayFontData
        ? [
            {
              name: displayFontName,
              data: displayFontData,
              weight: FONT_WEIGHT[theme.fonts.display] as 400 | 700 | 800,
              style: "normal",
            },
          ]
        : undefined,
    }
  )
}
