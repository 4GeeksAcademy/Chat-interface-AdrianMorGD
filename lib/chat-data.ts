export type Role = "user" | "assistant"

export interface Message {
  id: string
  role: Role
  content: string
  promptTokens: number
  completionTokens: number
  responseTimeMs?: number
  tokensPerSecond?: number
  createdAt: number
}

export interface Conversation {
  id: string
  title: string
  model: ModelId
  messages: Message[]
  updatedAt: number
}

export type ModelId = "qwen/qwen3.8-27b"

export interface ModelSpec {
  id: ModelId
  label: string
  contextWindow: number
  /** USD per 1M tokens */
  inputPrice: number
  outputPrice: number
}

export const MODELS: Record<ModelId, ModelSpec> = {
  "qwen/qwen3.8-27b": {
    id: "qwen/qwen3.8-27b",
    label: "Qwen 3.8 27B",
    contextWindow: 131_072,
    inputPrice: 0,
    outputPrice: 0,
  },
}

/** Cheap heuristic that mimics a tokenizer well enough for a live meter. */
export function estimateTokens(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return Math.max(1, Math.round(trimmed.length / 4))
}

export function costForMessage(msg: Message, model: ModelSpec): number {
  return (
    (msg.promptTokens * model.inputPrice) / 1_000_000 +
    (msg.completionTokens * model.outputPrice) / 1_000_000
  )
}

export function formatCost(usd: number): string {
  if (usd === 0) return "$0.0000"
  if (usd < 0.01) return `$${usd.toFixed(4)}`
  return `$${usd.toFixed(2)}`
}

export function formatTokens(n: number): string {
  return n.toLocaleString("en-US")
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: true,
  })
}

export function relativeDay(ts: number): string {
  const now = new Date()
  const then = new Date(ts)
  const diffDays = Math.floor((now.getTime() - then.getTime()) / 86_400_000)
  if (diffDays <= 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

/**
 * Fixed base timestamp for seed data so the server and client render identical
 * values (avoids React hydration mismatches). Runtime messages use Date.now().
 */
const now = 1_788_500_000_000 // ~2026-09-04

let seedId = 0
function mkMessage(
  role: Role,
  content: string,
  createdAt: number,
): Message {
  const tokens = estimateTokens(content)
  return {
    id: `seed-${seedId++}`,
    role,
    content,
    promptTokens: role === "user" ? tokens : 0,
    completionTokens: role === "assistant" ? tokens : 0,
    createdAt,
  }
}

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    title: "Optimizing a Postgres query",
    model: "qwen/qwen3.8-27b",
    updatedAt: now - 1000 * 60 * 12,
    messages: [
      mkMessage(
        "user",
        "My dashboard query does a sequential scan over 4M rows and takes 3s. How do I make it fast?",
        now - 1000 * 60 * 18,
      ),
      mkMessage(
        "assistant",
        "Start by running EXPLAIN (ANALYZE, BUFFERS) to confirm the seq scan and see the row estimates. The usual fix is a composite index that matches your WHERE + ORDER BY, e.g. CREATE INDEX ON events (tenant_id, created_at DESC). If you filter on a low-cardinality status column too, put the equality column first. After indexing, re-run EXPLAIN — you want an Index Scan and a much smaller shared-buffers read.",
        now - 1000 * 60 * 17,
      ),
      mkMessage(
        "user",
        "It still scans because I filter on date_trunc('day', created_at). Ideas?",
        now - 1000 * 60 * 13,
      ),
      mkMessage(
        "assistant",
        "That's the classic function-on-column trap — the planner can't use a plain btree on created_at once it's wrapped in date_trunc. Two options: (1) rewrite the predicate as a range, created_at >= :day AND created_at < :day + interval '1 day', so the index applies directly, or (2) create an expression index: CREATE INDEX ON events ((date_trunc('day', created_at))). Option 1 is almost always better because it keeps the index reusable for other ranges.",
        now - 1000 * 60 * 12,
      ),
    ],
  },
  {
    id: "c2",
    title: "Product launch tweet variants",
    model: "qwen/qwen3.8-27b",
    updatedAt: now - 1000 * 60 * 60 * 4,
    messages: [
      mkMessage(
        "user",
        "Write 3 punchy launch tweets for a token-usage analytics tool for AI apps.",
        now - 1000 * 60 * 60 * 4 - 60000,
      ),
      mkMessage(
        "assistant",
        "1. Stop guessing what your LLM calls cost. See every token, every model, every dollar — live. 2. Your AI app has a metabolism. We built the fitness tracker for it. 3. Prompt in, insight out: real-time token + cost analytics for teams shipping with LLMs.",
        now - 1000 * 60 * 60 * 4,
      ),
    ],
  },
  {
    id: "c3",
    title: "Explain vector embeddings",
    model: "qwen/qwen3.8-27b",
    updatedAt: now - 1000 * 60 * 60 * 27,
    messages: [
      mkMessage(
        "user",
        "Explain embeddings like I'm a backend dev who's never touched ML.",
        now - 1000 * 60 * 60 * 27 - 60000,
      ),
      mkMessage(
        "assistant",
        "An embedding is just a fixed-length array of floats that represents the meaning of some text. Think of it as a hash, except similar inputs produce nearby outputs instead of wildly different ones. You call an embeddings API, get back e.g. 1536 numbers, and store them in a vector column. To find related content you compute cosine similarity between vectors — that's the whole trick behind semantic search and RAG.",
        now - 1000 * 60 * 60 * 27,
      ),
    ],
  },
]

