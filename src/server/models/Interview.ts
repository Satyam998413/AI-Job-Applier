import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

export const INTERVIEW_STATUSES = [
  "pending",
  "live",
  "completed",
  "scoring",
  "scored",
  "failed",
] as const;
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];

const interviewQuestionSchema = new Schema(
  {
    question: { type: String, required: true },
    category: { type: String, required: true },
    askedAt: { type: Date, default: null },
    answeredAt: { type: Date, default: null },
    transcript: { type: String, default: "" },
    codeSubmission: { type: String, default: "" },
  },
  { _id: false },
);

const interviewMediaSchema = new Schema(
  {
    kind: { type: String, enum: ["audio", "video"], required: true },
    storageKey: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
    durationMs: { type: Number, default: 0 },
    sizeBytes: { type: Number, default: 0 },
  },
  { _id: false },
);

const rubricEntrySchema = new Schema(
  { criterion: { type: String, required: true }, score: { type: Number, min: 0, max: 100, required: true }, comment: { type: String, default: "" } },
  { _id: false },
);

const interviewScoresSchema = new Schema(
  {
    communication: { type: Number, default: null },
    technical: { type: Number, default: null },
    confidence: { type: Number, default: null },
    overall: { type: Number, default: null },
    rubric: { type: [rubricEntrySchema], default: [] },
  },
  { _id: false },
);

const interviewShareSchema = new Schema(
  {
    tokenHash: { type: String, default: null },
    expiresAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
    viewedCount: { type: Number, default: 0 },
  },
  { _id: false },
);

const interviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", default: null },
    matchId: { type: Schema.Types.ObjectId, ref: "Match", default: null },
    status: { type: String, enum: INTERVIEW_STATUSES, default: "pending" },
    questions: { type: [interviewQuestionSchema], default: [] },
    media: { type: [interviewMediaSchema], default: [] },
    scores: { type: interviewScoresSchema, default: () => ({}) },
    share: { type: interviewShareSchema, default: () => ({}) },
    language: { type: String, default: "en" },
    durationMin: { type: Number, default: 30 },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Public lookup by shared token.
interviewSchema.index({ "share.tokenHash": 1 }, { unique: true, sparse: true });

export type InterviewDoc = InferSchemaType<typeof interviewSchema> & { _id: Types.ObjectId };

export const Interview: Model<InterviewDoc> =
  (models.Interview as Model<InterviewDoc>) ??
  model<InterviewDoc>("Interview", interviewSchema);
