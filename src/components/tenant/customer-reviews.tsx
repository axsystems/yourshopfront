import * as React from "react"
import { Star } from "lucide-react"

import type { SiteContentReview } from "@/lib/site-content/types"
import { Container, Display, Eyebrow, Section } from "@/components/home/primitives"

interface CustomerReviewsProps {
  reviews: SiteContentReview[]
}

export function CustomerReviews({ reviews }: CustomerReviewsProps) {
  return (
    <Section id="reviews">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>What customers say</Eyebrow>
          <Display as="h2" className="mt-5 text-3xl sm:text-4xl">
            Reviews.
          </Display>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 6).map((r, i) => (
            <article
              key={`${r.author}-${i}`}
              className="flex flex-col p-6"
              style={{
                background: "var(--apex-surface)",
                color: "var(--apex-surface-fg)",
                border: "1px solid var(--apex-border)",
                borderRadius: "var(--apex-radius-lg)",
              }}
            >
              {typeof r.rating === "number" ? (
                <div className="flex gap-0.5" aria-label={`${r.rating} out of 5`}>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className="h-4 w-4"
                      strokeWidth={2}
                      fill={idx < r.rating! ? "currentColor" : "none"}
                      style={{ color: "var(--apex-primary)" }}
                      aria-hidden
                    />
                  ))}
                </div>
              ) : null}
              <p className="mt-3 flex-1 text-sm leading-relaxed">
                &ldquo;{r.body}&rdquo;
              </p>
              <p
                className="mt-4 text-sm font-semibold"
                style={{ fontFamily: "var(--apex-font-display)" }}
              >
                {r.author}
                {r.source ? (
                  <span
                    className="ml-2 font-mono text-[11px] font-normal uppercase tracking-[0.12em]"
                    style={{ color: "var(--apex-muted-fg)" }}
                  >
                    via {r.source}
                  </span>
                ) : null}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  )
}
