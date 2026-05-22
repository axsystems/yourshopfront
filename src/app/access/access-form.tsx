"use client"

import * as React from "react"
import Link from "next/link"
import { Check } from "lucide-react"

import { Button, Card, TextField } from "@/components/apex"

type Status = "idle" | "submitting" | "success" | "error"

export function AccessForm() {
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<Status>("idle")
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("submitting")
    setError(null)
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (res.status === 429) {
        setError("Too many requests. Try again in a minute.")
        setStatus("error")
        return
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null
        setError(data?.error ?? "Something went wrong. Try again.")
        setStatus("error")
        return
      }
      setStatus("success")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Network error. Please try again."
      )
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <Card
        role="status"
        aria-live="polite"
        className="flex flex-col items-start gap-4 p-8"
      >
        <div className="grid h-12 w-12 place-items-center rounded-full bg-apx-mint-soft text-apx-mint">
          <Check className="h-6 w-6" strokeWidth={3} />
        </div>
        <h2 className="font-sans text-[24px] font-bold tracking-[-0.015em] text-apx-ink">
          Check your inbox.
        </h2>
        <p className="text-[16px] leading-[1.55] text-apx-mute">
          The email arrives in under a minute. Check spam if you don&apos;t
          see it.
        </p>
        <Link
          href="/"
          className="text-[14px] font-semibold text-apx-ink underline underline-offset-2 hover:text-apx-primary"
        >
          Back to home
        </Link>
      </Card>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-2xl border border-apx-line bg-apx-elev p-6 md:p-8"
    >
      <TextField
        label="Email"
        type="email"
        required
        autoComplete="email"
        maxLength={254}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@business.com"
      />
      <div aria-live="polite">
        {error && status === "error" ? (
          <div
            role="alert"
            className="rounded-lg border border-apx-danger bg-apx-coral-soft p-3 text-[14px] text-apx-danger"
          >
            {error}
          </div>
        ) : null}
      </div>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={status === "submitting"}
        disabled={status === "submitting" || email.length === 0}
        className="self-start"
      >
        {status === "submitting" ? "Sending…" : "Send recovery link"}
      </Button>
      <p className="text-[12px] text-apx-mute">
        For security, we send the same response whether or not the email is
        registered.
      </p>
    </form>
  )
}
