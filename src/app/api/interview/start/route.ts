import { z } from "zod";
import { dbConnect } from "@/server/db/connect";
import { Interview } from "@/server/models/Interview";
import { getSession } from "@/server/auth/session";
import { startInterview } from "@/server/services/interview/startInterview";
import { enforceRateLimit } from "@/server/services/rateLimit";
import { interviewToDto } from "@/server/serializers";
import { ok, fail, handleError } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  jobId: z.string().optional(),
  jobRole: z.string().optional(),
  experienceLevel: z.string().optional(),
  focusArea: z.string().optional(),
  questionCount: z.number().optional(),
  timeLimitPerQuestion: z.number().optional(),
}).optional();

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const limited = await enforceRateLimit(session.userId, "interviewPrep");
    if (limited) return limited;

    const raw = await req.text();
    const body = raw ? bodySchema.parse(JSON.parse(raw)) : undefined;

    await dbConnect();
    const interviewId = await startInterview(session.userId, { jobId: body?.jobId ?? null });
    const doc = await Interview.findById(interviewId);
    return ok(interviewToDto(doc!), 201);
  } catch (err) {
    return handleError(err);
  }
}
