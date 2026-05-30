import { dbConnect } from "@/server/db/connect";
import { CronRun } from "@/server/models/CronRun";
import { isCurrentAdmin } from "@/server/auth/requireAdmin";
import { cronRunToDto } from "@/server/serializers";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const admin = await isCurrentAdmin();
    if (!admin) return fail("Forbidden", 403);

    await dbConnect();
    const runs = await CronRun.find().sort({ scheduledAt: -1 }).limit(100);
    return ok(runs.map(cronRunToDto));
  } catch (err) {
    return handleError(err);
  }
}
