import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Interview } from "@/server/models/Interview";
import { getSession } from "@/server/auth/session";
import { interviewToDto } from "@/server/serializers";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Invalid id", 400);

    await dbConnect();
    const interview = await Interview.findOne({ _id: id, userId: session.userId });
    if (!interview) return fail("Interview not found", 404);
    if (interview.status !== "preparing") {
      return fail("Interview is not in preparing state", 400);
    }

    // Move to live status - ready to record
    await Interview.updateOne(
      { _id: id },
      { status: "live", startedAt: new Date() },
    );

    const updated = await Interview.findById(id);
    return ok(interviewToDto(updated!), 200);
  } catch (err) {
    return handleError(err);
  }
}
