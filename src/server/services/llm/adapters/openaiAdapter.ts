import OpenAI from "openai";
import type { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { LlmAdapter, AdapterProvider } from "./types";

type Opts = {
  apiKey: string;
  model?: string;
  baseURL?: string;
  /** Strict JSON schema is OpenAI gpt-4o+ only; Groq doesn't support it yet. */
  strictJsonSchema?: boolean;
  provider?: AdapterProvider;
};

const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

export function createOpenAiAdapter(opts: Opts): LlmAdapter {
  const isGroq = !!opts.baseURL?.includes("groq");
  const provider: AdapterProvider = opts.provider ?? (isGroq ? "groq" : "openai");
  const model = opts.model ?? (isGroq ? DEFAULT_GROQ_MODEL : DEFAULT_OPENAI_MODEL);
  const strict = opts.strictJsonSchema ?? !isGroq;
  const client = new OpenAI({ apiKey: opts.apiKey, baseURL: opts.baseURL });

  return {
    provider,
    async generateJson({ schema, systemInstruction, prompt }) {
      const jsonSchema = zodToJsonSchema(schema, { $refStrategy: "none" }) as Record<string, unknown>;
      delete jsonSchema.$schema;

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: systemInstruction },
        {
          role: "user",
          content: strict ? prompt : `${prompt}\n\nRespond ONLY with JSON matching this schema:\n${JSON.stringify(jsonSchema)}`,
        },
      ];

      const response = await client.chat.completions.create({
        model,
        temperature: 0,
        messages,
        response_format: strict
          ? { type: "json_schema", json_schema: { name: "response", schema: jsonSchema, strict: true } }
          : { type: "json_object" },
      });
      const text = response.choices[0]?.message?.content;
      if (!text) throw new Error(`${provider} returned an empty response`);
      return schema.parse(JSON.parse(text));
    },
    async generateText({ systemInstruction, prompt }) {
      const response = await client.chat.completions.create({
        model,
        temperature: 0.3,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt },
        ],
      });
      const text = response.choices[0]?.message?.content;
      if (!text) throw new Error(`${provider} returned an empty response`);
      return text;
    },
    async generateChat({ systemInstruction, messages: history }) {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: systemInstruction },
        ...history.map((m) => ({ role: m.role, content: m.content })),
      ];
      const response = await client.chat.completions.create({
        model,
        temperature: 0.4,
        messages,
      });
      const text = response.choices[0]?.message?.content;
      if (!text) throw new Error(`${provider} returned an empty response`);
      return text;
    },
  };
}

export function createGroqAdapter({ apiKey, model }: { apiKey: string; model?: string }): LlmAdapter {
  return createOpenAiAdapter({
    apiKey,
    model,
    baseURL: "https://api.groq.com/openai/v1",
    strictJsonSchema: false,
    provider: "groq",
  });
}
