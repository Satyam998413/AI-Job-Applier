import { Match } from "@/server/models/Match";
import { Job } from "@/server/models/Job";
import type { MatchStatus } from "@/types";

export type PipelineItem = {
  matchId: string;
  jobId: string;
  jobTitle: string;
  jobCompany: string;
  jobLocation: string;
  status: MatchStatus;
  score: number | null;
  appliedAt: string | null;
  updatedAt: string;
};

export type PipelineByStatus = Record<MatchStatus, PipelineItem[]>;

const EMPTY: PipelineByStatus = {
  new: [],
  tailored: [],
  applied: [],
  responded: [],
  interview: [],
  offer: [],
  rejected: [],
  withdrawn: [],
};

/**
 * Group the user's matches by status with each job's metadata. Excludes `new` since
 * those aren't actionable in a pipeline view (they're just scored leads).
 */
export async function getPipeline(userId: string): Promise<PipelineByStatus> {
  const matches = await Match.find({ userId }).sort({ updatedAt: -1 });
  if (matches.length === 0) return { ...EMPTY };

  const jobIds = matches.map((m) => m.jobId);
  const jobs = await Job.find({ _id: { $in: jobIds } }, { title: 1, company: 1, location: 1 });
  const jobById = new Map(jobs.map((j) => [String(j._id), j]));

  const result: PipelineByStatus = { ...EMPTY };
  for (const m of matches) {
    const job = jobById.get(String(m.jobId));
    if (!job) continue;
    const status = m.status as MatchStatus;
    result[status].push({
      matchId: String(m._id),
      jobId: String(m.jobId),
      jobTitle: job.title,
      jobCompany: job.company,
      jobLocation: job.location,
      status,
      score: m.score ?? null,
      appliedAt: m.appliedAt ? m.appliedAt.toISOString() : null,
      updatedAt: new Date(m.updatedAt as unknown as string).toISOString(),
    });
  }
  return result;
}
