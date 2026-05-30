import { User } from "@/server/models/User";
import { Job } from "@/server/models/Job";
import { Match } from "@/server/models/Match";
import { Resume } from "@/server/models/Resume";
import { QnA } from "@/server/models/QnA";
import { EmailLog } from "@/server/models/EmailLog";
import { AiProvider } from "@/server/models/AiProvider";
import { JsearchKey } from "@/server/models/JsearchKey";
import { ConnectedEmail } from "@/server/models/ConnectedEmail";

export type AdminStats = {
  totalUsers: number;
  newUsersThisMonth: number;
  totalJobs: number;
  totalResumes: number;
  totalMatchesScored: number;
  totalTailored: number;
  totalApplied: number;
  totalAnswers: number;
  emailsSentThisMonth: number;
  emailsFailedThisMonth: number;
  activeAiProviders: { provider: string; count: number }[];
  usersWithJsearch: number;
  usersWithEmailConnected: number;
};

export type SuspiciousSignal = {
  kind: "highEmailFailureRate" | "jsearchExhausted" | "noActiveAiProvider";
  userId: string;
  detail: string;
};

function startOfThisMonth(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

export async function getAdminStats(): Promise<AdminStats> {
  const monthStart = startOfThisMonth();
  const [
    totalUsers,
    newUsersThisMonth,
    totalJobs,
    totalResumes,
    totalMatchesScored,
    totalTailored,
    totalApplied,
    totalAnswers,
    emailsSentThisMonth,
    emailsFailedThisMonth,
    providerAgg,
    usersWithJsearch,
    usersWithEmailConnected,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ createdAt: { $gte: monthStart } }),
    Job.countDocuments({}),
    Resume.countDocuments({}),
    Match.countDocuments({ score: { $ne: null } }),
    Match.countDocuments({ tailoredResume: { $exists: true, $ne: "" } }),
    Match.countDocuments({ status: "applied" }),
    QnA.countDocuments({}),
    EmailLog.countDocuments({ status: "sent", sentAt: { $gte: monthStart } }),
    EmailLog.countDocuments({ status: "failed", sentAt: { $gte: monthStart } }),
    AiProvider.aggregate<{ _id: string; count: number }>([
      { $match: { isActive: true } },
      { $group: { _id: "$provider", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    JsearchKey.countDocuments({ isActive: true }),
    ConnectedEmail.countDocuments({ syncStatus: "active" }),
  ]);

  return {
    totalUsers,
    newUsersThisMonth,
    totalJobs,
    totalResumes,
    totalMatchesScored,
    totalTailored,
    totalApplied,
    totalAnswers,
    emailsSentThisMonth,
    emailsFailedThisMonth,
    activeAiProviders: providerAgg.map((p) => ({ provider: p._id, count: p.count })),
    usersWithJsearch,
    usersWithEmailConnected,
  };
}

/** Lightweight anomaly detection across users — pure heuristics, no PII. */
export async function getSuspiciousSignals(): Promise<SuspiciousSignal[]> {
  const monthStart = startOfThisMonth();
  const signals: SuspiciousSignal[] = [];

  // High email-failure rate (>= 3 fails this month with >50% failure ratio).
  const failuresThisMonth = await EmailLog.aggregate<{ _id: string; sent: number; failed: number }>([
    { $match: { sentAt: { $gte: monthStart } } },
    {
      $group: {
        _id: "$userId",
        sent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
      },
    },
    { $match: { failed: { $gte: 3 } } },
    { $limit: 50 },
  ]);
  for (const row of failuresThisMonth) {
    const total = row.sent + row.failed;
    if (total > 0 && row.failed / total > 0.5) {
      signals.push({
        kind: "highEmailFailureRate",
        userId: String(row._id),
        detail: `${row.failed} failed / ${total} attempted this month`,
      });
    }
  }

  // JSearch quota exhausted.
  const exhausted = await JsearchKey.find({ $expr: { $gte: ["$usedThisMonth", "$totalLimit"] } })
    .limit(50)
    .lean();
  for (const e of exhausted) {
    signals.push({
      kind: "jsearchExhausted",
      userId: String(e.userId),
      detail: `${e.usedThisMonth}/${e.totalLimit} this month`,
    });
  }

  return signals.slice(0, 50);
}
