"use client"

import type { Message } from "@/lib/chat-data"

interface UsageBarsProps {
  messages: Message[]
}

/** A compact per-turn stacked bar chart: prompt tokens vs completion tokens. */
export function UsageBars({ messages }: UsageBarsProps) {
  const turns = messages.slice(-16)
  const max = Math.max(
    1,
    ...turns.map((m) => m.promptTokens + m.completionTokens),
  )

  if (turns.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-muted-foreground">
        No usage yet.
      </p>
    )
  }

  return (
    <div className="flex h-24 gap-1" aria-hidden="true">
      {turns.map((m) => {
        const total = m.promptTokens + m.completionTokens
        const heightPct = (total / max) * 100
        const isUser = m.role === "user"
        return (
          <div
            key={m.id}
            className="flex h-full flex-1 flex-col justify-end"
            title={`${total} tokens`}
          >
            <div
              className="w-full rounded-sm transition-all"
              style={{
                height: `${Math.max(heightPct, 4)}%`,
                backgroundColor: isUser
                  ? "var(--color-chart-5)"
                  : "var(--color-chart-1)",
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
