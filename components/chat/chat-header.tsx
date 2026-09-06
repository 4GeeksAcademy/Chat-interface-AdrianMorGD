"use client"

import { PanelLeft, PanelRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MODELS, type ModelId } from "@/lib/chat-data"

interface ChatHeaderProps {
  title: string
  model: ModelId
  onToggleLeft: () => void
  onToggleRight: () => void
}

export function ChatHeader({
  title,
  model,
  onToggleLeft,
  onToggleRight,
}: ChatHeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          className="size-8 shrink-0 text-muted-foreground lg:hidden"
          onClick={onToggleLeft}
          aria-label="Toggle history panel"
        >
          <PanelLeft className="size-4" />
        </Button>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold tracking-tight">
            {title}
          </h2>
          <p className="font-mono text-[11px] text-muted-foreground">
            {MODELS[model].label}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium">
          {MODELS[model].label}
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="size-8 shrink-0 text-muted-foreground xl:hidden"
          onClick={onToggleRight}
          aria-label="Toggle usage panel"
        >
          <PanelRight className="size-4" />
        </Button>
      </div>
    </header>
  )
}
