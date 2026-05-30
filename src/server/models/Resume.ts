import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

const resumeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fileName: { type: String, required: true },
    rawText: { type: String, required: true },
    skills: { type: [String], default: [] },
    summary: { type: String, default: "" },
    experienceYears: { type: Number, default: 0 },
    extractedAt: { type: Date, default: Date.now },
    /** Multi-resume: the default is what match/tailor/cover-letter/interview-prep read. */
    isDefault: { type: Boolean, default: false },
    /** Original-file storage. Served via /api/resume/[id]/file (auth-gated). */
    filePath: { type: String, default: null },
    fileUrl: { type: String, default: null },
    mimeType: { type: String, default: null },
    fileSize: { type: Number, default: null },
  },
  { timestamps: true },
);

// Fast lookup of the active resume per user.
resumeSchema.index({ userId: 1, isDefault: 1 });

export type ResumeDoc = InferSchemaType<typeof resumeSchema> & { _id: Types.ObjectId };

export const Resume: Model<ResumeDoc> =
  (models.Resume as Model<ResumeDoc>) ?? model<ResumeDoc>("Resume", resumeSchema);
