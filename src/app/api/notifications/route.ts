import { dbConnect } from "@/server/db/connect";
import { Notification } from "@/server/models/Notification";
import { getSession } from "@/server/auth/session";
import { notificationToDto } from "@/server/serializers";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    await dbConnect();
    const rows = await Notification.find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    return ok(rows.map(notificationToDto));
  } catch (err) {
    return handleError(err);
  }
}
