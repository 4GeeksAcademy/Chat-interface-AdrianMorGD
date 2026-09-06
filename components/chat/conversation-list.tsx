"use client"

import { MessageSquarePlus, Search } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  type Conversation,
  MODELS,
  estimateTokens,
  formatTokens,
  relativeDay,
} from "@/lib/chat-data"

function conversationTokens(c: Conversation): number {
  return c.messages.reduce(
    (sum, m) => sum + m.promptTokens + m.completionTokens,
    0,
  )
}

interface ConversationListProps {
  conversations: Conversation[]
  activeId: string
  onSelect: (id: string) => void
  onNew: () => void
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
}: ConversationListProps) {
  const [query, setQuery] = useState("")

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <aside className="flex h-full w-full flex-col bg-sidebar">
      <div className="flex items-center justify-between gap-2 border-b border-sidebar-border px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-[11px] font-bold font-mono">
            {"//"}
          </span>
          <h1 className="text-sm font-semibold tracking-tight">Console</h1>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="size-8 text-muted-foreground hover:text-foreground"
          onClick={onNew}
          aria-label="New conversation"
        >
          <MessageSquarePlus className="size-4" />
        </Button>
      </div>

      <div className="px-3 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search history"
            className="h-9 w-full rounded-md border border-sidebar-border bg-background/60 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pb-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          History
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {filtered.length}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-3">
        <ul className="flex flex-col gap-1">
          {filtered.map((c) => {
            const active = c.id === activeId
            const tokens = conversationTokens(c)
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "group w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
                    active
                      ? "border-sidebar-border bg-sidebar-accent"
                      : "border-transparent hover:bg-sidebar-accent/50",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "line-clamp-1 text-sm font-medium",
                        active
                          ? "text-sidebar-accent-foreground"
                          : "text-foreground",
                      )}
                    >
                      {c.title}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                      {relativeDay(c.updatedAt)}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="rounded border border-sidebar-border bg-background/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {MODELS[c.model].label}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {formatTokens(tokens)} tok
                    </span>
                  </div>
                </button>
              </li>
            )
          })}
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              No conversations match “{query}”.
            </li>
          )}
        </ul>
      </nav>
    </aside>
  )
}
