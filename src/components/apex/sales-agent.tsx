"use client"

import * as React from "react"
import Link from "next/link"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

const STORAGE_KEY = "apex-sales-agent-v1"
const OPEN_EVENT = "apex:open-chat"
const GREETING: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content:
    "Hey — I'm the Apex Sites concierge. Tell me your trade and I'll point you at the right design, or ask anything about pricing or how the 24-hour build works.",
}

const QUICK_REPLIES = [
  "Show me the laundromat demo",
  "What's the cheapest way to start?",
  "I run a HVAC business — which design fits?",
  "Do you do Google Ads?",
] as const

const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g

/**
 * Parses Markdown-style `[text](url)` links and renders them as Next.js
 * Link components for internal routes, plain anchors for external. Plain
 * text segments preserve newlines via whitespace-pre-wrap on the parent.
 */
function renderMessageContent(content: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  LINK_PATTERN.lastIndex = 0
  while ((match = LINK_PATTERN.exec(content)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(content.slice(lastIndex, match.index))
    }
    const [, label, href] = match
    const isInternal = href!.startsWith("/")
    const key = `link-${match.index}`
    if (isInternal) {
      nodes.push(
        <Link
          key={key}
          href={href!}
          className="font-semibold text-apx-primary underline underline-offset-2 hover:text-apx-primary-ink"
        >
          {label}
        </Link>
      )
    } else {
      nodes.push(
        <a
          key={key}
          href={href!}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-apx-primary underline underline-offset-2 hover:text-apx-primary-ink"
        >
          {label}
        </a>
      )
    }
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < content.length) {
    nodes.push(content.slice(lastIndex))
  }
  return nodes
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

function loadHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [GREETING]
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return [GREETING]
    const parsed = JSON.parse(raw) as ChatMessage[]
    if (!Array.isArray(parsed) || parsed.length === 0) return [GREETING]
    return parsed
  } catch {
    return [GREETING]
  }
}

