import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/server/auth/requireUser";
import { dbConnect } from "@/server/db/connect";
import { Conversation } from "@/server/models/Conversation";
import { AssistantView } from "./_components/AssistantView";
import type { AssistantConversationDto, AssistantMessageDto, AssistantRole } from "@/types";

export const runtime = "nodejs";

export default async function AssistantPage() {
  const user = await requireUser();
  await dbConnect();
  const conv = await Conversation.findOne({ userId: user.id });

  const initial: AssistantConversationDto = {
    messages: ((conv?.messages ?? []) as { role: string; content: string; at?: Date }[]).map(
      (m): AssistantMessageDto => ({
        role: m.role as AssistantRole,
        content: m.content,
        at: (m.at ? new Date(m.at) : new Date()).toISOString(),
      }),
    ),
    updatedAt: conv?.updatedAt ? conv.updatedAt.toISOString() : null,
  };

  return (
    <AppShell userName={user.fullName} isAdmin={user.isAdmin}>
      <AssistantView initial={initial} />
    </AppShell>
  );
}
