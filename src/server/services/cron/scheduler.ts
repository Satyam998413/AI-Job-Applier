import cron, { type ScheduledTask } from "node-cron";
import * as Sentry from "@sentry/nextjs";
import { CRON_JOBS, type CronJob } from "@/types";
import { runCronJob } from "./runCronJob";
import { env } from "@/lib/env";

/**
 * CRON schedules using node-cron (Unix cron syntax)
 * Replaces Vercel's native cron for local dev/testing and self-hosted deployments
 */
const CRON_SCHEDULES: Record<CronJob, string> = {
  dailyJobFetch: "0 9 * * *",      // 9 AM daily
  dailyDraftPrep: "30 9 * * *",    // 9:30 AM daily
  hourlyHrScrape: "0 * * * *",     // Every hour
  nightlyReport: "0 22 * * *",     // 10 PM daily
};

let tasks: Map<CronJob, ScheduledTask> = new Map();

/**
 * Initialize all cron jobs. Skipped if CRON_DISABLED=true or running on Vercel.
 * In production on Vercel, Vercel's native crons trigger the /api/cron/[job] endpoint.
 * For local dev or self-hosted, node-cron takes over.
 */
export async function initializeCronScheduler(): Promise<void> {
  // Skip if explicitly disabled
  if (env.CRON_DISABLED === "true") {
    console.log("[Cron] Scheduler disabled via CRON_DISABLED env var");
    return;
  }

  // Skip on Vercel (Vercel's native crons will handle triggering)
  if (process.env.VERCEL) {
    console.log("[Cron] Running on Vercel; using native crons instead of node-cron");
    return;
  }

  console.log("[Cron] Initializing node-cron scheduler...");

  for (const jobName of CRON_JOBS) {
    const schedule = CRON_SCHEDULES[jobName];
    try {
      const task = cron.schedule(schedule, async () => {
        try {
          console.log(`[Cron] Executing: ${jobName}`);
          await runCronJob(jobName, new Date());
          console.log(`[Cron] Completed: ${jobName}`);
        } catch (err) {
          console.error(`[Cron] Failed: ${jobName}`, err);
          Sentry.captureException(err, {
            tags: { component: "cron", job: jobName },
          });
        }
      });

      tasks.set(jobName, task);
      console.log(`[Cron] Scheduled ${jobName} → "${schedule}"`);
    } catch (err) {
      console.error(`[Cron] Failed to schedule ${jobName}:`, err);
      Sentry.captureException(err, {
        tags: { component: "cron", job: jobName, phase: "init" },
      });
    }
  }

  console.log(`[Cron] Scheduler ready (${tasks.size} jobs)`);
}

/**
 * Stop all cron tasks (cleanup on shutdown)
 */
export function stopCronScheduler(): void {
  for (const [jobName, task] of tasks) {
    task.stop();
    console.log(`[Cron] Stopped: ${jobName}`);
  }
  tasks.clear();
}
