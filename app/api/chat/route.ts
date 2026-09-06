import Groq from "groq-sdk"
import { NextResponse } from "next/server"

const MODEL = "qwen/qwen3.8-27b"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false
  const message = value as Record<string, unknown>
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0
  )
}

export async function POST(request: Request) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured on the server." },
      { status: 500 },
    )
  }

  try {
    const body = (await request.json()) as { messages?: unknown }
    if (
      !Array.isArray(body.messages) ||
      body.messages.length === 0 ||
      !body.messages.every(isChatMessage)
    ) {
      return NextResponse.json(
        { error: "A non-empty messages array is required." },
        { status: 400 },
      )
    }

    const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const startedAt = performance.now()
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: body.messages,
      max_tokens: 1000,
    })
    const responseTimeMs = Math.round(performance.now() - startedAt)
    const usage = completion.usage
    const content = completion.choices[0]?.message?.content

    if (!usage || typeof content !== "string") {
      return NextResponse.json(
        { error: "Groq returned an incomplete response." },
        { status: 502 },
      )
    }

    return NextResponse.json({
      content,
      model: MODEL,
      usage: {
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens,
      },
      responseTimeMs,
      tokensPerSecond:
        responseTimeMs > 0
          ? Number((usage.completion_tokens / (responseTimeMs / 1000)).toFixed(2))
          : usage.completion_tokens,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Groq error"
    return NextResponse.json(
      { error: `Groq request failed: ${message}` },
      { status: 502 },
    )
  }
}