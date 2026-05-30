import { dbConnect } from "@/server/db/connect";
import { Notification } from "@/server/models/Notification";
import { UserSettings } from "@/server/models/UserSettings";
import { emitToUser } from "./pubsub";
import type { NotificationKind } from "@/types";

type NotifyInput = {
  kind: NotificationKind;
  title: string;
  body?: string;
  href?: string | null;
  payload?: Record<string, unknown>;
};

/**
 * Single entry point for emitting a notification. Always writes the row so it shows
 * up in the bell + /notifications list. SSE delivery is best-effort fire-and-forget;
 * email/push channels are gated by per-user opt-in.
 */
export async function notify(userId: string, input: NotifyInput): Promise<void> {
  await dbConnect();
  const doc = await Notification.create({
    userId,
    kind: input.kind,
    title: input.title,
    body: input.body ?? "",
    href: input.href ?? null,
    payload: input.payload ?? {},
  });

  const settings = await UserSettings.findOne({ userId });
  if (!settings || settings.notifyChannels.inApp) {
    emitToUser(userId, {
      id: String(doc._id),
      kind: input.kind,
      title: input.title,
      body: input.body ?? "",
      href: input.href ?? null,
      createdAt: new Date().toISOString(),
    });
  }
  // Email + push channels are surfaced via plan/22 nightly digest, not per-event push.
}
