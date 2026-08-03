import * as React from "react"
import Image from "next/image"

import type { GalleryLayout } from "@/lib/site-content/types"
import { DEFAULT_GALLERY_LAYOUT } from "@/lib/site-content/types"
import { Container, Display, Eyebrow, Section } from "@/components/home/primitives"

interface CustomerGalleryProps {
  gallery: string[]
  /**
   * Presentation mode. Unset falls back to DEFAULT_GALLERY_LAYOUT ("grid"),
   * which is the crowded-thumbnail look this section has always rendered.
   */
  layout?: GalleryLayout
}

/** Grid shows up to 12 thumbs; showcase trades count for size. */
const GRID_LIMIT = 12
const SHOWCASE_LIMIT = 6

export function CustomerGallery({ gallery, layout }: CustomerGalleryProps) {
  if (gallery.length === 0) return null
  const mode = layout ?? DEFAULT_GALLERY_LAYOUT
  return (
    <Section id="gallery">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>Recent work</Eyebrow>
          <Display as="h2" className="mt-5 text-3xl sm:text-4xl">
            See what we&apos;ve been up to.
          </Display>
        </div>
        {mode === "showcase" ? (
          <ShowcaseLayout gallery={gallery} />
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {gallery.slice(0, GRID_LIMIT).map((url, i) => (
              <div
                key={url}
                className="relative aspect-square overflow-hidden"
                style={{
                  background: "var(--apex-surface)",
                  borderRadius: "var(--apex-radius-md)",
                  border: "1px solid var(--apex-border)",
                }}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                  loading={i < 4 ? "eager" : "lazy"}
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}
      </Container>
    </Section>
  )
}

/**
 * Fewer, bigger, one per row. `object-contain` inside a fixed-ratio box so
 * nothing is cropped (the whole point of this mode) and nothing shifts on
 * load. The box carries no border or fill — a portrait shot sits centered
 * on the page rather than inside visible letterbox bars.
 */
function ShowcaseLayout({ gallery }: { gallery: string[] }) {
  return (
    <div className="mx-auto mt-12 max-w-4xl space-y-10 md:mt-16 md:space-y-16">
      {gallery.slice(0, SHOWCASE_LIMIT).map((url, i) => (
        <div
          key={url}
          className="relative aspect-[4/3] overflow-hidden md:aspect-[16/10]"
        >
          <Image
            src={url}
            alt=""
            fill
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-contain"
            style={{ borderRadius: "var(--apex-radius-lg)" }}
            loading={i < 2 ? "eager" : "lazy"}
            unoptimized
          />
        </div>
      ))}
    </div>
  )
}
