import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { supabaseServer } from "@/lib/supabase-server"

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
}

// =============================================================================
// /login — Magic-link sign-in page
// =============================================================================
// Public. No auth check here — if they're already signed in, requireAuth()
// in the dashboard will just pass through. We don't auto-redirect signed-in
// users to avoid a flash of redirect on first visit.
// =============================================================================

interface Props {
  searchParams: Promise<{ error?: string }>
}

async function sendMagicLink(formData: FormData): Promise<never> {
  "use server"

  const email = formData.get("email")
  if (typeof email !== "string" || !email.includes("@")) {
    redirect("/login?error=invalid_email")
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://yourshopfront.com"

  const sb = await supabaseServer()
  const { error } = await sb.auth.signInWithOtp({
    email: email.toLowerCase().trim(),
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      // Don't auto-create a new user if the email doesn't exist in auth.users.
      // We want them to sign up through the purchase flow, not this form.
      shouldCreateUser: false,
    },
  })

  if (error) {
    // Supabase returns a generic error for unrecognised emails when
    // shouldCreateUser=false. Map all errors to the no_customer banner
    // rather than exposing auth internals.
    redirect("/login?error=no_customer")
  }

  const encoded = encodeURIComponent(email.toLowerCase().trim())
  redirect(`/login/check-email?email=${encoded}`)
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-background">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo / brand */}
        <div className="text-center space-y-1">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            Your Shopfront
          </p>
          <h1 className="text-2xl font-bold text-foreground">
            Sign in to your dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ll email you a magic link. No password needed.
          </p>
        </div>

        {/* Error banner */}
        {error === "no_customer" && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            We couldn&apos;t find an account for that email. Did you complete a
            purchase?{" "}
            <a
              href="mailto:support@yourshopfront.com"
              className="underline underline-offset-2 font-medium hover:opacity-80"
            >
              Contact support
            </a>
          </div>
        )}

        {error === "callback_failed" && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            The magic link expired or was already used. Request a new one below.
          </div>
        )}

        {error === "invalid_email" && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            Please enter a valid email address.
          </div>
        )}

        {/* Sign-in form */}
        <form action={sendMagicLink} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Send magic link
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a
            href="/pricing"
            className="underline underline-offset-2 hover:opacity-80"
          >
            View plans
          </a>
        </p>
      </div>
    </main>
  )
}
