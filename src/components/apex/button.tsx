"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type Variant = "primary" | "secondary" | "ghost"
type Size = "sm" | "md" | "lg"

interface ButtonBaseProps {
  variant?: Variant
  size?: Size
  loading?: boolean
  className?: string
  children: React.ReactNode
}

interface ButtonAsLinkProps
  extends ButtonBaseProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "color" | "children" | "className"> {
  href: string
  type?: never
}

interface ButtonAsButtonProps
  extends ButtonBaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color" | "children" | "className"> {
  href?: undefined
}

export type ButtonProps = ButtonAsLinkProps | ButtonAsButtonProps

const BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-full font-sans font-semibold transition-[transform,background,color,border] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-apx-primary focus-visible:ring-offset-2 focus-visible:ring-offset-apx-paper hover:-translate-y-px disabled:pointer-events-none disabled:opacity-60 aria-disabled:pointer-events-none aria-disabled:opacity-60"

const VARIANT: Record<Variant, string> = {
  primary: "bg-apx-primary text-apx-primary-fg hover:bg-apx-primary-ink",
  secondary:
    "border border-apx-ink bg-apx-paper text-apx-ink hover:bg-apx-canvas",
  ghost:
    "bg-transparent text-apx-ink underline-offset-4 hover:text-apx-primary hover:underline",
}

const SIZE: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-[15px]",
  lg: "h-14 px-7 text-[16px]",
}

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", loading, className, children } = props
  const baseCls = cn(BASE, VARIANT[variant], SIZE[size], className)

  if ("href" in props && props.href !== undefined) {
    const { href, target, rel, onClick, "aria-label": ariaLabel, id, tabIndex } = props
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        aria-label={ariaLabel}
        aria-disabled={loading || undefined}
        id={id}
        tabIndex={tabIndex}
        className={baseCls}
      >
        {loading ? <Spinner /> : null}
        {children}
      </Link>
    )
  }

  const buttonProps = props as ButtonAsButtonProps
  const { type = "button", onClick, disabled, name, value, form, "aria-label": ariaLabel, id, tabIndex, autoFocus } = buttonProps
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      id={id}
      tabIndex={tabIndex}
      autoFocus={autoFocus}
      name={name}
      value={value}
      form={form}
      className={baseCls}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  )
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  )
}
