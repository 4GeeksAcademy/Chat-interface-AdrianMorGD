"use client"

import { ArrowUp } from "lucide-react"
import { useState, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { estimateTokens, formatTokens } from "@/lib/chat-data"

interface ChatComposerProps {
  onSend: (text: string) => void
  disabled: boolean
}

export function ChatComposer({ onSend, disabled }: ChatComposerProps) {
  const [value, setValue] = useState("")
  const draftTokens = estimateTokens(value)

  function submit() {
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue("")
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Enter" || e.shiftKey) return
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    e.preventDefault()
    submit()
  }

  return (
    <div className="shrink-0 border-t border-border bg-background/80 px-4 py-3 backdrop-blur md:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring/50">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Send a message…  (Enter to send, Shift+Enter for newline)"
            className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <Button
            size="icon"
            className="size-9 shrink-0 rounded-xl"
            onClick={submit}
            disabled={disabled || value.trim().length === 0}
            aria-label="Send message"
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
        <div className="mt-1.5 flex items-center justify-between px-1 font-mono text-[10px] text-muted-foreground">
          <span>{disabled ? "Waiting for response…" : "Ready"}</span>
          <span>~{formatTokens(draftTokens)} tokens in draft</span>
        </div>
      </div>
    </div>
  )
}
