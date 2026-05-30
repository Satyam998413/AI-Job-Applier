import { z } from "zod";
import { dbConnect } from "@/server/db/connect";
import { Conversation, type ConversationDoc } from "@/server/models/Conversation";
import { getSession } from "@/server/auth/session";
import { chatWithAssistant } from "@/server/services/llm/chatWithAssistant";
import { enforceRateLimit } from "@/server/services/rateLimit";
import { ok, fail, handleError } from "@/lib/http";
import type {
  AssistantConversationDto,
  AssistantMessageDto,
  AssistantRole,
} from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(4000),
});

const MAX_HISTORY = 30;

function toDto(doc: ConversationDoc | null): AssistantConversationDto {
  if (!doc) return { messages: [], updatedAt: null };
  const messages: AssistantMessageDto[] = (doc.messages ?? []).map((m) => ({
    role: m.role as AssistantRole,
    content: m.content,
    at: (m.at instanceof Date ? m.at : new Date(m.at ?? Date.now())).toISOString(),
  }));
  return { messages, updatedAt: doc.updatedAt.toISOString() };
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    await dbConnect();
    const conv = await Conversation.findOne({ userId: session.userId });
    return ok(toDto(conv));
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const limited = await enforceRateLimit(session.userId, "assistant");
    if (limited) return limited;

    const { message } = bodySchema.parse(await req.json());

    await dbConnect();
    const conv =
      (await Conversation.findOne({ userId: session.userId })) ??
      new Conversation({ userId: session.userId, messages: [] });

    // Cap stored history so we don't blow up token usage forever.
    if (conv.messages.length > MAX_HISTORY) {
      conv.messages.splice(0, conv.messages.length - MAX_HISTORY);
    }

    const now = new Date();
    conv.messages.push({ role: "user", content: message, at: now });

    const reply = await chatWithAssistant(
      session.userId,
      conv.messages.map((m) => ({ role: m.role as AssistantRole, content: m.content })),
    );

    conv.messages.push({ role: "assistant", content: reply, at: new Date() });
    await conv.save();

    return ok(toDto(conv));
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    await dbConnect();
    await Conversation.findOneAndDelete({ userId: session.userId });
    return ok(toDto(null));
  } catch (err) {
    return handleError(err);
  }
}
