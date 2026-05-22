"use client"

import * as React from "react"
import { useForm, type FieldErrors, type UseFormRegister } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight } from "lucide-react"

import { z } from "zod"
import {
  CheckoutFormSchema,
  INDUSTRY_OPTIONS,
  type CheckoutFormData,
  type Tier,
} from "@/lib/checkout-schema"

// copy_addon is intentionally absent from CheckoutFormSchema (Stream A comment).
// Stream B extends the schema locally for the form resolver so the field is
// validated and typed without modifying the shared schema file.
const CheckoutFormSchemaWithCopy = CheckoutFormSchema.extend({
  copy_addon: z.boolean(),
})
type CheckoutFormDataWithCopy = z.infer<typeof CheckoutFormSchemaWithCopy>

interface CheckoutFormProps {
  tier: Tier
  demo: string
  cancelled?: boolean
  promo?: "launch"
  defaultIndustry?: string
}

export function CheckoutForm({ tier, demo, cancelled, promo, defaultIndustry }: CheckoutFormProps) {
  const form = useForm<CheckoutFormDataWithCopy>({
    resolver: zodResolver(CheckoutFormSchemaWithCopy),
    defaultValues: {
      business_name: "",
      contact_name: "",
      email: "",
      phone: "",
      industry: defaultIndustry ?? "",
      current_website_url: "",
      hosting_addon: tier === "onetime",
      copy_addon: false,
    },
  })

  const { register, handleSubmit, formState } = form
  const { errors, isSubmitting } = formState
  const [serverError, setServerError] = React.useState<string | null>(null)

  const onSubmit = async (data: CheckoutFormDataWithCopy) => {
    setServerError(null)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...data,
          tier,
          demo,
          ...(promo ? { promo } : {}),
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null
        setServerError(
          body?.error ??
            `Checkout request failed (HTTP ${res.status}). Please try again.`
        )
        return
      }
      const { url } = (await res.json()) as { url?: string }
      if (!url) {
        setServerError("Checkout returned no redirect URL. Please try again.")
        return
      }
      window.location.assign(url)
    } catch (err) {
      setServerError(
        err instanceof Error
          ? `Network error: ${err.message}`
          : "Network error. Please try again."
      )
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
    >
      {cancelled && (
        <div
          className="rounded-lg border p-4 text-sm"
          style={{
            background: "color-mix(in oklab, var(--apex-accent) 12%, transparent)",
            borderColor: "var(--apex-border)",
            color: "var(--apex-fg)",
          }}
        >
          <strong>Payment cancelled.</strong> No charge was made. Adjust your
          details below and try again whenever you&apos;re ready.
        </div>
      )}

      <Field
        label="Business name"
        name="business_name"
        register={register}
        errors={errors}
        autoComplete="organization"
        required
      />
      <Field
        label="Your name"
        name="contact_name"
        register={register}
        errors={errors}
        autoComplete="name"
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Email"
          name="email"
          type="email"
          register={register}
          errors={errors}
          autoComplete="email"
          required
        />
        <Field
          label="Phone (optional)"
          name="phone"
          type="tel"
          register={register}
          errors={errors}
          autoComplete="tel"
          placeholder="(555) 123-4567"
        />
      </div>

      <FieldWrap label="Industry" required error={errors.industry?.message}>
        <select
          {...register("industry")}
          className="w-full rounded-lg border bg-[var(--apex-surface)] px-3 py-2.5 text-base text-[var(--apex-surface-fg)] outline-none transition focus:border-[var(--apex-fg)]"
          style={{
            borderColor: errors.industry
              ? "color-mix(in oklab, red 60%, var(--apex-border))"
              : "var(--apex-border)",
          }}
        >
          <option value="">Pick the closest match…</option>
          {INDUSTRY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          <option value="Other">Other (we&apos;ll ask in onboarding)</option>
        </select>
      </FieldWrap>

      <Field
        label="Current website URL (optional)"
        name="current_website_url"
        type="url"
        register={register}
        errors={errors}
        placeholder="https://example.com"
      />

      {/* copy_addon — shown on both tiers */}
      <label
        className="flex cursor-pointer items-start gap-3 rounded-xl border-2 p-5 text-sm leading-relaxed transition-colors"
        style={{
          background: "color-mix(in oklab, #3b6eff 6%, transparent)",
          borderColor: "color-mix(in oklab, #3b6eff 35%, var(--apex-border))",
          color: "var(--apex-fg)",
        }}
      >
        <input
          type="checkbox"
          {...register("copy_addon")}
          className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[var(--apex-primary)]"
        />
        <span>
          <span className="flex flex-wrap items-baseline gap-x-2">
            <strong className="text-base font-bold">Have us write your copy.</strong>
            <span
              className="rounded px-1.5 py-0.5 text-xs font-extrabold tracking-wide"
              style={{
                background: "color-mix(in oklab, #3b6eff 15%, transparent)",
                color: "#2952cc",
                fontFamily: "var(--apex-font-display)",
              }}
            >
              $199 one-time
            </span>
          </span>
          <span className="mt-1.5 block" style={{ color: "var(--apex-muted-fg)" }}>
            Industry-tested copy that converts. We designed 30 production sites
            and know what wording books jobs in your industry. Skip writing
            6&nbsp;sections — answer 5 facts instead, we draft your hero,
            services, about, and CTAs. Most customers add this.
          </span>
        </span>
      </label>

      {tier === "onetime" && (
        <label
          className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-sm leading-relaxed"
          style={{
            background: "color-mix(in oklab, var(--apex-accent) 8%, transparent)",
            borderColor: "var(--apex-border)",
            color: "var(--apex-fg)",
          }}
        >
          <input
            type="checkbox"
            {...register("hosting_addon")}
            className="mt-1 h-4 w-4 flex-shrink-0 accent-[var(--apex-primary)]"
          />
          <span>
            <strong>Add managed hosting + maintenance for $49/mo.</strong>{" "}
            Most customers add this — running your own hosting is a part-time
            job. Includes Vercel + Cloudflare hosting, SSL, weekly backups,
            security patches, unlimited small edits, monthly SEO check, and a Slack channel for issues. Cancel anytime.
          </span>
        </label>
      )}

      {serverError && (
        <div
          className="rounded-lg border p-3 text-sm"
          style={{
            background: "rgb(254 242 242)",
            borderColor: "rgb(252 165 165)",
            color: "rgb(127 29 29)",
          }}
        >
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-1.5 px-5 py-3.5 text-base font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          background: "var(--apex-primary)",
          color: "var(--apex-primary-fg)",
          borderRadius: "var(--apex-radius-md)",
          fontFamily: "var(--apex-font-display)",
          letterSpacing: "0.005em",
        }}
      >
        {isSubmitting ? (
          <>
            <Spinner /> Redirecting to Stripe…
          </>
        ) : (
          <>
            Pay securely with Stripe <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <p
        className="text-center text-xs"
        style={{ color: "var(--apex-muted-fg)" }}
      >
        We charge through Stripe. We never see your card number. 30-day money-back guarantee · cancel anytime.
      </p>
    </form>
  )
}

interface FieldProps {
  label: string
  name: keyof CheckoutFormDataWithCopy
  register: UseFormRegister<CheckoutFormDataWithCopy>
  errors: FieldErrors<CheckoutFormDataWithCopy>
  type?: string
  autoComplete?: string
  placeholder?: string
  required?: boolean
}

function Field({
  label,
  name,
  register,
  errors,
  type = "text",
  autoComplete,
  placeholder,
  required,
}: FieldProps) {
  const error = errors[name]
  return (
    <FieldWrap label={label} required={required} error={error?.message as string | undefined}>
      <input
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        {...register(name)}
        className="w-full rounded-lg border bg-[var(--apex-surface)] px-3 py-2.5 text-base text-[var(--apex-surface-fg)] outline-none transition focus:border-[var(--apex-fg)]"
        style={{
          borderColor: error
            ? "color-mix(in oklab, red 60%, var(--apex-border))"
            : "var(--apex-border)",
        }}
      />
    </FieldWrap>
  )
}

function FieldWrap({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span
        className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em]"
        style={{ color: "var(--apex-muted-fg)" }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--apex-primary)" }}> *</span>
        )}
      </span>
      {children}
      {hint && !error && (
        <span
          className="mt-1 block text-xs"
          style={{ color: "var(--apex-muted-fg)" }}
        >
          {hint}
        </span>
      )}
      {error && (
        <span className="mt-1 block text-xs text-red-700">{error}</span>
      )}
    </label>
  )
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  )
}
