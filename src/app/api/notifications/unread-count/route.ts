import { dbConnect } from "@/server/db/connect";
import { Notification } from "@/server/models/Notification";
import { getSession } from "@/server/auth/session";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    await dbConnect();
    const count = await Notification.countDocuments({ userId: session.userId, seenAt: null });
    return ok({ count });
  } catch (err) {
    return handleError(err);
  }
}
