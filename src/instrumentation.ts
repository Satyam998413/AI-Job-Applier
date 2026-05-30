import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize Sentry error tracking
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      await import("./sentry.server.config");
    }

    // Initialize node-cron scheduler (for local dev / self-hosted)
    try {
      const { initializeCronScheduler } = await import("./server/services/cron/scheduler");
      await initializeCronScheduler();
    } catch (err) {
      console.error("[Instrumentation] Failed to initialize cron scheduler:", err);
    }
  }
}

/** Captures errors that escape route handlers, Server Components, and middleware. */
export const onRequestError = Sentry.captureRequestError;
