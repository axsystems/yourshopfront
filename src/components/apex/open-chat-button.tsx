"use client"

import * as React from "react"
import { MessageCircle } from "lucide-react"

import { cn } from "@/lib/utils"

type Variant = "primary" | "secondary" | "ghost"
type Size = "sm" | "md" | "lg"

interface OpenChatButtonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
  /** Optional icon override; default is the MessageCircle bubble. */
  icon?: React.ReactNode | false
}

const BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-full font-sans font-semibold transition-[transform,background,color,border] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-apx-primary focus-visible:ring-offset-2 focus-visible:ring-offset-apx-paper hover:-translate-y-px"

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

/**
 * Self-serve CTA that opens the SalesAgent chat bubble. Dispatches the
 * `apex:open-chat` custom event the SalesAgent listens for. Keeps the
 * marketing copy in the parent server component while swapping the
 * "book a call" interruption for an in-page conversation.
 */
export function OpenChatButton({
  variant = "primary",
  size = "md",
  className,
  children,
  icon,
}: OpenChatButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("apex:open-chat"))
        }
      }}
      className={cn(BASE, VARIANT[variant], SIZE[size], className)}
    >
      {icon === false ? null : icon ?? <MessageCircle className="h-4 w-4" />}
      {children}
    </button>
  )
}
