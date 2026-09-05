"use client"

import { Coins, Cpu, Gauge, TrendingUp } from "lucide-react"
import {
  type Conversation,
  MODELS,
  costForMessage,
  formatCost,
  formatTokens,
} from "@/lib/chat-data"
import { UsageBars } from "@/components/chat/usage-bars"

interface TokenSidebarProps {
  conversation: Conversation
}

export function TokenSidebar({ conversation }: TokenSidebarProps) {
  const model = MODELS[conversation.model]
  const { messages } = conversation

  const promptTokens = messages.reduce((s, m) => s + m.promptTokens, 0)
  const completionTokens = messages.reduce((s, m) => s + m.completionTokens, 0)
  const totalTokens = promptTokens + completionTokens
  const totalCost = messages.reduce((s, m) => s + costForMessage(m, model), 0)

  const contextPct = Math.min(100, (totalTokens / model.contextWindow) * 100)
  const promptPct = totalTokens ? (promptTokens / totalTokens) * 100 : 0

  const turns = messages.filter((m) => m.role === "assistant").length
  const avgOut = turns ? Math.round(completionTokens / turns) : 0

  return (
    <aside className="flex h-full w-full flex-col overflow-y-auto bg-sidebar">
      <div className="border-b border-sidebar-border px-5 py-3.5">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <Gauge className="size-4 text-primary" />
          Token Usage
        </h2>
      </div>

      <div className="flex flex-col gap-5 p-5">
        <section>
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Total tokens
            </span>
            <TrendCoin cost={totalCost} />
          </div>
          <p className="mt-1 font-mono text-3xl font-semibold tracking-tight tabular-nums">
            {formatTokens(totalTokens)}
          </p>

          {/* prompt / completion split */}
          <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full"
              style={{
                width: `${promptPct}%`,
                backgroundColor: "var(--color-chart-5)",
              }}
            />
            <div
              className="h-full flex-1"
              style={{ backgroundColor: "var(--color-chart-1)" }}
            />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[11px]">
            <LegendItem
              swatch="var(--color-chart-5)"
              label="Prompt"
              value={formatTokens(promptTokens)}
            />
            <LegendItem
              swatch="var(--color-chart-1)"
              label="Completion"
              value={formatTokens(completionTokens)}
              alignRight
            />
          </div>
        </section>

        <StatGrid>
          <StatCard
            icon={<Coins className="size-3.5" />}
            label="Est. cost"
            value={formatCost(totalCost)}
          />
          <StatCard
            icon={<Cpu className="size-3.5" />}
            label="Turns"
            value={String(turns)}
          />
          <StatCard
            icon={<TrendingUp className="size-3.5" />}
            label="Avg out"
            value={`${formatTokens(avgOut)}`}
          />
          <StatCard
            icon={<Gauge className="size-3.5" />}
            label="Messages"
            value={String(messages.length)}
          />
        </StatGrid>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Context window
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {contextPct.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.max(contextPct, 1)}%` }}
            />
          </div>
          <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
            {formatTokens(totalTokens)} / {formatTokens(model.contextWindow)}
          </p>
        </section>

        <section>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Usage per turn
          </span>
          <div className="mt-2">
            <UsageBars messages={messages} />
          </div>
        </section>

        <section className="rounded-lg border border-sidebar-border bg-background/50 p-3">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Model
          </span>
          <p className="mt-1 text-sm font-medium">{model.label}</p>
          <dl className="mt-2 grid grid-cols-2 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <dt>Input</dt>
            <dd className="text-right text-foreground">
              ${model.inputPrice}/M
            </dd>
            <dt>Output</dt>
            <dd className="text-right text-foreground">
              ${model.outputPrice}/M
            </dd>
            <dt>Context</dt>
            <dd className="text-right text-foreground">
              {formatTokens(model.contextWindow)}
            </dd>
          </dl>
        </section>
      </div>
    </aside>
  )
}

function TrendCoin({ cost }: { cost: number }) {
  return (
    <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[11px] text-primary">
      <Coins className="size-3" />
      {formatCost(cost)}
    </span>
  )
}

function LegendItem({
  swatch,
  label,
  value,
  alignRight,
}: {
  swatch: string
  label: string
  value: string
  alignRight?: boolean
}) {
  return (
    <div className={alignRight ? "text-right" : ""}>
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span
          className="size-2 rounded-sm"
          style={{ backgroundColor: swatch }}
        />
        {label}
      </span>
      <span className="ml-3.5 text-foreground">{value}</span>
    </div>
  )
}

function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-sidebar-border bg-background/50 p-3">
      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {icon}
        {label}
      </span>
      <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
        {value}
      </p>
    </div>
  )
}
