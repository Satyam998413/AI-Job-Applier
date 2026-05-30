import { z } from "zod";
import { getActiveAdapter } from "./resolver";
import { generateEmailSystem, buildGenerateEmailPrompt } from "./prompt/generateEmail";

const schema = z.object({
  subject: z.string().min(1).max(140),
  body: z.string().min(1),
});

export type GeneratedEmail = z.infer<typeof schema>;

export type GenerateEmailInput = {
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

/** Draft a {subject, body} outreach email for a specific job via the user's active AI provider. */
export async function generateEmail(userId: string, input: GenerateEmailInput): Promise<GeneratedEmail> {
  const adapter = await getActiveAdapter(userId);
  return adapter.generateJson({
    schema,
    systemInstruction: generateEmailSystem,
    prompt: buildGenerateEmailPrompt(input),
  });
}
