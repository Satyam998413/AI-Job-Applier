import { Job } from "@/server/models/Job";
import { Match } from "@/server/models/Match";
import { EmailLog } from "@/server/models/EmailLog";
import { QnA } from "@/server/models/QnA";
import { AiProvider, type AiProviderName } from "@/server/models/AiProvider";
import { JsearchKey, currentMonthKey } from "@/server/models/JsearchKey";
import { Resume } from "@/server/models/Resume";

export type UserStats = {
  jobsInDb: number;
  matchesScored: number;
  tailoredResumes: number;
  applied: number;
  emailsSentThisMonth: number;
  emailsFailedThisMonth: number;
  answersSaved: number;
  hasResume: boolean;
  activeAiProvider: AiProviderName | "env-gemini" | null;
  jsearch: { configured: boolean; usedThisMonth: number; totalLimit: number; remaining: number };
};

function startOfThisMonth(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const monthStart = startOfThisMonth();

  const [
    jobsInDb,
    matchesScored,
    tailoredResumes,
    applied,
    emailsSentThisMonth,
    emailsFailedThisMonth,
    answersSaved,
    hasResume,
    activeProviderDoc,
    jsearchDoc,
  ] = await Promise.all([
    Job.countDocuments({}),
    Match.countDocuments({ userId, score: { $ne: null } }),
    Match.countDocuments({ userId, tailoredResume: { $exists: true, $ne: "" } }),
    Match.countDocuments({ userId, status: "applied" }),
    EmailLog.countDocuments({ userId, status: "sent", sentAt: { $gte: monthStart } }),
    EmailLog.countDocuments({ userId, status: "failed", sentAt: { $gte: monthStart } }),
    QnA.countDocuments({ userId }),
    Resume.exists({ userId }).then(Boolean),
    AiProvider.findOne({ userId, isActive: true }, { provider: 1 }),
    JsearchKey.findOne({ userId }, { totalLimit: 1, usedThisMonth: 1, monthKey: 1 }),
  ]);

  let activeAiProvider: UserStats["activeAiProvider"] = null;
  if (activeProviderDoc) {
    activeAiProvider = activeProviderDoc.provider as AiProviderName;
  } else if (process.env.GEMINI_API_KEY) {
    activeAiProvider = "env-gemini";
  }

  const month = currentMonthKey();
  const isCurrentMonth = jsearchDoc?.monthKey === month;
  const used = jsearchDoc && isCurrentMonth ? jsearchDoc.usedThisMonth : 0;
  const total = jsearchDoc?.totalLimit ?? 100;

  return {
    jobsInDb,
    matchesScored,
    tailoredResumes,
    applied,
    emailsSentThisMonth,
    emailsFailedThisMonth,
    answersSaved,
    hasResume,
    activeAiProvider,
    jsearch: {
      configured: Boolean(jsearchDoc),
      usedThisMonth: used,
      totalLimit: total,
      remaining: Math.max(0, total - used),
    },
  };
}
