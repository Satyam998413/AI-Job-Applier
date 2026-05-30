import { z } from "zod";
import { getActiveAdapter } from "./resolver";
import {
  generateInterviewQuestionsSystem,
  buildGenerateInterviewQuestionsPrompt,
} from "./prompt/generateInterviewQuestions";
import type { InterviewQuestion } from "@/types";

const categoryEnum = z.enum(["behavioral", "technical", "rolespecific", "culture", "other"]);

const schema = z.object({
  questions: z
    .array(
      z.object({
        category: categoryEnum,
        question: z.string().min(8).max(400),
        rationale: z.string().min(1).max(280),
      }),
    )
    .min(4)
    .max(14),
});

export type InterviewPrepInput = {
  candidateSummary: string;
  candidateSkills: string[];
  experienceYears: number;
  resumeText?: string;
  jobTitle: string;
  jobCompany: string;
  jobDescription: string;
};

/** Generate a tailored interview question set via the user's active AI provider. */
export async function generateInterviewQuestions(
  userId: string,
  input: InterviewPrepInput,
): Promise<InterviewQuestion[]> {
  const adapter = await getActiveAdapter(userId);
  const result = await adapter.generateJson({
    schema,
    systemInstruction: generateInterviewQuestionsSystem,
    prompt: buildGenerateInterviewQuestionsPrompt(input),
  });
  return result.questions;
}
