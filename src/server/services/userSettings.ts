import { z } from "zod";
import { UserSettings } from "@/server/models/UserSettings";
import { userSettingsToDto } from "@/server/serializers";
import {
  USER_SETTINGS_DATE_FILTERS,
  USER_SETTINGS_EXPERIENCE_BUCKETS,
  type UserSettingsDto,
} from "@/types";

export const userSettingsPatchSchema = z
  .object({
    autoApplyEnabled: z.boolean(),
    applyLimit: z.number().int().min(1).max(500),
    dateFilter: z.enum(USER_SETTINGS_DATE_FILTERS),
    includeKeywords: z.array(z.string().trim().min(1)).max(100),
    excludeKeywords: z.array(z.string().trim().min(1)).max(100),
    locations: z.array(z.string().trim().min(1)).max(50),
    experienceBuckets: z.array(z.enum(USER_SETTINGS_EXPERIENCE_BUCKETS)).max(5),
    salaryMin: z.number().int().min(0).nullable(),
    cronTimezone: z.string().trim().min(1).max(64),
    notifyChannels: z.object({
      inApp: z.boolean(),
      email: z.boolean(),
      push: z.boolean(),
    }),
    dailyReportEnabled: z.boolean(),
    emailTemplates: z.object({
      recruiter: z.string().max(8000),
      followUp: z.string().max(8000),
    }),
    interviewDefaults: z.object({
      questionCount: z.number().int().min(1).max(50),
      durationMin: z.number().int().min(5).max(180),
      categories: z.array(z.string().trim().min(1)).max(10),
      language: z.string().trim().min(2).max(8),
    }),
  })
  .partial();

export type UserSettingsPatch = z.infer<typeof userSettingsPatchSchema>;

/** Read the user's settings; lazily upsert defaults if no row exists yet. */
export async function getUserSettings(userId: string): Promise<UserSettingsDto> {
  const doc = await UserSettings.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return userSettingsToDto(doc!);
}

/** Apply a partial update; returns the full updated DTO. */
export async function updateUserSettings(
  userId: string,
  patch: UserSettingsPatch,
): Promise<UserSettingsDto> {
  const doc = await UserSettings.findOneAndUpdate(
    { userId },
    { $set: patch },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return userSettingsToDto(doc!);
}
