import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { LlmAdapter } from "./types";

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 4096;

/**
 * Retry wrapper with exponential backoff for Claude API calls.
 * Handles temporary 503 errors from high demand spikes.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const isRetryable =
        err instanceof Error && (
          err.message.includes("503") ||
          err.message.includes("UNAVAILABLE") ||
          err.message.includes("overloaded") ||
          (err as any).status === 503 ||
          (err as any).status === 529
        );

      if (!isRetryable || attempt === maxRetries) {
        throw err;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delayMs = Math.min(1000 * Math.pow(2, attempt), 4000);
      console.warn(
        `Claude API temporary unavailable (attempt ${attempt + 1}/${maxRetries}). Retrying in ${delayMs}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Max retries exceeded");
}

export function createClaudeAdapter({ apiKey, model = DEFAULT_MODEL }: { apiKey: string; model?: string }): LlmAdapter {
  const client = new Anthropic({ apiKey });

  return {
    provider: "claude",
    async generateJson({ schema, systemInstruction, prompt }) {
      const inputSchema = zodToJsonSchema(schema, { $refStrategy: "none" }) as Record<string, unknown>;
      delete inputSchema.$schema;

      // Force-call a single tool whose input_schema is our target JSON shape.
      const response = await withRetry(() =>
        client.messages.create({
          model,
          max_tokens: MAX_TOKENS,
          temperature: 0,
          system: systemInstruction,
          messages: [{ role: "user", content: prompt }],
          tools: [
            {
              name: "respond",
              description: "Return the response in the required JSON shape.",
              input_schema: inputSchema as Anthropic.Tool.InputSchema,
            },
          ],
          tool_choice: { type: "tool", name: "respond" },
        }),
      );

      const toolUse = response.content.find((b) => b.type === "tool_use");
      if (!toolUse || toolUse.type !== "tool_use") {
        throw new Error("Claude did not return a tool_use response");
      }
      return schema.parse(toolUse.input);
    },
    async generateText({ systemInstruction, prompt }) {
      const response = await withRetry(() =>
        client.messages.create({
          model,
          max_tokens: MAX_TOKENS,
          temperature: 0.3,
          system: systemInstruction,
          messages: [{ role: "user", content: prompt }],
        }),
      );
      const text = response.content
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("")
        .trim();
      if (!text) throw new Error("Claude returned an empty response");
      return text;
    },
    async generateChat({ systemInstruction, messages }) {
      const response = await withRetry(() =>
        client.messages.create({
          model,
          max_tokens: MAX_TOKENS,
          temperature: 0.4,
          system: systemInstruction,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      );
      const text = response.content
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("")
        .trim();
      if (!text) throw new Error("Claude returned an empty response");
      return text;
    },
  };
}
