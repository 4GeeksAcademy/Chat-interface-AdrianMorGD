"use client"

import { useEffect, useRef } from "react"
import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  type Message,
  formatTime,
  formatTokens,
} from "@/lib/chat-data"

interface MessageListProps {
  messages: Message[]
  pending: boolean
}

export function MessageList({ messages, pending }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length, pending])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 md:px-6">
        {messages.map((m) => (
          <MessageRow key={m.id} message={m} />
        ))}
        {pending && <PendingRow />}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function MessageRow({ message }: { message: Message }) {
  const isUser = message.role === "user"
  const tokens = message.promptTokens + message.completionTokens
  return (
    <article className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md border",
          isUser
            ? "border-border bg-secondary text-secondary-foreground"
            : "border-primary/30 bg-primary/10 text-primary",
        )}
        aria-hidden="true"
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>
      <div className={cn("flex max-w-[80%] flex-col gap-1.5", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-xl border px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm border-primary/20 bg-primary/10 text-foreground"
              : "rounded-tl-sm border-border bg-card text-card-foreground",
          )}
        >
          {message.content}
        </div>
        <div
          className={cn(
            "flex items-center gap-2 px-1 font-mono text-[10px] text-muted-foreground",
            isUser && "flex-row-reverse",
          )}
        >
          <span>{formatTime(message.createdAt)}</span>
          <span aria-hidden="true">·</span>
          <span>
            {formatTokens(tokens)} {isUser ? "in" : "out"}
          </span>
        </div>
      </div>
    </article>
  )
}

function PendingRow() {
  return (
    <div className="flex gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
        <Bot className="size-4" />
      </div>
      <div className="flex items-center gap-1.5 rounded-xl rounded-tl-sm border border-border bg-card px-4 py-3.5">
        <span className="sr-only">Assistant is typing</span>
        <Dot delay="0ms" />
        <Dot delay="150ms" />
        <Dot delay="300ms" />
      </div>
    </div>
  )
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70"
      style={{ animationDelay: delay }}
    />
  )
}
