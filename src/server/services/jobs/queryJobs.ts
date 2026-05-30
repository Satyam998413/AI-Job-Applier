import type { FilterQuery } from "mongoose";
import { Job, type JobDoc } from "@/server/models/Job";
import { Match } from "@/server/models/Match";
import { jobToDto } from "@/server/serializers";
import type { JobDto, MatchStatus } from "@/types";

export type JobMode = "remote" | "hybrid" | "onsite";
export type DatePosted = "24h" | "7d" | "30d" | "all";
export type JobSort = "latest" | "bestMatch" | "highestSalary";

export type JobsFilter = {
  q?: string;
  location?: string;
  mode?: JobMode;
  salaryMin?: number;
  experienceLevel?: string;
  employmentType?: string;
  datePosted?: DatePosted;
  sort?: JobSort;
};

export type JobListItem = JobDto & {
  score: number | null;
  status: MatchStatus | null;
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function dateCutoff(d: DatePosted | undefined): Date | null {
  if (!d || d === "all") return null;
  const ms = d === "24h" ? 1 : d === "7d" ? 7 : 30;
  return new Date(Date.now() - ms * 24 * 60 * 60 * 1000);
}

function buildMongoFilter(filters: JobsFilter): FilterQuery<JobDoc> {
  const and: FilterQuery<JobDoc>[] = [];

  if (filters.q?.trim()) {
    const r = new RegExp(escapeRegex(filters.q.trim()), "i");
    and.push({ $or: [{ title: r }, { company: r }, { description: r }] });
  }
  if (filters.location?.trim()) {
    and.push({ location: new RegExp(escapeRegex(filters.location.trim()), "i") });
  }
  if (filters.mode === "remote") and.push({ isRemote: true });
  if (filters.mode === "onsite") and.push({ isRemote: false });
  // "hybrid" isn't a JSearch flag; match by location keyword as a fallback.
  if (filters.mode === "hybrid") and.push({ location: /hybrid/i });

  if (typeof filters.salaryMin === "number" && filters.salaryMin > 0) {
    and.push({ salaryMax: { $gte: filters.salaryMin } });
  }
  if (filters.experienceLevel) and.push({ experienceLevel: filters.experienceLevel });
  if (filters.employmentType) {
    and.push({ employmentType: new RegExp(escapeRegex(filters.employmentType), "i") });
  }
  const cutoff = dateCutoff(filters.datePosted);
  if (cutoff) and.push({ postedAt: { $gte: cutoff } });

  return and.length ? { $and: and } : {};
}

function compareScored(a: JobListItem, b: JobListItem): number {
  if (a.score === null && b.score === null) return 0;
  if (a.score === null) return 1;
  if (b.score === null) return -1;
  return b.score - a.score;
}

function compareSalary(a: JobListItem, b: JobListItem): number {
  const av = a.salaryMax ?? -1;
  const bv = b.salaryMax ?? -1;
  return bv - av;
}

/**
 * Server-side job query for both the API and the jobs page. Applies filters,
 * joins each job with the user's match score/status, then sorts.
 */
export async function queryJobs(userId: string, filters: JobsFilter): Promise<JobListItem[]> {
  const mongoFilter = buildMongoFilter(filters);
  const jobs = await Job.find(mongoFilter).sort({ postedAt: -1 }).limit(200);

  const matches = await Match.find(
    { userId, jobId: { $in: jobs.map((j) => j._id) } },
    { jobId: 1, score: 1, status: 1 },
  );
  const matchByJob = new Map(matches.map((m) => [String(m.jobId), m]));

  const items: JobListItem[] = jobs.map((job) => {
    const match = matchByJob.get(String(job._id));
    return {
      ...jobToDto(job),
      score: match?.score ?? null,
      status: match?.status ?? null,
    };
  });

  if (filters.sort === "bestMatch") items.sort(compareScored);
  else if (filters.sort === "highestSalary") items.sort(compareSalary);
  // "latest" matches the initial Mongo sort by postedAt desc.

  return items;
}
