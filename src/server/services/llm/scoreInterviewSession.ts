import { z } from "zod";
import { getActiveAdapter } from "./resolver";
import { buildScoreInterviewSessionPrompt } from "./prompt/scoreInterviewSession";
import type { InterviewQuestionDto } from "@/types";

const responseSchema = z.object({
  communication: z.number().min(0).max(100),
  technical: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  overall: z.number().min(0).max(100),
  rubric: z.array(
    z.object({
      criterion: z.string(),
      score: z.number().min(0).max(100),
      comment: z.string(),
    }),
  ),
});

export type InterviewScores = z.infer<typeof responseSchema>;

const SYSTEM = "You are an experienced interview coach. Score the candidate honestly and concisely.";

export async function scoreInterviewSession(
  userId: string,
  input: { jobTitle: string | null; jobCompany: string | null; questions: InterviewQuestionDto[] },
): Promise<InterviewScores> {
  const adapter = await getActiveAdapter(userId);
  return await adapter.generateJson({
    schema: responseSchema,
    systemInstruction: SYSTEM,
    prompt: buildScoreInterviewSessionPrompt(input),
  });
}
