import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

export const CRON_JOBS = ["dailyJobFetch", "dailyDraftPrep", "hourlyHrScrape", "nightlyReport"] as const;
export const CRON_STATUSES = ["pending", "running", "succeeded", "failed", "partial"] as const;

const errorEntrySchema = new Schema(
  { userId: { type: String, default: null }, message: { type: String, required: true } },
  { _id: false },
);

const cronRunSchema = new Schema(
  {
    job: { type: String, enum: CRON_JOBS, required: true },
    scheduledAt: { type: Date, required: true },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    status: { type: String, enum: CRON_STATUSES, default: "pending" },
    userCount: { type: Number, default: 0 },
    stats: { type: Schema.Types.Mixed, default: {} },
    errors: { type: [errorEntrySchema], default: [] },
  },
  { timestamps: true },
);

cronRunSchema.index({ job: 1, scheduledAt: -1 });
// Auto-prune after 180 days.
cronRunSchema.index({ scheduledAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });

export type CronRunDoc = InferSchemaType<typeof cronRunSchema> & { _id: Types.ObjectId };

export const CronRun: Model<CronRunDoc> =
  (models.CronRun as Model<CronRunDoc>) ?? model<CronRunDoc>("CronRun", cronRunSchema);
