import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

export const SYNC_STATUSES = ["active", "disconnected", "expired"] as const;
export type SyncStatus = (typeof SYNC_STATUSES)[number];

const connectedEmailSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    grantId: { type: String, required: true },
    provider: { type: String, required: true }, // "google" | "microsoft" | "imap" | ...
    emailAddress: { type: String, required: true, lowercase: true, trim: true },
    syncStatus: { type: String, enum: SYNC_STATUSES, default: "active" },
    connectedAt: { type: Date, default: Date.now },
    lastSyncAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type ConnectedEmailDoc = InferSchemaType<typeof connectedEmailSchema> & {
  _id: Types.ObjectId;
};

export const ConnectedEmail: Model<ConnectedEmailDoc> =
  (models.ConnectedEmail as Model<ConnectedEmailDoc>) ??
  model<ConnectedEmailDoc>("ConnectedEmail", connectedEmailSchema);
