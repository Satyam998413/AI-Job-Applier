import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Job } from "@/server/models/Job";
import { getSession } from "@/server/auth/session";
import { getDefaultResume } from "@/server/services/resume/getDefaultResume";
import { atsScoreResume } from "@/server/services/llm/atsScoreResume";
import { enforceRateLimit } from "@/server/services/rateLimit";
import { ok, fail, handleError } from "@/lib/http";
import type { AtsResultDto } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z
  .object({ jobId: z.string().optional() })
  .optional();

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const limited = await enforceRateLimit(session.userId, "ats");
    if (limited) return limited;

    const raw = await req.text();
    const body = raw ? bodySchema.parse(JSON.parse(raw)) : undefined;

    await dbConnect();
    const resume = await getDefaultResume(session.userId);
    if (!resume) return fail("Upload a resume before running an ATS check.", 409);

    let jobTitle: string | undefined;
    let jobCompany: string | undefined;
    let jobDescription: string | undefined;

    if (body?.jobId) {
      if (!isValidObjectId(body.jobId)) return fail("Invalid job id", 400);
      const job = await Job.findById(body.jobId);
      if (!job) return fail("Job not found", 404);
      jobTitle = job.title;
      jobCompany = job.company;
      jobDescription = job.description;
    }

    const result = await atsScoreResume(session.userId, {
      resumeText: resume.rawText,
      resumeSkills: resume.skills,
      experienceYears: resume.experienceYears,
      jobTitle,
      jobDescription,
    });

    const dto: AtsResultDto = {
      ...result,
      jobTitle: jobTitle ?? null,
      jobCompany: jobCompany ?? null,
    };
    return ok(dto);
  } catch (err) {
    return handleError(err);
  }
}
