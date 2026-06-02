import { GoogleGenAI } from "@google/genai";
import type { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { LlmAdapter } from "./types";

function toResponseSchema<T>(schema: z.ZodType<T>): Record<string, unknown> {
  const json = zodToJsonSchema(schema, { $refStrategy: "none" }) as Record<string, unknown>;
  delete json.$schema;
  return json;
}

/**
 * Retry wrapper with exponential backoff for Gemini API calls.
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
          err.message.includes("high demand")
        );

      if (!isRetryable || attempt === maxRetries) {
        throw err;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delayMs = Math.min(1000 * Math.pow(2, attempt), 4000);
      console.warn(
        `Gemini API temporary unavailable (attempt ${attempt + 1}/${maxRetries}). Retrying in ${delayMs}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Max retries exceeded");
}

export function createGeminiAdapter({ apiKey, model }: { apiKey: string; model: string }): LlmAdapter {
  const ai = new GoogleGenAI({ apiKey });

  return {
    provider: "gemini",
    async generateJson({ schema, systemInstruction, prompt }) {
      const response = await withRetry(() =>
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseJsonSchema: toResponseSchema(schema),
            temperature: 0,
          },
        }),
      );
      const text = response.text;
      if (!text) throw new Error("Gemini returned an empty response");
      return schema.parse(JSON.parse(text));
    },
    async generateText({ systemInstruction, prompt }) {
      const response = await withRetry(() =>
        ai.models.generateContent({
          model,
          contents: prompt,
          config: { systemInstruction, temperature: 0.3 },
        }),
      );
      const text = response.text;
      if (!text) throw new Error("Gemini returned an empty response");
      return text;
    },
    async generateChat({ systemInstruction, messages }) {
      // Gemini expects { role: "user" | "model", parts: [{ text }] }.
      const contents = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
      const response = await withRetry(() =>
        ai.models.generateContent({
          model,
          contents,
          config: { systemInstruction, temperature: 0.4 },
        }),
      );
      const text = response.text;
      if (!text) throw new Error("Gemini returned an empty response");
      return text;
    },
  };
}
