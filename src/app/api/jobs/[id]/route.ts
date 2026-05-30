import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Job } from "@/server/models/Job";
import { getSession } from "@/server/auth/session";
import { jobToDto } from "@/server/serializers";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Invalid job id", 400);

    await dbConnect();
    const job = await Job.findById(id);
    if (!job) return fail("Job not found", 404);

    return ok(jobToDto(job));
  } catch (err) {
    return handleError(err);
  }
}
