import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

export const MATCH_STATUSES = [
  "new",
  "tailored",
  "applied",
  "responded",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;
export type MatchStatusName = (typeof MATCH_STATUSES)[number];

const matchSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    // null until the job has been scored (an apply-only record can exist before matching).
    score: { type: Number, min: 0, max: 100, default: null },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    reasoning: { type: String, default: "" },
    tailoredResume: { type: String, default: "" },
    coverLetter: { type: String, default: "" },
    interviewQuestions: {
      type: [
        new Schema(
          {
            category: { type: String, required: true },
            question: { type: String, required: true },
            rationale: { type: String, default: "" },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    interviewPrepAt: { type: Date, default: null },
    status: { type: String, enum: MATCH_STATUSES, default: "new" },
    statusHistory: {
      type: [
        new Schema(
          {
            status: { type: String, enum: MATCH_STATUSES, required: true },
            at: { type: Date, default: Date.now },
            note: { type: String, default: "" },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    appliedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// One match record per user/job pair.
matchSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export type MatchDoc = InferSchemaType<typeof matchSchema> & {
  _id: Types.ObjectId;
  jobId: Types.ObjectId;
  createdAt: Date;
};

export const Match: Model<MatchDoc> =
  (models.Match as Model<MatchDoc>) ?? model<MatchDoc>("Match", matchSchema);
