import { getActiveAdapter } from "./resolver";
import { generateAnswerSystem, buildGenerateAnswerPrompt } from "./prompt/generateAnswer";

export type GenerateAnswerInput = {
  question: string;
  candidateSummary: string;
  candidateSkills: string[];
  experienceYears: number;
  resumeText?: string;
  jobTitle?: string;
  jobDescription?: string;
};

/** Generate a personalized application answer via the user's active AI provider. */
export async function generateAnswer(userId: string, input: GenerateAnswerInput): Promise<string> {
  const adapter = await getActiveAdapter(userId);
  const text = await adapter.generateText({
    systemInstruction: generateAnswerSystem,
    prompt: buildGenerateAnswerPrompt(input),
  });
  return text.trim();
}
