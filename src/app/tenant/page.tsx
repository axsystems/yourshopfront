import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ThemedHome } from "@/components/home/themed-home"
import { Button, SiteFooter, SiteHeader } from "@/components/apex"
import { ThemeProvider } from "@/components/theme-provider"
import { getSiteByProvisionSlug, type Site } from "@/lib/supabase"
import { allThemes, defaultTheme } from "@/lib/themes"
import { applyTenantOverrides } from "@/lib/themes/with-overrides"

interface PageProps {
  searchParams: Promise<{ slug?: string }>
}

// Each tenant subdomain hits this route per request. No SSG — site
// content lives in Supabase and changes when admin approves / customer
// edits.
export const dynamic = "force-dynamic"

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug } = await searchParams
  if (!slug) return {}
  const site = await getSiteByProvisionSlug(slug).catch(() => null)
  if (!site) return {}
  return {
    title: site.business_name,
    description: `${site.business_name} — book online.`,
    // Tenant subdomains shouldn't compete with the apex marketing for
    // SEO. Block indexing until the customer's site has real content.
    robots: { index: false, follow: false },
  }
}

export default async function TenantPage({ searchParams }: PageProps) {
  const { slug } = await searchParams
  if (!slug) notFound()

  let site: Site | null = null
  try {
    site = await getSiteByProvisionSlug(slug)
  } catch (err) {
    console.error("[_tenant] supabase lookup failed", err)
    return <UnavailableNotice />
  }
  if (!site) notFound()

  // Status gating. Only awaiting_approval + live render the themed home.
  // Everything else surfaces a branded interstitial.
  if (site.status === "cancelled" || site.status === "refunded") {
    return <RemovedNotice />
  }
  if (
    site.status === "pending_content" ||
    site.status === "ready_to_build" ||
    site.status === "provisioning" ||
    site.status === "failed"
  ) {
    return <BuildingNotice site={site} />
  }

  const baseTheme = allThemes[site.demo_slug] ?? defaultTheme
  const theme = applyTenantOverrides(baseTheme, {
    businessName: site.business_name,
    industry: site.industry ?? undefined,
  })

  return <ThemedHome theme={theme} />
}

// -----------------------------------------------------------------------------
// Branded interstitials. Use the apex chrome's minimal SiteHeader + a
// neutral default theme so customer subdomains never serve a broken page.
// -----------------------------------------------------------------------------

function BuildingNotice({ site }: { site: Site }) {
  // Use the customer's chosen theme so the placeholder feels on-brand.
  const baseTheme = allThemes[site.demo_slug] ?? defaultTheme
  const theme = applyTenantOverrides(baseTheme, {
    businessName: site.business_name,
  })
  return (
    <ThemeProvider theme={theme}>
      <SiteHeader variant="minimal" />
      <main id="main" className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="mx-auto max-w-xl text-center">
          <p
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            Coming soon
          </p>
          <h1
            className="mt-5 text-3xl font-bold leading-tight tracking-tight md:text-5xl"
            style={{
              color: "var(--apex-fg)",
              fontFamily: "var(--apex-font-display)",
            }}
          >
            {site.business_name} is on the way.
          </h1>
          <p
            className="mt-5 text-base leading-relaxed"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            We&apos;re finishing the build. Check back in a few hours, or
            reach out directly if you need them sooner.
          </p>
        </div>
      </main>
      <SiteFooter variant="minimal" />
    </ThemeProvider>
  )
}

function RemovedNotice() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <SiteHeader variant="minimal" />
      <main id="main" className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="mx-auto max-w-xl text-center">
          <h1
            className="text-3xl font-bold leading-tight tracking-tight md:text-5xl"
            style={{
              color: "var(--apex-fg)",
              fontFamily: "var(--apex-font-display)",
            }}
          >
            This site is no longer available.
          </h1>
          <p
            className="mt-5 text-base leading-relaxed"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            If you&apos;re looking for a website for your own business, we&apos;d
            love to help.
          </p>
          <div className="mt-8">
            <Button href="https://apexsites.com" variant="primary" size="lg">
              See Apex Sites →
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter variant="minimal" />
    </ThemeProvider>
  )
}

function UnavailableNotice() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <SiteHeader variant="minimal" />
      <main id="main" className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="mx-auto max-w-xl text-center">
          <h1
            className="text-3xl font-bold leading-tight tracking-tight md:text-5xl"
            style={{
              color: "var(--apex-fg)",
              fontFamily: "var(--apex-font-display)",
            }}
          >
            We&apos;re having a moment.
          </h1>
          <p
            className="mt-5 text-base leading-relaxed"
            style={{ color: "var(--apex-muted-fg)" }}
          >
            Please try again in a minute. If this keeps happening, our team
            has been notified.
          </p>
        </div>
      </main>
      <SiteFooter variant="minimal" />
    </ThemeProvider>
  )
}
