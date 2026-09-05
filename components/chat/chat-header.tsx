"use client"

import { ChevronDown, PanelLeft, PanelRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MODELS, type ModelId } from "@/lib/chat-data"

interface ChatHeaderProps {
  title: string
  model: ModelId
  onModelChange: (model: ModelId) => void
  onToggleLeft: () => void
  onToggleRight: () => void
}

export function ChatHeader({
  title,
  model,
  onModelChange,
  onToggleLeft,
  onToggleRight,
}: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-6">
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
        <div className="relative">
          <select
            value={model}
            onChange={(e) => onModelChange(e.target.value as ModelId)}
            aria-label="Select model"
            className="h-8 appearance-none rounded-md border border-border bg-card pl-3 pr-8 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {Object.values(MODELS).map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
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
