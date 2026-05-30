import { dbConnect } from "@/server/db/connect";
import { AiProvider, type AiProviderName } from "@/server/models/AiProvider";
import { decrypt } from "@/server/crypto/secretBox";
import { env } from "@/lib/env";
import { createGeminiAdapter } from "./adapters/geminiAdapter";
import { createOpenAiAdapter, createGroqAdapter } from "./adapters/openaiAdapter";
import { createClaudeAdapter } from "./adapters/claudeAdapter";
import { createRotatingAdapter } from "./adapters/rotatingAdapter";
import type { LlmAdapter } from "./adapters/types";

const NO_PROVIDER_ERROR =
  "No AI provider configured. Add an API key for Gemini, OpenAI, Claude, or Groq in Settings.";

function buildAdapter(provider: AiProviderName, apiKey: string): LlmAdapter | null {
  switch (provider) {
    case "gemini":
      return createGeminiAdapter({ apiKey, model: env.GEMINI_MODEL });
    case "openai":
      return createOpenAiAdapter({ apiKey });
    case "claude":
      return createClaudeAdapter({ apiKey });
    case "groq":
      return createGroqAdapter({ apiKey });
    case "ollama":
      // Stored-only; not yet wired at runtime — skip for rotation.
      return null;
  }
}

/**
 * Return the ordered list of usable adapters for this user: active provider first,
 * then any other configured providers (newest update first), then the env-Gemini
 * fallback if present. Excludes providers we don't have a runtime adapter for.
 */
export async function getConfiguredAdapters(userId: string): Promise<LlmAdapter[]> {
  await dbConnect();
  const docs = await AiProvider.find({ userId }).sort({ isActive: -1, updatedAt: -1 });
  const list: LlmAdapter[] = [];
  for (const doc of docs) {
    const apiKey = decrypt(doc.encrypted);
    const adapter = buildAdapter(doc.provider as AiProviderName, apiKey);
    if (adapter) list.push(adapter);
  }
  if (env.GEMINI_API_KEY) {
    list.push(createGeminiAdapter({ apiKey: env.GEMINI_API_KEY, model: env.GEMINI_MODEL }));
  }
  return list;
}

/**
 * Resolve the LLM adapter for a user. When 2+ providers are configured we return a
 * rotating wrapper that fails over on transient errors (rate limit, 5xx, network).
 * With a single provider, returns it directly — same behavior as before.
 */
export async function getActiveAdapter(userId: string): Promise<LlmAdapter> {
  const adapters = await getConfiguredAdapters(userId);
  if (adapters.length === 0) throw new Error(NO_PROVIDER_ERROR);
  if (adapters.length === 1) return adapters[0];
  return createRotatingAdapter(adapters);
}
