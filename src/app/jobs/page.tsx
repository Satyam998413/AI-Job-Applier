import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/server/auth/requireUser";
import { dbConnect } from "@/server/db/connect";
import { Resume } from "@/server/models/Resume";
import {
  queryJobs,
  type DatePosted,
  type JobMode,
  type JobSort,
} from "@/server/services/jobs/queryJobs";
import { JobsView } from "./_components/JobsView";

export const runtime = "nodejs";

type RawParams = Record<string, string | string[] | undefined>;

function pick(v: string | string[] | undefined): string | undefined {
  if (!v) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

const MODE = new Set<JobMode>(["remote", "hybrid", "onsite"]);
const DATE = new Set<DatePosted>(["24h", "7d", "30d", "all"]);
const SORT = new Set<JobSort>(["latest", "bestMatch", "highestSalary"]);

export default async function JobsPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const user = await requireUser();
  const sp = await searchParams;

  const mode = pick(sp.mode);
  const datePosted = pick(sp.datePosted);
  const sort = pick(sp.sort);
  const salaryMin = Number(pick(sp.salaryMin) ?? "");

  await dbConnect();
  const [items, resume] = await Promise.all([
    queryJobs(user.id, {
      q: pick(sp.q),
      location: pick(sp.location),
      mode: mode && MODE.has(mode as JobMode) ? (mode as JobMode) : undefined,
      salaryMin: Number.isFinite(salaryMin) && salaryMin > 0 ? salaryMin : undefined,
      experienceLevel: pick(sp.experienceLevel),
      employmentType: pick(sp.employmentType),
      datePosted: datePosted && DATE.has(datePosted as DatePosted) ? (datePosted as DatePosted) : undefined,
      sort: sort && SORT.has(sort as JobSort) ? (sort as JobSort) : undefined,
    }),
    Resume.exists({ userId: user.id }),
  ]);

  return (
    <AppShell userName={user.fullName} isAdmin={user.isAdmin}>
      <JobsView jobs={items} hasResume={Boolean(resume)} />
    </AppShell>
  );
}
