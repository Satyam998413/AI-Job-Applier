import type { LlmAdapter, AdapterProvider, ChatMessage } from "./types";
import type { z } from "zod";

/**
 * Wraps a prioritized list of adapters and retries the next one on transient errors.
 * The first adapter in the list is "active"; others are configured fallbacks.
 *
 * Retryable: HTTP 429, 5xx, network timeouts, generic "fetch failed".
 * Not retryable: 4xx auth/key errors, zod parse failures, empty-response misuse.
 */
export function createRotatingAdapter(adapters: LlmAdapter[]): LlmAdapter {
  if (adapters.length === 0) {
    throw new Error("createRotatingAdapter requires at least one adapter");
  }
  const primary = adapters[0];

  return {
    provider: primary.provider as AdapterProvider,
    generateJson: async <T>(args: {
      schema: z.ZodType<T>;
      systemInstruction: string;
      prompt: string;
    }): Promise<T> => runRotation(adapters, (a) => a.generateJson(args)),
    generateText: async (args: { systemInstruction: string; prompt: string }): Promise<string> =>
      runRotation(adapters, (a) => a.generateText(args)),
    generateChat: async (args: {
      systemInstruction: string;
      messages: ChatMessage[];
    }): Promise<string> => runRotation(adapters, (a) => a.generateChat(args)),
  };
}

function isRetryable(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const message = err.message.toLowerCase();
  // Hard stops: auth issues / bad key / quota exhausted permanently.
  if (/401|403|invalid[_ ]?(api[_ ]?key|key)|unauthorized|forbidden|insufficient[_ ]?quota/u.test(message)) {
    return false;
  }
  // Validation / parse errors are model-quality issues, not transient.
  if (/zod|invalid_type|expected\s|json[_ ]?parse|empty response/i.test(message)) {
    return false;
  }
  // Transient signals.
  return /429|5\d{2}|rate[_ ]?limit|timeout|timed[_ ]?out|fetch failed|econnreset|network/u.test(
    message,
  );
}

async function runRotation<T>(
  adapters: LlmAdapter[],
  call: (adapter: LlmAdapter) => Promise<T>,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < adapters.length; i++) {
    const adapter = adapters[i];
    try {
      return await call(adapter);
    } catch (err) {
      lastError = err;
      const more = i < adapters.length - 1;
      if (!more || !isRetryable(err)) throw err;
      // eslint-disable-next-line no-console
      console.warn(
        `[llm-rotation] ${adapter.provider} failed (${(err as Error).message}); trying ${adapters[i + 1].provider}…`,
      );
    }
  }
  throw lastError ?? new Error("All providers failed");
}
