import { Match } from "@/server/models/Match";
import { EmailLog } from "@/server/models/EmailLog";
import { QnA } from "@/server/models/QnA";
import { Job } from "@/server/models/Job";

export type ActivityKind = "matched" | "tailored" | "applied" | "emailSent" | "emailFailed" | "qnaSaved";

export type ActivityEvent = {
  id: string;
  kind: ActivityKind;
  at: string; // ISO
  title: string;
  detail: string;
  jobId?: string;
};

function describe(kind: ActivityKind): { title: string } {
  return { title: kind };
}

/** Mixed activity feed across matches, emails, and saved answers. Newest first, capped. */
export async function getUserActivity(userId: string, limit = 12): Promise<ActivityEvent[]> {
  const halfLimit = Math.max(4, limit);

  const [matches, emails, answers] = await Promise.all([
    Match.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(halfLimit)
      .populate("jobId", "title company")
      .lean(),
    EmailLog.find({ userId }).sort({ sentAt: -1 }).limit(halfLimit).lean(),
    QnA.find({ userId }).sort({ createdAt: -1 }).limit(halfLimit).lean(),
  ]);

  const events: ActivityEvent[] = [];

  for (const m of matches) {
    const populated = m.jobId as unknown as { _id: unknown; title?: string; company?: string } | null;
    const job = populated && typeof populated === "object" && "title" in populated ? populated : null;
    const jobLabel = job?.title && job?.company ? `${job.title} — ${job.company}` : "a job";
    const jobIdStr = job ? String(job._id) : String(m.jobId);

    if (m.appliedAt) {
      events.push({
        id: `${String(m._id)}-applied`,
        kind: "applied",
        at: new Date(m.appliedAt).toISOString(),
        title: "Marked as applied",
        detail: jobLabel,
        jobId: jobIdStr,
      });
    }
    if (m.tailoredResume) {
      events.push({
        id: `${String(m._id)}-tailored`,
        kind: "tailored",
        at: new Date(m.updatedAt as unknown as string).toISOString(),
        title: "Tailored resume",
        detail: jobLabel,
        jobId: jobIdStr,
      });
    }
    if (m.score !== null && m.score !== undefined) {
      events.push({
        id: `${String(m._id)}-matched`,
        kind: "matched",
        at: new Date(m.createdAt as unknown as string).toISOString(),
        title: `Match scored ${m.score}/100`,
        detail: jobLabel,
        jobId: jobIdStr,
      });
    }
  }

  for (const e of emails) {
    events.push({
      id: `email-${String(e._id)}`,
      kind: e.status === "sent" ? "emailSent" : "emailFailed",
      at: new Date(e.sentAt ?? (e.createdAt as unknown as string)).toISOString(),
      title: e.status === "sent" ? "Email sent" : "Email failed",
      detail: `${e.subject || "(no subject)"} → ${e.to.join(", ")}`,
      jobId: e.jobId ? String(e.jobId) : undefined,
    });
  }

  for (const q of answers) {
    events.push({
      id: `qna-${String(q._id)}`,
      kind: "qnaSaved",
      at: new Date(q.createdAt as unknown as string).toISOString(),
      title: q.source === "ai" ? "Saved an AI answer" : "Saved an answer",
      detail: q.question,
    });
  }

  // Reference unused helper to silence linter (kept in case we add labels later).
  void describe;

  events.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  return events.slice(0, limit);
}

/** Loader for any extra job titles referenced by events (after dedup). */
export async function loadJobsForEvents(events: ActivityEvent[]) {
  const ids = Array.from(new Set(events.map((e) => e.jobId).filter(Boolean) as string[]));
  if (ids.length === 0) return new Map<string, { title: string; company: string }>();
  const jobs = await Job.find({ _id: { $in: ids } }, { title: 1, company: 1 });
  return new Map(jobs.map((j) => [String(j._id), { title: j.title, company: j.company }]));
}
