import { createAnthropic } from "@ai-sdk/anthropic"

/**
 * Vercel AI Gateway client.
 * Once the AI Gateway is linked to the Vercel project, the gateway URL and key
 * are injected automatically. Until then, this falls back to a direct Anthropic
 * call when `ANTHROPIC_API_KEY` is set.
 */
const baseURL = process.env.AI_GATEWAY_URL || undefined
const apiKey = process.env.AI_GATEWAY_API_KEY || process.env.ANTHROPIC_API_KEY || ""

export const anthropic = createAnthropic({
  apiKey,
  ...(baseURL ? { baseURL } : {}),
})

type Task = "reasoning" | "drafting" | "rewrite" | "parsing"

const MODELS: Record<Task, string> = {
  reasoning: "claude-opus-4-6",
  drafting: "claude-sonnet-4-6",
  rewrite: "claude-haiku-4-5",
  parsing: "claude-haiku-4-5",
}

export function pickModel(task: Task) {
  return anthropic(MODELS[task])
}
