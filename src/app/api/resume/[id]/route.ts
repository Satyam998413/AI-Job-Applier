import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Resume } from "@/server/models/Resume";
import { getSession } from "@/server/auth/session";
import { deleteResumeFile } from "@/server/services/resume/storage";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Invalid resume id", 400);

    await dbConnect();
    const target = await Resume.findOne({ _id: id, userId: session.userId });
    if (!target) return fail("Resume not found", 404);

    if (target.isDefault) {
      // Promote the next-most-recent resume to default so the user is never without one.
      const next = await Resume.findOne({ userId: session.userId, _id: { $ne: target._id } }).sort({
        updatedAt: -1,
      });
      if (next) await Resume.updateOne({ _id: next._id }, { $set: { isDefault: true } });
    }
    await deleteResumeFile(target.filePath);
    await Resume.deleteOne({ _id: target._id });

    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
