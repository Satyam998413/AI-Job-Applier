import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

const rateLimitSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bucket: { type: String, required: true },
    windowStart: { type: Date, required: true },
    count: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

rateLimitSchema.index({ userId: 1, bucket: 1, windowStart: 1 }, { unique: true });
// Auto-purge stale counters. 2h covers the longest configured window with margin.
rateLimitSchema.index({ windowStart: 1 }, { expireAfterSeconds: 7200 });

export type RateLimitDoc = InferSchemaType<typeof rateLimitSchema> & { _id: Types.ObjectId };

export const RateLimit: Model<RateLimitDoc> =
  (models.RateLimit as Model<RateLimitDoc>) ?? model<RateLimitDoc>("RateLimit", rateLimitSchema);
