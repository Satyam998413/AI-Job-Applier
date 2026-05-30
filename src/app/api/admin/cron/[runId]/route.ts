import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { CronRun } from "@/server/models/CronRun";
import { isCurrentAdmin } from "@/server/auth/requireAdmin";
import { cronRunToDto } from "@/server/serializers";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ runId: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const admin = await isCurrentAdmin();
    if (!admin) return fail("Forbidden", 403);

    const { runId } = await params;
    if (!isValidObjectId(runId)) return fail("Invalid run id", 400);

    await dbConnect();
    const run = await CronRun.findById(runId);
    if (!run) return fail("Run not found", 404);
    return ok(cronRunToDto(run));
  } catch (err) {
    return handleError(err);
  }
}
