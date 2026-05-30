import { getActiveAdapter } from "./resolver";
import { generateCoverLetterSystem, buildGenerateCoverLetterPrompt } from "./prompt/generateCoverLetter";

export type GenerateCoverLetterInput = {
  candidateName: string;
  candidateSummary: string;
  candidateSkills: string[];
  experienceYears: number;
  resumeText?: string;
  jobTitle: string;
  jobCompany: string;
  jobDescription: string;
  recipientName?: string;
  notes?: string;
};

/** Generate an honest, resume-grounded cover letter (Markdown) via the user's active AI provider. */
export async function generateCoverLetter(
  userId: string,
  input: GenerateCoverLetterInput,
): Promise<string> {
  const adapter = await getActiveAdapter(userId);
  const text = await adapter.generateText({
    systemInstruction: generateCoverLetterSystem,
    prompt: buildGenerateCoverLetterPrompt(input),
  });
  return text.trim();
}
