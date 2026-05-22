import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Check your inbox",
  robots: { index: false, follow: false },
}

interface Props {
  searchParams: Promise<{ email?: string }>
}

export default async function CheckEmailPage({ searchParams }: Props) {
  const { email: rawEmail } = await searchParams
  // Decode and sanitise — only display, never trust for auth.
  const email =
    typeof rawEmail === "string" && rawEmail.includes("@")
      ? decodeURIComponent(rawEmail)
      : null

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-background">
      <div className="w-full max-w-sm space-y-6 text-center">
        {/* Icon */}
        <div
          aria-hidden="true"
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-3xl"
        >
          ✉
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Check your inbox
          </h1>

          {email ? (
            <p className="text-sm text-muted-foreground">
              We sent a magic link to{" "}
              <span className="font-semibold text-foreground">{email}</span>.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              We sent a magic link to your email address.
            </p>
          )}

          <p className="text-sm text-muted-foreground">
            The email arrives in under a minute. Check spam if you don&apos;t
            see it.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground text-left space-y-1">
          <p className="font-medium text-foreground">Didn&apos;t get it?</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Check your spam / junk folder</li>
            <li>Make sure you used the email you purchased with</li>
            <li>Links expire after 1 hour — request a new one if needed</li>
          </ul>
        </div>

        <Link
          href="/login"
          className="inline-block text-sm underline underline-offset-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Use a different email
        </Link>
      </div>
    </main>
  )
}
