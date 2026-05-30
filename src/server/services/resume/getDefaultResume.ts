import { Resume, type ResumeDoc } from "@/server/models/Resume";

/**
 * Return the user's active resume. With multi-resume support, this is the row
 * flagged `isDefault: true`. For legacy single-resume users with no flag set,
 * fall back to the most-recently updated row.
 *
 * Use this everywhere that previously did `Resume.findOne({userId}).sort({updatedAt: -1})`.
 */
export async function getDefaultResume(userId: string): Promise<ResumeDoc | null> {
  const def = await Resume.findOne({ userId, isDefault: true });
  if (def) return def;
  return await Resume.findOne({ userId }).sort({ updatedAt: -1 });
}
