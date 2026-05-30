import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

const DATE_FILTERS = ["last24h", "last2d", "last7d", "last30d"] as const;
const EXPERIENCE_BUCKETS = ["fresher", "1-3", "3-5", "5-10", "10+"] as const;

const userSettingsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    autoApplyEnabled: { type: Boolean, default: false },
    applyLimit: { type: Number, default: 25, min: 1, max: 500 },
    dateFilter: { type: String, enum: DATE_FILTERS, default: "last7d" },
    includeKeywords: { type: [String], default: [] },
    excludeKeywords: { type: [String], default: [] },
    locations: { type: [String], default: [] },
    experienceBuckets: { type: [String], enum: EXPERIENCE_BUCKETS, default: [] },
    salaryMin: { type: Number, default: null, min: 0 },
    cronTimezone: { type: String, default: "UTC" },
    notifyChannels: {
      type: new Schema(
        {
          inApp: { type: Boolean, default: true },
          email: { type: Boolean, default: false },
          push: { type: Boolean, default: false },
        },
        { _id: false },
      ),
      default: () => ({}),
    },
    dailyReportEnabled: { type: Boolean, default: true },
    emailTemplates: {
      type: new Schema(
        {
          recruiter: { type: String, default: "" },
          followUp: { type: String, default: "" },
        },
        { _id: false },
      ),
      default: () => ({}),
    },
    interviewDefaults: {
      type: new Schema(
        {
          questionCount: { type: Number, default: 10, min: 1, max: 50 },
          durationMin: { type: Number, default: 30, min: 5, max: 180 },
          categories: { type: [String], default: ["behavioral", "technical", "rolespecific"] },
          language: { type: String, default: "en" },
        },
        { _id: false },
      ),
      default: () => ({}),
    },
  },
  { timestamps: true },
);

export type UserSettingsDoc = InferSchemaType<typeof userSettingsSchema> & { _id: Types.ObjectId };

export const UserSettings: Model<UserSettingsDoc> =
  (models.UserSettings as Model<UserSettingsDoc>) ??
  model<UserSettingsDoc>("UserSettings", userSettingsSchema);

export const USER_SETTINGS_DATE_FILTERS = DATE_FILTERS;
export const USER_SETTINGS_EXPERIENCE_BUCKETS = EXPERIENCE_BUCKETS;
