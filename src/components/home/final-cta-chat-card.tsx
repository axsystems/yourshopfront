"use client"

import * as React from "react"

import { ApexButton, Display } from "./primitives"
import type { Theme } from "@/lib/themes/types"

interface FinalCtaChatCardProps {
  theme: Theme
}

/**
 * Right-column "ask the concierge" card on the themed FinalCTA. Replaces
 * the previous "Book a 15-min call" interruption with a self-serve chat
 * trigger that fires the global `apex:open-chat` event.
 */
export function FinalCtaChatCard({ theme }: FinalCtaChatCardProps) {
  return (
    <div
      className="flex flex-col justify-center gap-4 border-l-2 lg:pl-12"
      style={{
        borderColor:
          "color-mix(in oklab, var(--apex-bg) 18%, transparent)",
      }}
    >
      <p
        className="text-xs font-bold uppercase tracking-[0.18em]"
        style={{
          color: "color-mix(in oklab, var(--apex-bg) 60%, transparent)",
        }}
      >
        Or ask the concierge
      </p>
      <Display as="h3" className="text-2xl sm:text-3xl">
        Get answers in seconds.
      </Display>
      <p className="max-w-md text-base leading-relaxed opacity-80">
        Tell the chat your trade and we&apos;ll point you at the right design,
        walk through pricing, or recommend a sibling color way. No call, no
        forms — just a conversation.
      </p>
      <div className="mt-2">
        <ApexButton
          theme={theme}
          variant="outline"
          size="lg"
          className="!border-current"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("apex:open-chat"))
            }
          }}
        >
          Open the chat →
        </ApexButton>
      </div>
    </div>
  )
}
