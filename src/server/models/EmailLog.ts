import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

export const EMAIL_STATUSES = ["sent", "failed"] as const;
export type EmailStatus = (typeof EMAIL_STATUSES)[number];

const emailLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", default: null },
    grantId: { type: String, required: true },
    provider: { type: String, default: "unknown" },
    to: { type: [String], default: [] },
    cc: { type: [String], default: [] },
    bcc: { type: [String], default: [] },
    subject: { type: String, default: "" },
    bodyPreview: { type: String, default: "" }, // first 280 chars, no full body stored
    status: { type: String, enum: EMAIL_STATUSES, required: true },
    errorMessage: { type: String, default: null },
    messageId: { type: String, default: null }, // Nylas message id if available
    sentAt: { type: Date, default: Date.now },
    mode: { type: String, enum: ["compose", "test"], default: "compose" },
  },
  { timestamps: true },
);

export type EmailLogDoc = InferSchemaType<typeof emailLogSchema> & { _id: Types.ObjectId };

export const EmailLog: Model<EmailLogDoc> =
  (models.EmailLog as Model<EmailLogDoc>) ?? model<EmailLogDoc>("EmailLog", emailLogSchema);
