"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string
  error?: string
  hint?: string
  required?: boolean
  /** When true, render a textarea instead of an input. Use this for free-text fields. */
  multiline?: boolean
  rows?: number
}

export const TextField = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  TextFieldProps
>(function TextField(
  {
    label,
    error,
    hint,
    required,
    multiline,
    rows = 4,
    className,
    id: idProp,
    ...rest
  },
  ref
) {
  const reactId = React.useId()
  const id = idProp ?? `apx-tf-${reactId}`
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy =
    [error ? errorId : null, hint && !error ? hintId : null]
      .filter(Boolean)
      .join(" ") || undefined

  const inputCls = cn(
    "w-full rounded-lg border bg-apx-paper px-3 py-2.5 text-[16px] text-apx-ink outline-none transition-colors",
    "placeholder:text-apx-soft",
    "focus-visible:border-apx-primary focus-visible:ring-2 focus-visible:ring-apx-primary/30",
    "disabled:cursor-not-allowed disabled:opacity-60",
    error ? "border-apx-danger" : "border-apx-line",
    className
  )

  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-apx-mute">
        {label}
        {required ? <span className="text-apx-primary"> *</span> : null}
      </span>
      {multiline ? (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          id={id}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className={inputCls}
          {...(rest as unknown as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className={inputCls}
          {...rest}
        />
      )}
      {hint && !error ? (
        <span id={hintId} className="mt-1 block text-[12px] text-apx-mute">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span
          id={errorId}
          role="alert"
          className="mt-1 block text-[12px] font-medium text-apx-danger"
        >
          {error}
        </span>
      ) : null}
    </label>
  )
})
