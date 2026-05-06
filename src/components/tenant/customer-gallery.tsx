import * as React from "react"
import Image from "next/image"

import { Container, Display, Eyebrow, Section } from "@/components/home/primitives"

interface CustomerGalleryProps {
  gallery: string[]
}

export function CustomerGallery({ gallery }: CustomerGalleryProps) {
  if (gallery.length === 0) return null
  return (
    <Section id="gallery">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>Recent work</Eyebrow>
          <Display as="h2" className="mt-5 text-3xl sm:text-4xl">
            See what we&apos;ve been up to.
          </Display>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {gallery.slice(0, 12).map((url, i) => (
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
      </Container>
    </Section>
  )
}
