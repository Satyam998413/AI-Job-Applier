import { GoogleGenAI } from "@google/genai";
import type { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { LlmAdapter } from "./types";

function toResponseSchema<T>(schema: z.ZodType<T>): Record<string, unknown> {
  const json = zodToJsonSchema(schema, { $refStrategy: "none" }) as Record<string, unknown>;
  delete json.$schema;
  return json;
}

export function createGeminiAdapter({ apiKey, model }: { apiKey: string; model: string }): LlmAdapter {
  const ai = new GoogleGenAI({ apiKey });

  return {
    provider: "gemini",
    async generateJson({ schema, systemInstruction, prompt }) {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseJsonSchema: toResponseSchema(schema),
          temperature: 0,
        },
      });
      const text = response.text;
      if (!text) throw new Error("Gemini returned an empty response");
      return schema.parse(JSON.parse(text));
    },
    async generateText({ systemInstruction, prompt }) {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { systemInstruction, temperature: 0.3 },
      });
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
      const response = await ai.models.generateContent({
        model,
        contents,
        config: { systemInstruction, temperature: 0.4 },
      });
      const text = response.text;
      if (!text) throw new Error("Gemini returned an empty response");
      return text;
    },
  };
}
