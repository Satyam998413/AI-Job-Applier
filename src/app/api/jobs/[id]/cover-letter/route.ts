import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Job } from "@/server/models/Job";
import { Match } from "@/server/models/Match";
import { User } from "@/server/models/User";
import { getSession } from "@/server/auth/session";
import { getDefaultResume } from "@/server/services/resume/getDefaultResume";
import { generateCoverLetter } from "@/server/services/llm/generateCoverLetter";
import { enforceRateLimit } from "@/server/services/rateLimit";
import { matchToDto } from "@/server/serializers";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z
  .object({
    recipientName: z.string().trim().optional(),
    notes: z.string().trim().max(800).optional(),
  })
  .optional();

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Invalid job id", 400);

    const limited = await enforceRateLimit(session.userId, "coverLetter");
    if (limited) return limited;

    const raw = await req.text();
    const body = raw ? bodySchema.parse(JSON.parse(raw)) : undefined;

    await dbConnect();
    const [user, resume, job] = await Promise.all([
      User.findById(session.userId),
      getDefaultResume(session.userId),
      Job.findById(id),
    ]);
    if (!user) return fail("Not authenticated", 401);
    if (!job) return fail("Job not found", 404);
    if (!resume) return fail("Upload a resume before drafting a cover letter.", 409);

    const coverLetter = await generateCoverLetter(session.userId, {
      candidateName: user.fullName,
      candidateSummary: resume.summary,
      candidateSkills: resume.skills,
      experienceYears: resume.experienceYears,
      resumeText: resume.rawText,
      jobTitle: job.title,
      jobCompany: job.company,
      jobDescription: job.description,
      recipientName: body?.recipientName,
      notes: body?.notes,
    });

    // Upsert: a cover letter can exist on its own (score not required).
    const match = await Match.findOneAndUpdate(
      { userId: session.userId, jobId: job._id },
      { $set: { coverLetter } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return ok(matchToDto(match!), 201);
  } catch (err) {
    return handleError(err);
  }
}
