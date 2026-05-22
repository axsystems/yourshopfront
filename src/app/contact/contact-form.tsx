"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Check } from "lucide-react"

import { Button, Card, TextField } from "@/components/apex"
import { allThemes } from "@/lib/themes"

type Status = "idle" | "submitting" | "success" | "error"

export function ContactForm() {
  const params = useSearchParams()
  const ref = params.get("ref") ?? ""
  const piece = params.get("piece") ?? ""
  const referencedTheme = piece ? allThemes[piece] : undefined

  const initialMessage = React.useMemo(() => {
    if (referencedTheme) {
      return `I want to launch a site in the ${referencedTheme.name} style. My business is in [industry]. Anything I should know before I start checkout?`
    }
    if (ref === "portfolio-suggestion") {
      return "I'm interested in a design that's not in your current 30 themes. My business is in [industry] and I'm looking for [describe style]."
    }
    if (ref === "portfolio") {
      return "I'd like to talk about which of your 30 designs would fit my business best."
    }
    if (ref === "pricing") {
      return "I have a question about your pricing. "
    }
    if (ref === "final-cta") {
      return "I'd like to talk through which of your designs would fit my business best. "
    }
    return ""
  }, [ref, referencedTheme])

  const initialIndustry = referencedTheme?.industry ?? ""

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [business, setBusiness] = React.useState("")
  const [industry, setIndustry] = React.useState(initialIndustry)
  const [message, setMessage] = React.useState(initialMessage)
  const [status, setStatus] = React.useState<Status>("idle")
  const [errors, setErrors] = React.useState<string[]>([])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("submitting")
    setErrors([])
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          business,
          industry,
          message,
          ref,
          piece,
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { issues?: { path: string; message: string }[]; error?: string }
          | null
        const msgs = data?.issues?.map((i) => i.message) ?? [
          data?.error ?? "Something went wrong. Try again.",
        ]
        setErrors(msgs)
        setStatus("error")
        return
      }
      setStatus("success")
    } catch (err) {
      setErrors([
        err instanceof Error ? err.message : "Network error. Please try again.",
      ])
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <Card className="flex flex-col items-start gap-4 p-8">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-apx-mint-soft text-apx-mint">
          <Check className="h-6 w-6" strokeWidth={3} />
        </div>
        <h2 className="font-sans text-[24px] font-bold tracking-[-0.015em] text-apx-ink">
          Thanks — message received.
        </h2>
        <p className="text-[16px] leading-[1.55] text-apx-mute">
          A real person will reply to{" "}
          <strong className="font-semibold text-apx-ink">{email}</strong> within 24 hours. Usually faster.
        </p>
      </Card>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-2xl border border-apx-line bg-apx-elev p-6 md:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Your name"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors[0]?.toLowerCase().includes("name") ? errors[0] : undefined}
        />
        <TextField
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors[0]?.toLowerCase().includes("email") ? errors[0] : undefined}
        />
      </div>
      <TextField
        label="Business name"
        required
        autoComplete="organization"
        value={business}
        onChange={(e) => setBusiness(e.target.value)}
      />
      <TextField
        label="Industry (optional)"
        value={industry}
        onChange={(e) => setIndustry(e.target.value)}
        placeholder="e.g. Plumbing, Roofing, Cleaning"
      />
      <TextField
        label="Message"
        required
        multiline
        rows={6}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        hint="At least 10 characters."
      />
      {errors.length > 0 && status === "error" ? (
        <div
          role="alert"
          className="rounded-lg border border-apx-danger bg-apx-coral-soft p-3 text-[14px] text-apx-danger"
        >
          <p className="font-semibold">Couldn&apos;t send the message:</p>
          <ul className="mt-1 list-disc pl-5">
            {errors.map((err, i) => (
              <li key={`err-${i}`}>{err}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={status === "submitting"}
        className="self-start"
      >
        {status === "submitting" ? "Sending…" : "Send message →"}
      </Button>
      <p className="text-[12px] text-apx-mute">
        Real human reply within 24 hours. We never share your email.
      </p>
    </form>
  )
}
