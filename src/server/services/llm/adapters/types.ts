import type { z } from "zod";

/**
 * Provider-agnostic LLM interface. Each adapter wraps one vendor SDK and exposes the
 * same operations. The resolver picks the right adapter for the current user.
 */
export interface LlmAdapter {
  readonly provider: AdapterProvider;

  generateJson<T>(args: {
    schema: z.ZodType<T>;
    systemInstruction: string;
    prompt: string;
  }): Promise<T>;

  generateText(args: { systemInstruction: string; prompt: string }): Promise<string>;

  /** Multi-turn chat. Roles are normalized to user/assistant; the adapter maps to provider conventions. */
  generateChat(args: { systemInstruction: string; messages: ChatMessage[] }): Promise<string>;
}

export type AdapterProvider = "gemini" | "openai" | "claude" | "groq" | "ollama";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
