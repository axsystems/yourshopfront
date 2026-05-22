"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

type ChatMode = "sales" | "onboarding"
type PanelView = "chat" | "refund-form" | "refund-success"

type RefundReason =
  | "changed_mind"
  | "service_issue"
  | "billing_issue"
  | "other"

// Separate storage keys per mode so a customer's onboarding session
// doesn't surface their pre-purchase sales chat (and vice versa).
const STORAGE_KEY_BY_MODE: Record<ChatMode, string> = {
  sales: "apex-sales-agent-v1",
  onboarding: "apex-onboarding-helper-v1",
}
const OPEN_EVENT = "apex:open-chat"

const GREETING_BY_MODE: Record<ChatMode, ChatMessage> = {
  sales: {
    id: "greeting",
    role: "assistant",
    content:
      "I'm the concierge. Tell me your business and I'll match it to a design, pricing, or whatever else you want to know.",
  },
  onboarding: {
    id: "greeting",
    role: "assistant",
    content:
      "I'm here to help you fill out your worksheet. Stuck on a section? Want me to draft sample copy? Just ask.",
  },
}

const QUICK_REPLIES_BY_MODE: Record<ChatMode, readonly string[]> = {
  sales: [
    "Show me the laundromat demo",
    "What's the cheapest way to start?",
    "I run a yoga studio — which design fits?",
    "Do you do Google Ads?",
  ],
  onboarding: [
    "Write me 3 hero headlines",
    "What services should I list?",
    "Help me write my About section",
    "What's next?",
  ],
}

const HEADER_LABEL_BY_MODE: Record<ChatMode, string> = {
  sales: "Your Shopfront concierge",
  onboarding: "Onboarding helper",
}

const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g

const SAFE_EXTERNAL_HOSTS = ["yourshopfront.com"] as const

type LinkClassification = "internal" | "external" | "mailto" | "blocked"

function classifyLinkHref(href: string): LinkClassification {
  if (href.startsWith("/")) return "internal"
  if (href.startsWith("mailto:")) return "mailto"
  try {
    const url = new URL(href)
    if (url.protocol !== "https:") return "blocked"
    const host = url.hostname.toLowerCase()
    for (const safe of SAFE_EXTERNAL_HOSTS) {
      if (host === safe || host.endsWith(`.${safe}`)) return "external"
    }
    return "blocked"
  } catch {
    return "blocked"
  }
}

/**
 * Parses Markdown-style `[text](url)` links and renders them as Next.js
 * Link components for internal routes, plain anchors for allowed external
 * hosts, and bare text for everything else. The allowlist defends against
 * prompt injection — the LLM can't smuggle an arbitrary URL or
 * `data:`/`javascript:` payload into the rendered chat.
 */
function renderMessageContent(content: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  const linkClass =
    "font-semibold text-apx-primary underline underline-offset-2 hover:text-apx-primary-ink"

  LINK_PATTERN.lastIndex = 0
  while ((match = LINK_PATTERN.exec(content)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(content.slice(lastIndex, match.index))
    }
    const [, label, href] = match
    const key = `link-${match.index}`
    const classification = classifyLinkHref(href!)
    if (classification === "internal") {
      nodes.push(
        <Link key={key} href={href!} className={linkClass}>
          {label}
        </Link>
      )
    } else if (classification === "external") {
      nodes.push(
        <a
          key={key}
          href={href!}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {label}
        </a>
      )
    } else if (classification === "mailto") {
      nodes.push(
        <a key={key} href={href!} className={linkClass}>
          {label}
        </a>
      )
    } else {
      // Blocked: render the label as plain text, no anchor.
      nodes.push(label)
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

function loadHistory(mode: ChatMode): ChatMessage[] {
  const greeting = GREETING_BY_MODE[mode]
  if (typeof window === "undefined") return [greeting]
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_BY_MODE[mode])
    if (!raw) return [greeting]
    const parsed = JSON.parse(raw) as ChatMessage[]
    if (!Array.isArray(parsed) || parsed.length === 0) return [greeting]
    return parsed
  } catch {
    return [greeting]
  }
}

function saveHistory(mode: ChatMode, messages: ChatMessage[]): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY_BY_MODE[mode],
      JSON.stringify(messages)
    )
  } catch {
    // Silent fail — privacy mode, quota, etc.
  }
}

// ---------------------------------------------------------------------------
// Refund form — rendered inline inside the chat panel
// ---------------------------------------------------------------------------

const REFUND_REASONS: { value: RefundReason; label: string }[] = [
  { value: "changed_mind", label: "Changed my mind" },
  { value: "service_issue", label: "Service issue" },
  { value: "billing_issue", label: "Billing issue" },
  { value: "other", label: "Other" },
]

const DETAIL_MIN = 10
const DETAIL_MAX = 2000

interface RefundFormProps {
  sessionId: string
  onCancel: () => void
  onSuccess: (message: string) => void
}

