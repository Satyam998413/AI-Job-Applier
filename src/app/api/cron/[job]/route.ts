import { dbConnect } from "@/server/db/connect";
import { env } from "@/lib/env";
import { CRON_JOBS, type CronJob } from "@/types";
import { runCronJob } from "@/server/services/cron/runCronJob";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 60;

type Ctx = { params: Promise<{ job: string }> };

function isCronJob(value: string): value is CronJob {
  return (CRON_JOBS as readonly string[]).includes(value);
}

/**
 * Vercel Cron trigger endpoint. Vercel sends `Authorization: Bearer ${CRON_SECRET}`
 * automatically per its docs. Without CRON_SECRET configured, the endpoint refuses
 * every request — safe-by-default in dev.
 */
export async function POST(req: Request, { params }: Ctx) {
  try {
    if (!env.CRON_SECRET) return fail("CRON_SECRET not configured", 503);
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${env.CRON_SECRET}`) return fail("Unauthorized", 401);

    const { job } = await params;
    if (!isCronJob(job)) return fail(`Unknown cron job: ${job}`, 400);

    await dbConnect();
    await runCronJob(job, new Date());

    return ok({ job, status: "dispatched" });
  } catch (err) {
    return handleError(err);
  }
}
