import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/server/db/connect";
import { Job } from "@/server/models/Job";
import { QnA } from "@/server/models/QnA";
import { getSession } from "@/server/auth/session";
import { getDefaultResume } from "@/server/services/resume/getDefaultResume";
import { qnaToDto } from "@/server/serializers";
import { findSimilarAnswers, isExactMatch } from "@/server/services/qna/findSimilar";
import { generateAnswer } from "@/server/services/llm/generateAnswer";
import { enforceRateLimit } from "@/server/services/rateLimit";
import { ok, fail, handleError } from "@/lib/http";
import type { QnaSuggestResultDto } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  question: z.string().trim().min(3, "Question is too short"),
  jobId: z.string().optional(),
  /** When false, skip the AI call and return saved matches only. */
  includeAi: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("Not authenticated", 401);

    const limited = await enforceRateLimit(session.userId, "qnaSuggest");
    if (limited) return limited;

    const { question, jobId, includeAi = true } = bodySchema.parse(await req.json());
    await dbConnect();

    const matches = await findSimilarAnswers(session.userId, question);
    const exact = matches.find(isExactMatch) ?? null;

    // Bump usage on exact match so reuse promotes its rank.
    if (exact) {
      await QnA.updateOne(
        { _id: exact.qna._id },
        { $inc: { usageCount: 1 }, $set: { lastUsedAt: new Date() } },
      );
    }

    let aiAnswer: string | null = null;
    if (includeAi && !exact) {
      const resume = await getDefaultResume(session.userId);
      if (!resume) return fail("Upload a resume before generating answers.", 409);

      const job =
        jobId && isValidObjectId(jobId) ? await Job.findById(jobId) : null;

      aiAnswer = await generateAnswer(session.userId, {
        question,
        candidateSummary: resume.summary,
        candidateSkills: resume.skills,
        experienceYears: resume.experienceYears,
        resumeText: resume.rawText,
        jobTitle: job?.title,
        jobDescription: job?.description,
      });
    }

    const result: QnaSuggestResultDto = {
      suggestions: matches.map((m) => ({ match: qnaToDto(m.qna), similarity: m.similarity })),
      aiAnswer,
      exact: exact ? qnaToDto(exact.qna) : null,
    };
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
