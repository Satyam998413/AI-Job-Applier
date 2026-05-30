import { after } from "next/server";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Interview } from "@/server/models/Interview";
import { getSession } from "@/server/auth/session";
import { scoreInterview } from "@/server/services/interview/scoreInterview";
import { interviewToDto } from "@/server/serializers";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

/**
 * Marks the interview as completed and kicks off scoring via Next's `after()` so
 * the response returns immediately. Scoring writes its own `scored` / `failed`
 * status and emits an `interviewScored` notification when it's done.
 */
export async function POST(_req: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Invalid id", 400);

    await dbConnect();
    const doc = await Interview.findOneAndUpdate(
      { _id: id, userId: session.userId, status: { $in: ["live", "pending"] } },
      { $set: { status: "completed", completedAt: new Date() } },
      { new: true },
    );
    if (!doc) return fail("Interview not found or already completed", 404);

    after(() => scoreInterview(id));
    return ok(interviewToDto(doc), 202);
  } catch (err) {
    return handleError(err);
  }
}
