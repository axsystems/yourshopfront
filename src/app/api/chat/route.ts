import "server-only"

import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"

import { buildSystemPrompt } from "@/lib/chat/system-prompt"
import { checkRateLimit, pruneExpired } from "@/lib/chat/rate-limit"
import { getClientIp } from "@/lib/get-client-ip"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MODEL = "claude-haiku-4-5-20251001"
const MAX_TOKENS = 800
const MAX_HISTORY_TURNS = 12

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
})

const RequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(MAX_HISTORY_TURNS),
})

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: "Sales agent is offline. Try again later or use the contact form." },
      { status: 503 }
    )
  }

  const ip = getClientIp(req)
  const limit = checkRateLimit(`chat:${ip}`)
  if (!limit.ok) {
    return Response.json(
      {
        error: "Slow down a bit — try again in a moment.",
        retryAfterSeconds: limit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    )
  }

  // Lazy maintenance: keep the bucket map small.
  if (Math.random() < 0.05) pruneExpired()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request shape" },
      { status: 400 }
    )
  }

  const client = new Anthropic({ apiKey })

  // Stream the reply as Server-Sent Events. Keeps first-token latency
  // low and lets the widget show typed text as it arrives.
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const apiStream = await client.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          // Cache the system prompt so every conversation past the first
          // pays only the cached-read price (~10% of normal input).
          system: [
            {
              type: "text",
              text: buildSystemPrompt(),
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: parsed.data.messages,
        })

        for await (const event of apiStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const payload = JSON.stringify({ text: event.delta.text })
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
          }
        }

        controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
        controller.close()
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error"
        const payload = JSON.stringify({ error: message })
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  })
}
