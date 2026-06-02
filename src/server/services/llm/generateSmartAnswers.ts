import { z } from "zod";
import { getActiveAdapter } from "./resolver";
import { buildGenerateSmartAnswerPrompt } from "./prompt/generateSmartAnswers";

const responseSchema = z.object({
  answer: z.string().describe("A well-structured, confident answer to the question"),
});

const SYSTEM =
  "You are an expert interview coach. Generate concise, confident, and well-structured answers to interview questions. Keep answers under 200 words.";

export async function generateSmartAnswer(
  userId: string,
  question: string,
  jobRole: string,
  candidateSkills: string[],
): Promise<string> {
  const adapter = await getActiveAdapter(userId);
  const { answer } = await adapter.generateJson({
    schema: responseSchema,
    systemInstruction: SYSTEM,
    prompt: buildGenerateSmartAnswerPrompt({ question, jobRole, candidateSkills }),
  });
  return answer;
}
