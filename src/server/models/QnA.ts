import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

export const QNA_SOURCES = ["saved", "ai"] as const;
export type QnaSource = (typeof QNA_SOURCES)[number];

const qnaSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    question: { type: String, required: true, trim: true },
    /** lowercase, punctuation-stripped, whitespace-collapsed form used for dedup + fuzzy match. */
    normalizedQuestion: { type: String, required: true, trim: true, index: true },
    answer: { type: String, required: true, trim: true },
    category: { type: String, default: "general", trim: true },
    source: { type: String, enum: QNA_SOURCES, default: "saved" },
    usageCount: { type: Number, default: 0, min: 0 },
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// One saved answer per (user, normalized question).
qnaSchema.index({ userId: 1, normalizedQuestion: 1 }, { unique: true });

export type QnaDoc = InferSchemaType<typeof qnaSchema> & { _id: Types.ObjectId; createdAt: Date };

export const QnA: Model<QnaDoc> = (models.QnA as Model<QnaDoc>) ?? model<QnaDoc>("QnA", qnaSchema);
