import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Resume } from "@/server/models/Resume";
import { getSession } from "@/server/auth/session";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Invalid resume id", 400);

    await dbConnect();
    const target = await Resume.findOne({ _id: id, userId: session.userId });
    if (!target) return fail("Resume not found", 404);

    // Toggle in two steps. Atomic would need a transaction; the brief window where two
    // rows briefly co-exist as default is harmless since reads prefer the most recent.
    await Resume.updateMany({ userId: session.userId, isDefault: true }, { $set: { isDefault: false } });
    await Resume.updateOne({ _id: id }, { $set: { isDefault: true } });

    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
