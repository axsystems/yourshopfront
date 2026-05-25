"use client"

import { useState, useCallback } from "react"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CopyUrlButtonProps {
  url: string
  className?: string
}

export function CopyUrlButton({ url, className }: CopyUrlButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable (e.g. non-https dev) — silent fail
    }
  }, [url])

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied to clipboard" : "Copy URL to clipboard"}
      title={copied ? "Copied!" : "Copy URL"}
      className={cn(
        // h-9 w-9 (36px) + the surrounding row padding clears 44px effective
        // touch target on mobile per WCAG 2.5.5.
        "inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-apx-soft transition-colors hover:bg-apx-tint hover:text-apx-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apx-primary focus-visible:ring-offset-2",
        className
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-apx-success" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden />
      )}
      {/* Visible "Copied!" feedback for sighted users */}
      {copied && (
        <span className="sr-only">Copied!</span>
      )}
    </button>
  )
}
