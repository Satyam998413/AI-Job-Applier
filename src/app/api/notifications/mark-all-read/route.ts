import { dbConnect } from "@/server/db/connect";
import { Notification } from "@/server/models/Notification";
import { getSession } from "@/server/auth/session";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    await dbConnect();
    await Notification.updateMany(
      { userId: session.userId, seenAt: null },
      { $set: { seenAt: new Date() } },
    );
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
