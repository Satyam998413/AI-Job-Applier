import * as Sentry from "@sentry/nextjs";
import { CronRun } from "@/server/models/CronRun";
import type { CronJob } from "@/types";
import { dailyJobFetch } from "./jobs/dailyJobFetch";
import { dailyDraftPrep } from "./jobs/dailyDraftPrep";
import { hourlyHrScrape } from "./jobs/hourlyHrScrape";
import { nightlyReport } from "./jobs/nightlyReport";

const JOB_HANDLERS: Record<CronJob, () => Promise<{ userCount: number; stats: Record<string, unknown> }>> = {
  dailyJobFetch,
  dailyDraftPrep,
  hourlyHrScrape,
  nightlyReport,
};

/**
 * Records a CronRun row, runs the job synchronously, persists userCount/stats/errors.
 * Each handler is capped to 100 users per firing to stay within Vercel's function
 * timeout. Higher-volume workloads will need a real worker (BullMQ etc.).
 */
export async function runCronJob(job: CronJob, scheduledAt: Date): Promise<void> {
  const run = await CronRun.create({ job, scheduledAt, startedAt: new Date(), status: "running" });
  try {
    const result = await JOB_HANDLERS[job]();
    await CronRun.updateOne(
      { _id: run._id },
      {
        $set: {
          status: "succeeded",
          completedAt: new Date(),
          userCount: result.userCount,
          stats: result.stats,
        },
      },
    );
  } catch (err) {
    Sentry.captureException(err);
    await CronRun.updateOne(
      { _id: run._id },
      {
        $set: {
          status: "failed",
          completedAt: new Date(),
          errors: [{ userId: null, message: err instanceof Error ? err.message : "unknown" }],
        },
      },
    );
  }
}
