import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Job } from "@/server/models/Job";
import { Match } from "@/server/models/Match";
import { getSession } from "@/server/auth/session";
import { matchToDto } from "@/server/serializers";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

/** Semi-automatic apply: record that the user applied. The client opens the real posting. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Invalid job id", 400);

    await dbConnect();
    const job = await Job.findById(id);
    if (!job) return fail("Job not found", 404);

    const now = new Date();
    const match = await Match.findOneAndUpdate(
      { userId: session.userId, jobId: job._id },
      {
        $set: { status: "applied", appliedAt: now },
        $push: { statusHistory: { status: "applied", at: now, note: "" } },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return ok(matchToDto(match!), 201);
  } catch (err) {
    return handleError(err);
  }
}