function RefundForm({ sessionId, onCancel, onSuccess }: RefundFormProps) {
  const [reason, setReason] = React.useState<RefundReason>("changed_mind")
  const [detail, setDetail] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [inlineError, setInlineError] = React.useState<string | null>(null)
  const formRef = React.useRef<HTMLFormElement | null>(null)

  // Escape key returns to chat
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onCancel])

  const detailCount = detail.length
  const detailValid = detailCount >= DETAIL_MIN && detailCount <= DETAIL_MAX
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const canSubmit = detailValid && emailValid && !submitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setInlineError(null)

    try {
      const res = await fetch("/api/refund-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          reason,
          reasonDetail: detail.trim(),
          confirmEmail: email.trim().toLowerCase(),
        }),
      })

      const body = (await res.json().catch(() => null)) as
        | { message?: string }
        | null
      const apiMessage = body?.message ?? null

      if (res.ok) {
        onSuccess(
          apiMessage ??
            "Your refund request has been received. We'll follow up by email within 1-2 business days."
        )
        return
      }

      if (res.status === 429) {
        setInlineError("Too many requests, try again in a moment.")
      } else if (res.status >= 500) {
        setInlineError(
          "Something went wrong. Please email hello@yourshopfront.com."
        )
      } else {
        // 400 / 403
        setInlineError(
          apiMessage ?? "Please check your input and try again."
        )
      }
    } catch {
      setInlineError(
        "Something went wrong. Please email hello@yourshopfront.com."
      )
    } finally {
      setSubmitting(false)
    }
  }

  const labelClass = "block text-[12px] font-semibold text-apx-ink mb-1"
  const fieldClass =
    "w-full rounded-lg border border-apx-line bg-apx-paper px-3 py-2 text-[13px] text-apx-ink placeholder:text-apx-soft focus:border-apx-ink focus:outline-none"

  return (
    <form
      ref={formRef}
      onSubmit={(e) => void handleSubmit(e)}
      className="flex flex-col gap-4 px-4 py-4"
      noValidate
    >
      <div>
        <p className="text-[14px] font-semibold text-apx-ink">Request a refund</p>
        <p className="mt-0.5 text-[12px] text-apx-mute">
          We review every request within 1-2 business days.
        </p>
      </div>

      {/* Reason */}
      <div>
        <label htmlFor="refund-reason" className={labelClass}>
          Reason
        </label>
        <select
          id="refund-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value as RefundReason)}
          className={fieldClass}
          disabled={submitting}
        >
          {REFUND_REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Detail */}
      <div>
        <label htmlFor="refund-detail" className={labelClass}>
          Tell us more
        </label>
        <textarea
          id="refund-detail"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          rows={3}
          maxLength={DETAIL_MAX}
          placeholder="Give us a bit of context so we can handle this quickly."
          className={cn(fieldClass, "resize-none")}
          disabled={submitting}
        />
        <p
          className={cn(
            "mt-0.5 text-right text-[11px]",
            detailCount > DETAIL_MAX
              ? "text-apx-danger"
              : detailCount > 0 && detailCount < DETAIL_MIN
                ? "text-apx-warn"
                : "text-apx-soft"
          )}
        >
          {detailCount}/{DETAIL_MAX}
          {detailCount > 0 && detailCount < DETAIL_MIN && (
            <span className="ml-1">(min {DETAIL_MIN})</span>
          )}
        </p>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="refund-email" className={labelClass}>
          Confirm your email
        </label>
        <input
          id="refund-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={fieldClass}
          disabled={submitting}
          autoComplete="email"
        />
      </div>

      {/* Inline error */}
      <div aria-live="polite" aria-atomic="true">
        {inlineError && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-800">
            {inlineError}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 rounded-lg border border-apx-line px-3 py-2 text-[13px] font-medium text-apx-mute transition-colors hover:border-apx-ink hover:text-apx-ink disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          aria-disabled={!canSubmit}
          className={cn(
            "flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors",
            canSubmit
              ? "bg-apx-ink text-apx-paper hover:bg-apx-primary-ink"
              : "cursor-not-allowed bg-apx-line text-apx-mute opacity-60"
          )}
        >
          {submitting ? (
            <span className="inline-flex items-center justify-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit refund request"
          )}
        </button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Main SalesAgent component
// ---------------------------------------------------------------------------

/**
 * Your Shopfront sales-agent chat bubble. Streams Claude Haiku 4.5 via
 * /api/chat as SSE. Conversation persists in localStorage so a refresh
 * doesn't reset context. Other CTAs can open this widget by dispatching
 * the `apex:open-chat` custom event.
 *
 * In onboarding mode (pathname starts with /onboarding) and when a
 * session_id query param is present, a subtle "Request a refund" link
 * appears below the input. Clicking it swaps to an inline refund form.
 */
export function SalesAgent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // /onboarding and /onboarding/worksheet → onboarding helper persona.
  // Everywhere else → sales concierge. Derived per render so a SPA
  // navigation between marketing and onboarding swaps personas cleanly.
  const mode: ChatMode = pathname?.startsWith("/onboarding")
    ? "onboarding"
    : "sales"

  // session_id is present in the URL on all onboarding pages.
  const sessionId = mode === "onboarding"
    ? (searchParams.get("session_id") ?? null)
    : null

  const showRefundTrigger = mode === "onboarding" && sessionId !== null

  const greeting = GREETING_BY_MODE[mode]
  const quickReplies = QUICK_REPLIES_BY_MODE[mode]
  const headerLabel = HEADER_LABEL_BY_MODE[mode]

  const [open, setOpen] = React.useState(false)
  const [view, setView] = React.useState<PanelView>("chat")
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

  // Lazy initializer is safe here: the panel is gated on `open` (false on
  // first render), so the initial-render output that gets hydrated is only
  // the bubble trigger — which doesn't read `messages`. No SSR mismatch.
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") return [greeting]
    return loadHistory(mode)
  })
  const [input, setInput] = React.useState("")
  const [streaming, setStreaming] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null)

  // When the mode changes (route swap), reload history from the right
  // storage bucket so the customer sees their onboarding chat on
  // onboarding pages and their sales chat on marketing pages.
  const lastModeRef = React.useRef(mode)
  React.useEffect(() => {
    if (lastModeRef.current !== mode) {
      lastModeRef.current = mode
      setMessages(loadHistory(mode))
      setError(null)
      setView("chat")
      setSuccessMessage(null)
    }
  }, [mode])

  // Persist conversation across refreshes. Skip the initial render so we
  // don't write the greeting back over an existing saved history.
  const isFirstRender = React.useRef(true)
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    saveHistory(mode, messages)
  }, [mode, messages])

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

  // Focus input when opened (chat view only).
  React.useEffect(() => {
    if (open && view === "chat" && inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open, view])

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
            mode,
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
        const raw =
          err instanceof Error
            ? err.message
            : "The chat dropped — try again."
        // Translate Anthropic's "Overloaded" / 529 errors into a
        // friendlier retry-friendly message. These are transient and
        // a refresh in a few seconds usually works.
        const msg = /overloaded/i.test(raw)
          ? "Lots of folks chatting right now — try again in a few seconds."
          : raw
        setError(msg)
        // Drop the empty placeholder on error.
        setMessages((prev) => prev.filter((m) => m.content !== ""))
      } finally {
        setStreaming(false)
      }
    },
    [messages, mode, streaming]
  )

  const reset = React.useCallback(() => {
    setMessages([greeting])
    setError(null)
  }, [greeting])

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void send(input)
    }
  }

  const handleRefundSuccess = React.useCallback((message: string) => {
    setSuccessMessage(message)
    setView("refund-success")
  }, [])

  const returnToChat = React.useCallback(() => {
    setView("chat")
    setSuccessMessage(null)
  }, [])

  return (
    <>
      {/* Bubble trigger */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-apx-ink text-apx-paper shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apx-primary focus-visible:ring-offset-2 md:bottom-6 md:right-6"
          aria-label={`Open chat with the ${headerLabel}`}
        >
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Chat</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label={headerLabel}
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
                  {headerLabel}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-apx-mute">
                  Replies in seconds
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {view === "chat" && (
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-md px-2 py-1 text-[11px] font-semibold text-apx-mute transition-colors hover:bg-apx-canvas hover:text-apx-ink"
                  aria-label="Clear conversation"
                >
                  Clear
                </button>
              )}
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

          {/* Body — swaps between chat, refund form, and success/error */}
          {view === "refund-form" && sessionId ? (
            <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
              <RefundForm
                sessionId={sessionId}
                onCancel={returnToChat}
                onSuccess={handleRefundSuccess}
              />
            </div>
          ) : view === "refund-success" ? (
            <div className="flex flex-1 flex-col items-start justify-start overflow-y-auto px-4 py-6 [scrollbar-width:thin]">
              <div className="w-full rounded-2xl rounded-bl-sm bg-apx-canvas px-3.5 py-3 text-[14px] leading-[1.5] text-apx-ink">
                {successMessage}
              </div>
              <button
                type="button"
                onClick={returnToChat}
                className="mt-4 text-[13px] font-semibold text-apx-mute underline underline-offset-2 hover:text-apx-ink"
              >
                Back to chat
              </button>
            </div>
          ) : (
            <>
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
                    {quickReplies.map((q) => (
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
                    placeholder="Ask anything about Your Shopfront…"
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
                  Self-serve · No calls needed
                </p>

                {/* Refund trigger — onboarding mode only, when session is known */}
                {showRefundTrigger && (
                  <div className="mt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setView("refund-form")}
                      className="text-[12px] text-apx-mute underline underline-offset-2 hover:text-apx-ink transition-colors"
                    >
                      Request a refund
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
