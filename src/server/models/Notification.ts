import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

export const NOTIFICATION_KINDS = [
  "applyFailed",
  "emailSent",
  "dailyReport",
  "interviewScored",
  "cronError",
  "matchScored",
] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    kind: { type: String, enum: NOTIFICATION_KINDS, required: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    href: { type: String, default: null },
    seenAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, createdAt: -1 });
// Cheap unread-count: matches docs where seenAt is null only.
notificationSchema.index(
  { userId: 1, seenAt: 1 },
  { partialFilterExpression: { seenAt: null } },
);

export type NotificationDoc = InferSchemaType<typeof notificationSchema> & { _id: Types.ObjectId };

export const Notification: Model<NotificationDoc> =
  (models.Notification as Model<NotificationDoc>) ??
  model<NotificationDoc>("Notification", notificationSchema);
