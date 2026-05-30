import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Job } from "@/server/models/Job";
import { Match, MATCH_STATUSES } from "@/server/models/Match";
import { getSession } from "@/server/auth/session";
import { matchToDto } from "@/server/serializers";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

const bodySchema = z.object({
  status: z.enum(MATCH_STATUSES),
  note: z.string().trim().max(280).optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Invalid job id", 400);

    const { status, note } = bodySchema.parse(await req.json());

    await dbConnect();
    const job = await Job.findById(id);
    if (!job) return fail("Job not found", 404);

    const now = new Date();
    const update: Record<string, unknown> = { $set: { status }, $push: { statusHistory: { status, at: now, note: note ?? "" } } };

    // Stamp appliedAt the first time the user moves into the "applied" lane.
    const existing = await Match.findOne({ userId: session.userId, jobId: job._id });
    if (status === "applied" && (!existing || !existing.appliedAt)) {
      (update.$set as Record<string, unknown>).appliedAt = now;
    }

    const match = await Match.findOneAndUpdate(
      { userId: session.userId, jobId: job._id },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return ok(matchToDto(match!));
  } catch (err) {
    return handleError(err);
  }
}
