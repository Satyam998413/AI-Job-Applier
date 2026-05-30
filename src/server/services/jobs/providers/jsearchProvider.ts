import type { ExperienceLevel, JobProvider, JobQuery, RawJob } from "../jobProvider";

const JSEARCH_URL = "https://jsearch.p.rapidapi.com/search";

type JSearchJob = {
  job_id: string;
  job_title?: string;
  employer_name?: string;
  job_description?: string;
  job_apply_link?: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_is_remote?: boolean;
  job_employment_type?: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_salary_currency?: string;
  job_required_experience?: { required_experience_in_months?: number | null };
};

type JSearchResponse = { status?: string; data?: JSearchJob[]; message?: string };

function toLocation(job: JSearchJob): string {
  if (job.job_is_remote) return "Remote";
  const parts = [job.job_city, job.job_state, job.job_country].filter(Boolean);
  return parts.length ? parts.join(", ") : "Not specified";
}

function toExperienceLevel(months: number | null | undefined): ExperienceLevel | undefined {
  if (months == null) return undefined;
  if (months < 6) return "intern";
  if (months < 24) return "entry";
  if (months < 60) return "mid";
  if (months < 96) return "senior";
  return "lead";
}

function normalizeEmploymentType(raw?: string): string | undefined {
  if (!raw) return undefined;
  return raw.replace(/_/g, " ").toLowerCase();
}

function toRawJob(job: JSearchJob): RawJob | null {
  if (!job.job_title || !job.job_description) return null;
  const employmentType = normalizeEmploymentType(job.job_employment_type);
  const tags = [employmentType, job.job_is_remote ? "remote" : undefined].filter(Boolean) as string[];

  return {
    externalId: job.job_id,
    title: job.job_title,
    company: job.employer_name ?? "Unknown company",
    location: toLocation(job),
    description: job.job_description,
    url: job.job_apply_link ?? "",
    tags,
    salaryMin: job.job_min_salary ?? undefined,
    salaryMax: job.job_max_salary ?? undefined,
    salaryCurrency: job.job_salary_currency ?? undefined,
    employmentType,
    isRemote: job.job_is_remote ?? undefined,
    experienceLevel: toExperienceLevel(job.job_required_experience?.required_experience_in_months),
  };
}

/** Build a JSearch provider with a per-user API key. */
export function createJsearchProvider(apiKey: string): JobProvider {
  return {
    source: "jsearch",
    async fetchJobs(query?: JobQuery): Promise<RawJob[]> {
      if (!query?.role?.trim()) throw new Error("Enter a role to search for jobs.");

      const search = query.location ? `${query.role} in ${query.location}` : query.role;
      const url = `${JSEARCH_URL}?query=${encodeURIComponent(search)}&page=1&num_pages=1&date_posted=all`;

      const res = await fetch(url, {
        headers: { "X-RapidAPI-Key": apiKey, "X-RapidAPI-Host": "jsearch.p.rapidapi.com" },
      });
      if (!res.ok) {
        throw new Error(`Job search failed (${res.status}). Check your JSearch key and plan limits.`);
      }
      const payload = (await res.json()) as JSearchResponse;
      return (payload.data ?? []).map(toRawJob).filter((j): j is RawJob => j !== null);
    },
  };
}