function saveHistory(messages: ChatMessage[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch {
    // Silent fail — privacy mode, quota, etc.
  }
}

/**
 * Apex Sites sales-agent chat bubble. Streams Claude Haiku 4.5 via
 * /api/chat as SSE. Conversation persists in localStorage so a refresh
 * doesn't reset context. Other CTAs can open this widget by dispatching
 * the `apex:open-chat` custom event.
 */
export function SalesAgent() {
  const [open, setOpen] = React.useState(false)
  // Lazy initializer is safe here: the panel is gated on `open` (false on
  // first render), so the initial-render output that gets hydrated is only
  // the bubble trigger — which doesn't read `messages`. No SSR mismatch.
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") return [GREETING]
    return loadHistory()
  })
  const [input, setInput] = React.useState("")
  const [streaming, setStreaming] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null)

  // Persist conversation across refreshes. Skip the initial render so we
  // don't write the greeting back over an existing saved history.
  const isFirstRender = React.useRef(true)
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    saveHistory(messages)
  }, [messages])

  // Listen for the global open-chat event from other CTAs.
  React.useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener(OPEN_EVENT, handler)
    return () => window.removeEventListener(OPEN_EVENT, handler)
  }, [])

  // Auto-scroll to bottom on new content.
  React.useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, open])

  // Focus input when opened.
  React.useEffect(() => {
    if (open && inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open])

  const send = React.useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || streaming) return

      setError(null)
      const userMsg: ChatMessage = { id: newId(), role: "user", content: trimmed }
      const placeholder: ChatMessage = {
        id: newId(),
        role: "assistant",
        content: "",
      }
      const nextHistory = [...messages, userMsg]
      setMessages([...nextHistory, placeholder])
      setInput("")
      setStreaming(true)

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextHistory
              .filter((m) => m.id !== "greeting")
              .map(({ role, content }) => ({ role, content })),
          }),
        })

        if (!res.ok || !res.body) {
          const errBody = (await res.json().catch(() => null)) as
            | { error?: string }
            | null
          throw new Error(errBody?.error ?? `HTTP ${res.status}`)
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        let accumulated = ""

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n\n")
          buffer = lines.pop() ?? ""
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            const payload = line.slice(6).trim()
            if (payload === "[DONE]") continue
            try {
              const parsed = JSON.parse(payload) as
                | { text?: string }
                | { error?: string }
              if ("error" in parsed && parsed.error) {
                throw new Error(parsed.error)
              }
              if ("text" in parsed && parsed.text) {
                accumulated += parsed.text
                setMessages((prev) => {
                  const next = [...prev]
                  const last = next[next.length - 1]
                  if (last && last.id === placeholder.id) {
                    next[next.length - 1] = { ...last, content: accumulated }
                  }
                  return next
                })
              }
            } catch (parseErr) {
              if (parseErr instanceof Error && parseErr.message) {
                throw parseErr
              }
            }
          }
        }
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "The chat dropped — try again."
        setError(msg)
        // Drop the empty placeholder on error.
        setMessages((prev) => prev.filter((m) => m.content !== ""))
      } finally {
        setStreaming(false)
      }
    },
    [messages, streaming]
  )

  const reset = React.useCallback(() => {
    setMessages([GREETING])
    setError(null)
  }, [])

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void send(input)
    }
  }

  return (
    <>
      {/* Bubble trigger */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-apx-ink text-apx-paper shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apx-primary focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
          aria-label="Open chat with Apex Sites concierge"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Chat</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Apex Sites concierge"
          className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl border border-apx-line bg-apx-paper shadow-[0_-8px_32px_rgba(0,0,0,0.15)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[560px] sm:w-[400px] sm:rounded-2xl"
          style={{ maxHeight: "min(90vh, 720px)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-apx-line px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-apx-ink text-apx-paper">
                <MessageCircle className="h-4 w-4" />
              </span>
              <div>
                <p className="font-sans text-[14px] font-semibold leading-tight text-apx-ink">
                  Apex Sites concierge
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-apx-mute">
                  Replies in seconds
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={reset}
                className="rounded-md px-2 py-1 text-[11px] font-semibold text-apx-mute transition-colors hover:bg-apx-canvas hover:text-apx-ink"
                aria-label="Clear conversation"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-apx-mute transition-colors hover:bg-apx-canvas hover:text-apx-ink"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:thin]"
          >
            <ul className="flex flex-col gap-3">
              {messages.map((m) => (
                <li
                  key={m.id}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[14px] leading-[1.5]",
                      m.role === "user"
                        ? "rounded-br-sm bg-apx-ink text-apx-paper"
                        : "rounded-bl-sm bg-apx-canvas text-apx-ink"
                    )}
                  >
                    {m.content === "" ? (
                      <span className="inline-flex items-center gap-1.5 text-apx-mute">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        thinking…
                      </span>
                    ) : (
                      renderMessageContent(m.content)
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Quick replies on greeting only */}
            {messages.length === 1 && messages[0]!.id === "greeting" && (
              <div className="mt-4 flex flex-wrap gap-2">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void send(q)}
                    disabled={streaming}
                    className="rounded-full border border-apx-line bg-apx-paper px-3 py-1.5 text-[12px] font-medium text-apx-ink transition-colors hover:border-apx-ink disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-800">
                {error}
              </p>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-apx-line p-3">
            <div className="flex items-end gap-2 rounded-xl border border-apx-line bg-apx-paper px-3 py-2 focus-within:border-apx-ink">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={streaming}
                rows={1}
                placeholder="Ask anything about Apex Sites…"
                className="flex-1 resize-none bg-transparent text-[14px] leading-[1.5] text-apx-ink placeholder:text-apx-mute focus:outline-none disabled:opacity-60"
                style={{ maxHeight: "120px" }}
              />
              <button
                type="button"
                onClick={() => void send(input)}
                disabled={streaming || !input.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-apx-ink text-apx-paper transition-colors hover:bg-apx-primary-ink disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send"
              >
                {streaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-1.5 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-apx-mute">
              Powered by Claude · Self-serve, no calls needed
            </p>
          </div>
        </div>
      )}
    </>
  )
}
