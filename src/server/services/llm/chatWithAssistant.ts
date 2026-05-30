import { getActiveAdapter } from "./resolver";
import { buildAssistantContext } from "@/server/services/assistant/buildAssistantContext";
import type { ChatMessage } from "./adapters/types";

export const ASSISTANT_SYSTEM_BASE =
  "You are a personal career coach for the user, embedded inside the AI Job Applier app. You are " +
  "concise, action-oriented, and grounded in the user's real data (resume, pipeline, saved answers). " +
  "Never invent jobs, employers, dates, or skills the user has not provided. When you suggest next " +
  "steps, point to a concrete action they can take in the app (e.g. 'open the Jobs page and search " +
  "for X', 'on the Resume page run an ATS check', 'on the job's detail page tailor your resume'). " +
  "Keep replies under ~180 words unless the user explicitly asks for more depth. Use Markdown for " +
  "structure (short headers, lists) when helpful, but no code fences or fluff.";

/** Run one assistant turn. Returns the assistant's reply text only — caller persists the conversation. */
export async function chatWithAssistant(userId: string, messages: ChatMessage[]): Promise<string> {
  const [adapter, context] = await Promise.all([
    getActiveAdapter(userId),
    buildAssistantContext(userId),
  ]);
  const systemInstruction = `${ASSISTANT_SYSTEM_BASE}\n\n${context}`;
  return adapter.generateChat({ systemInstruction, messages });
}
