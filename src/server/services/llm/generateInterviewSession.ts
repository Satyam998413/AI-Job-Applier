import { z } from "zod";
import { getActiveAdapter } from "./resolver";
import { buildGenerateInterviewSessionPrompt } from "./prompt/generateInterviewSession";

const responseSchema = z.object({
  questions: z.array(z.object({ question: z.string(), category: z.string() })),
});

const SYSTEM =
  "You generate balanced mock-interview question sets. Output only JSON matching the schema.";

export type GenerateInterviewSessionInput = Parameters<typeof buildGenerateInterviewSessionPrompt>[0];

export async function generateInterviewSession(
  userId: string,
  input: GenerateInterviewSessionInput,
): Promise<{ question: string; category: string }[]> {
  const adapter = await getActiveAdapter(userId);
  const { questions } = await adapter.generateJson({
    schema: responseSchema,
    systemInstruction: SYSTEM,
    prompt: buildGenerateInterviewSessionPrompt(input),
  });
  return questions;
}
