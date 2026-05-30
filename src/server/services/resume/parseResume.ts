import { extractText } from "./extractText";
import { extractSkills, type ExtractedResume } from "@/server/services/llm/extractSkills";

export type ParsedResume = ExtractedResume & { rawText: string };

/**
 * Full resume pipeline: extract text from the file, then extract structured
 * skills/summary/experience via the user's active AI provider.
 */
export async function parseResume(
  userId: string,
  buffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<ParsedResume> {
  const rawText = await extractText(buffer, fileName, mimeType);
  if (!rawText) throw new Error("Could not read any text from the uploaded file.");

  const extracted = await extractSkills(userId, rawText);
  return { ...extracted, rawText };
}
