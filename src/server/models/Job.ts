import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";
import { normalizeForDedup } from "@/server/services/jobs/normalize";

const sourceEntrySchema = new Schema(
  {
    source: { type: String, required: true },
    externalId: { type: String, default: null },
  },
  { _id: false },
);

const extractedEmailSchema = new Schema(
  {
    email: { type: String, required: true },
    source: { type: String, enum: ["description", "page", "guess"], required: true },
    confidence: { type: Number, min: 0, max: 1, required: true },
    extractedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const jobSchema = new Schema(
  {
    externalId: { type: String },
    title: { type: String, required: true },
    company: { type: String, required: true },
    /** Derived from title — used for cross-source dedup. Kept in sync via pre-save hook. */
    normalizedTitle: { type: String, required: true, default: "" },
    /** Derived from company — used for cross-source dedup. Kept in sync via pre-save hook. */
    normalizedCompany: { type: String, required: true, default: "" },
    /** Provenance: every (source, externalId) pair that has resolved to this job. */
    sources: { type: [sourceEntrySchema], default: [] },
    location: { type: String, default: "Remote" },
    description: { type: String, required: true },
    url: { type: String, default: "" },
    source: { type: String, default: "seed" },
    tags: { type: [String], default: [] },
    postedAt: { type: Date, default: Date.now },
    salaryMin: { type: Number, default: null },
    salaryMax: { type: Number, default: null },
    salaryCurrency: { type: String, default: null },
    employmentType: { type: String, default: null },
    isRemote: { type: Boolean, default: null },
    experienceLevel: { type: String, enum: ["intern", "entry", "mid", "senior", "lead", null], default: null },
    /** Recruiter/HR contacts derived from the posting; see services/jobs/extractEmails. */
    extractedEmails: { type: [extractedEmailSchema], default: [] },
  },
  { timestamps: true },
);

jobSchema.pre("save", function syncNormalized(next) {
  if (this.isModified("title")) this.normalizedTitle = normalizeForDedup(this.title);
  if (this.isModified("company")) this.normalizedCompany = normalizeForDedup(this.company);
  next();
});

// Dedup live postings by provider id (sparse: only indexes docs that have one).
jobSchema.index({ externalId: 1 }, { unique: true, sparse: true });
// Dedup seed/manual postings (no externalId); partial so live postings can share title+company.
jobSchema.index(
  { title: 1, company: 1 },
  { unique: true, partialFilterExpression: { externalId: { $exists: false } } },
);
// Cross-source dedup lookup (non-unique — uniqueness is enforced in ingestJobs).
jobSchema.index({ normalizedTitle: 1, normalizedCompany: 1 });

export type JobDoc = InferSchemaType<typeof jobSchema> & { _id: Types.ObjectId };

export const Job: Model<JobDoc> = (models.Job as Model<JobDoc>) ?? model<JobDoc>("Job", jobSchema);
