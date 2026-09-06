"use client"

import { useMemo, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatComposer } from "@/components/chat/chat-composer"
import { ChatHeader } from "@/components/chat/chat-header"
import { ConversationList } from "@/components/chat/conversation-list"
import { MessageList } from "@/components/chat/message-list"
import { TokenSidebar } from "@/components/chat/token-sidebar"
import {
  type Conversation,
  type Message,
  INITIAL_CONVERSATIONS,
  estimateTokens,
} from "@/lib/chat-data"

export default function Page() {
  const [conversations, setConversations] = useState<Conversation[]>(
    INITIAL_CONVERSATIONS,
  )
  const [activeId, setActiveId] = useState(INITIAL_CONVERSATIONS[0].id)
  const [pending, setPending] = useState(false)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? conversations[0],
    [conversations, activeId],
  )

  function updateActive(mutate: (c: Conversation) => Conversation) {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? mutate(c) : c)),
    )
  }

  function handleNew() {
    const id = crypto.randomUUID()
    const fresh: Conversation = {
      id,
      title: "New conversation",
      model: active.model,
      messages: [],
      updatedAt: Date.now(),
    }
    setConversations((prev) => [fresh, ...prev])
    setActiveId(id)
    setShowLeft(false)
  }

  async function handleSend(text: string) {
    const now = Date.now()
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      promptTokens: estimateTokens(text),
      completionTokens: 0,
      createdAt: now,
    }

    updateActive((c) => ({
      ...c,
      title:
        c.messages.length === 0 ? text.slice(0, 48) : c.title,
      messages: [...c.messages, userMsg],
      updatedAt: now,
    }))
    setPending(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...active.messages, userMsg].map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to get a response")
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content,
        promptTokens: 0,
        completionTokens: data.usage.completion_tokens,
        responseTimeMs: data.responseTimeMs,
        tokensPerSecond: data.tokensPerSecond,
        createdAt: Date.now(),
      }
      updateActive((c) => ({
        ...c,
        messages: c.messages.map((message) =>
          message.id === userMsg.id
            ? { ...message, promptTokens: data.usage.prompt_tokens }
            : message,
        ).concat(assistantMsg),
        updatedAt: Date.now(),
      }))
    } catch (error) {
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          error instanceof Error
            ? `Unable to reach Groq: ${error.message}`
            : "Unable to reach Groq. Please try again.",
        promptTokens: 0,
        completionTokens: 0,
        createdAt: Date.now(),
      }
      updateActive((c) => ({
        ...c,
        messages: [...c.messages, assistantMsg],
        updatedAt: Date.now(),
      }))
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="grid h-screen grid-cols-1 overflow-hidden bg-background lg:grid-cols-[18rem_1fr] xl:grid-cols-[18rem_1fr_20rem]">
      {/* History panel — persistent on desktop */}
      <div className="hidden border-r border-sidebar-border lg:block">
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={(id) => setActiveId(id)}
          onNew={handleNew}
        />
      </div>

      {/* Chat column */}
      <div className="flex min-w-0 flex-col">
        <ChatHeader
          title={active.title}
          model={active.model}
          onToggleLeft={() => setShowLeft(true)}
          onToggleRight={() => setShowRight(true)}
        />
        {active.messages.length === 0 && !pending ? (
          <EmptyState />
        ) : (
          <MessageList messages={active.messages} pending={pending} />
        )}
        <ChatComposer onSend={handleSend} disabled={pending} />
      </div>

      {/* Usage sidebar — persistent on wide screens */}
      <div className="hidden border-l border-sidebar-border xl:block">
        <TokenSidebar conversation={active} />
      </div>

      {/* Mobile drawers */}
      <Drawer open={showLeft} side="left" onClose={() => setShowLeft(false)}>
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={(id) => {
            setActiveId(id)
            setShowLeft(false)
          }}
          onNew={handleNew}
        />
      </Drawer>
      <Drawer open={showRight} side="right" onClose={() => setShowRight(false)}>
        <TokenSidebar conversation={active} />
      </Drawer>
    </main>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 font-mono text-lg font-bold text-primary">
        {"//"}
      </span>
      <h3 className="mt-4 text-base font-semibold">Start a conversation</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground text-pretty">
        Send a message to begin. Every prompt and completion is metered live in
        the token usage panel.
      </p>
    </div>
  )
}

function Drawer({
  open,
  side,
  onClose,
  children,
}: {
  open: boolean
  side: "left" | "right"
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        side === "right" ? "xl:hidden" : "lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "absolute top-0 h-full w-[85%] max-w-xs shadow-xl transition-transform duration-300",
          side === "left" ? "left-0" : "right-0",
          open
            ? "translate-x-0"
            : side === "left"
              ? "-translate-x-full"
              : "translate-x-full",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className={cn(
            "absolute top-3 flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm",
            side === "left" ? "left-full ml-3" : "right-full mr-3",
          )}
        >
          <X className="size-4" />
        </button>
        {children}
      </div>
    </div>
  )
}
