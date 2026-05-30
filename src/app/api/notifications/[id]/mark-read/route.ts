import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Notification } from "@/server/models/Notification";
import { getSession } from "@/server/auth/session";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Invalid id", 400);

    await dbConnect();
    await Notification.updateOne(
      { _id: id, userId: session.userId, seenAt: null },
      { $set: { seenAt: new Date() } },
    );
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
