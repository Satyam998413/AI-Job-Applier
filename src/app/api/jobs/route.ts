import { z } from "zod";
import { dbConnect } from "@/server/db/connect";
import { JsearchKey, currentMonthKey } from "@/server/models/JsearchKey";
import { getSession } from "@/server/auth/session";
import { ingestJobs } from "@/server/services/jobs/ingestJobs";
import { seedJobProvider } from "@/server/services/jobs/jobProvider";
import { createJsearchProvider } from "@/server/services/jobs/providers/jsearchProvider";
import { queryJobs, type JobsFilter, type JobMode, type DatePosted, type JobSort } from "@/server/services/jobs/queryJobs";
import { decrypt } from "@/server/crypto/secretBox";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 30;

const CALL_HISTORY_CAP = 200;

const bodySchema = z
  .object({
    role: z.string().trim().min(1).optional(),
    location: z.string().trim().optional(),
  })
  .optional();

const MODE_VALUES = new Set<JobMode>(["remote", "hybrid", "onsite"]);
const DATE_VALUES = new Set<DatePosted>(["24h", "7d", "30d", "all"]);
const SORT_VALUES = new Set<JobSort>(["latest", "bestMatch", "highestSalary"]);

function parseFilters(url: URL): JobsFilter {
  const p = url.searchParams;
  const mode = p.get("mode");
  const datePosted = p.get("datePosted");
  const sort = p.get("sort");
  const salaryMin = Number(p.get("salaryMin") ?? "");
  return {
    q: p.get("q") || undefined,
    location: p.get("location") || undefined,
    mode: mode && MODE_VALUES.has(mode as JobMode) ? (mode as JobMode) : undefined,
    salaryMin: Number.isFinite(salaryMin) && salaryMin > 0 ? salaryMin : undefined,
    experienceLevel: p.get("experienceLevel") || undefined,
    employmentType: p.get("employmentType") || undefined,
    datePosted: datePosted && DATE_VALUES.has(datePosted as DatePosted) ? (datePosted as DatePosted) : undefined,
    sort: sort && SORT_VALUES.has(sort as JobSort) ? (sort as JobSort) : undefined,
  };
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    await dbConnect();
    const items = await queryJobs(session.userId, parseFilters(new URL(req.url)));
    return ok(items);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const raw = await req.text();
    const body = raw ? bodySchema.parse(JSON.parse(raw)) : undefined;

    await dbConnect();

    // No role → seed sample jobs (offline/demo fallback).
    if (!body?.role) {
      const count = await ingestJobs(seedJobProvider);
      return ok({ ingested: count }, 201);
    }

    // Live JSearch search requires the user's own key + has monthly quota.
    const keyDoc = await JsearchKey.findOne({ userId: session.userId });
    if (!keyDoc || !keyDoc.isActive) {
      return fail("Configure your JSearch key in Settings to search live jobs.", 409);
    }

    const month = currentMonthKey();
    if (keyDoc.monthKey !== month) {
      keyDoc.monthKey = month;
      keyDoc.usedThisMonth = 0;
    }
    if (keyDoc.usedThisMonth >= keyDoc.totalLimit) {
      return fail(
        `Monthly JSearch limit reached (${keyDoc.usedThisMonth}/${keyDoc.totalLimit}). Try again next month.`,
        429,
      );
    }

    const apiKey = decrypt(keyDoc.encrypted);
    const provider = createJsearchProvider(apiKey);
    const count = await ingestJobs(provider, { role: body.role, location: body.location });

    // Track usage only after a successful call.
    keyDoc.usedThisMonth += 1;
    keyDoc.lastCallAt = new Date();
    keyDoc.callHistory.push({ at: new Date() });
    if (keyDoc.callHistory.length > CALL_HISTORY_CAP) {
      keyDoc.callHistory.splice(0, keyDoc.callHistory.length - CALL_HISTORY_CAP);
    }
    await keyDoc.save();

    return ok({ ingested: count }, 201);
  } catch (err) {
    return handleError(err);
  }
}
