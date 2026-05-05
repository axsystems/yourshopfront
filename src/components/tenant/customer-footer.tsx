import * as React from "react"

import type {
  SiteContentContact,
  SiteContentService,
  SiteContentServiceArea,
} from "@/lib/site-content/types"
import { Container } from "@/components/home/primitives"

interface CustomerFooterProps {
  businessName: string
  contact: SiteContentContact
  services: SiteContentService[]
  serviceArea: SiteContentServiceArea
}

/**
 * Themed footer for the tenant page. Replaces SiteFooter — that one is
 * Apex's footer (about / pricing / portfolio / legal). Here we surface
 * the customer's contact essentials, top services, and service area, with
 * a small "Site by Apex Sites" credit at the very bottom.
 */
export function CustomerFooter({
  businessName,
  contact,
  services,
  serviceArea,
}: CustomerFooterProps) {
  const telHref = `tel:${stripPhoneFormatting(contact.phone)}`
  return (
    <footer
      className="border-t"
      style={{
        background: "var(--apex-surface)",
        color: "var(--apex-surface-fg)",
        borderColor: "var(--apex-border)",
      }}
    >
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-4">
          <div>
            <p
              className="text-xl font-bold leading-tight"
              style={{ fontFamily: "var(--apex-font-display)" }}
            >
              {businessName}
            </p>
            <p
              className="mt-3 text-sm"
              style={{ color: "var(--apex-muted-fg)" }}
            >
              {contact.hoursMode === "24/7"
                ? "Open 24/7."
                : "Reach us during business hours."}
            </p>
          </div>
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{
                color: "var(--apex-muted-fg)",
                fontFamily: "var(--apex-font-mono)",
              }}
            >
              Services
            </p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {services.slice(0, 6).map((s, i) => (
                <li key={`${s.title}-${i}`}>
                  <a
                    href="#services"
                    className="hover:underline"
                    style={{ color: "var(--apex-fg)" }}
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{
                color: "var(--apex-muted-fg)",
                fontFamily: "var(--apex-font-mono)",
              }}
            >
              Service area
            </p>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: "var(--apex-muted-fg)" }}
            >
              {serviceArea.cities.slice(0, 12).join(", ")}
              {serviceArea.cities.length > 12 ? " and more." : "."}
            </p>
          </div>
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{
                color: "var(--apex-muted-fg)",
                fontFamily: "var(--apex-font-mono)",
              }}
            >
              Contact
            </p>
            <a
              href={telHref}
              className="mt-3 block text-lg font-bold"
              style={{
                fontFamily: "var(--apex-font-display)",
                color: "var(--apex-fg)",
              }}
            >
              {contact.phone}
            </a>
            {contact.email ? (
              <a
                href={`mailto:${contact.email}`}
                className="mt-2 block text-sm hover:underline"
                style={{ color: "var(--apex-muted-fg)" }}
              >
                {contact.email}
              </a>
            ) : null}
            {contact.address ? (
              <p
                className="mt-2 text-sm"
                style={{ color: "var(--apex-muted-fg)" }}
              >
                {contact.address}
              </p>
            ) : null}
          </div>
        </div>
        <div
          className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-6 text-xs"
          style={{
            borderColor: "var(--apex-border)",
            color: "var(--apex-muted-fg)",
          }}
        >
          <p>
            © {new Date().getFullYear()} {businessName}. All rights reserved.
          </p>
          <p>
            Site by{" "}
            <a
              href="https://apexsites.com"
              className="font-semibold underline underline-offset-2"
              style={{ color: "var(--apex-fg)" }}
              rel="noopener"
            >
              Apex Sites
            </a>
            .
          </p>
        </div>
      </Container>
    </footer>
  )
}

function stripPhoneFormatting(phone: string): string {
  return phone.replace(/[^\d+]/g, "")
}
