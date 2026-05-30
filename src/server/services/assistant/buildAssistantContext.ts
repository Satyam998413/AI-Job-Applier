import { User } from "@/server/models/User";
import { Match } from "@/server/models/Match";
import { QnA } from "@/server/models/QnA";
import { Job } from "@/server/models/Job";
import { EmailLog } from "@/server/models/EmailLog";
import { getDefaultResume } from "@/server/services/resume/getDefaultResume";
import type { MatchStatus } from "@/types";

/**
 * Build a compact, factual snapshot of the user's current state to prepend as system
 * context for every assistant turn. Keeps total token usage bounded.
 */
export async function buildAssistantContext(userId: string): Promise<string> {
  const [user, resume, matches, qnaCount, recentEmails] = await Promise.all([
    User.findById(userId, { fullName: 1, email: 1 }).lean(),
    getDefaultResume(userId),
    Match.find({ userId }, { jobId: 1, status: 1, score: 1, updatedAt: 1 })
      .sort({ updatedAt: -1 })
      .limit(40)
      .lean(),
    QnA.countDocuments({ userId }),
    EmailLog.find({ userId, status: "sent" })
      .sort({ sentAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const lines: string[] = [];
  lines.push(`# User snapshot (read-only context — do not echo back verbatim)`);
  lines.push(`Name: ${user?.fullName ?? "(unknown)"}`);
  lines.push(`Email: ${user?.email ?? "(unknown)"}`);

  if (!resume) {
    lines.push("Resume: not uploaded yet — strongly recommend uploading one to enable matching.");
  } else {
    lines.push(`Experience: ${resume.experienceYears} years.`);
    lines.push(`Resume summary: ${resume.summary || "(empty)"}`);
    lines.push(`Top skills: ${(resume.skills ?? []).slice(0, 25).join(", ") || "(none parsed)"}`);
  }

  // Pipeline counts + a few highlights.
  if (matches.length > 0) {
    const byStatus: Record<string, number> = {};
    for (const m of matches) byStatus[m.status as string] = (byStatus[m.status as string] ?? 0) + 1;
    lines.push(`Pipeline (totals): ${Object.entries(byStatus).map(([k, v]) => `${k}=${v}`).join(", ")}`);

    const inProgress = matches.filter((m) =>
      ["applied", "responded", "interview"].includes(m.status as MatchStatus),
    );
    if (inProgress.length > 0) {
      const ids = inProgress.slice(0, 6).map((m) => m.jobId);
      const jobs = await Job.find({ _id: { $in: ids } }, { title: 1, company: 1 }).lean();
      const byId = new Map(jobs.map((j) => [String(j._id), j]));
      lines.push("Active applications (status — title at company):");
      for (const m of inProgress.slice(0, 6)) {
        const j = byId.get(String(m.jobId));
        if (!j) continue;
        lines.push(`  - ${m.status} — ${j.title} at ${j.company}`);
      }
    }
  } else {
    lines.push("Pipeline: no jobs scored yet.");
  }

  lines.push(`Saved answers in library: ${qnaCount}`);

  if (recentEmails.length > 0) {
    lines.push("Recent outreach emails sent:");
    for (const e of recentEmails.slice(0, 5)) {
      lines.push(`  - "${(e.subject || "(no subject)").slice(0, 80)}" → ${(e.to ?? []).join(", ")}`);
    }
  }

  return lines.join("\n");
}
