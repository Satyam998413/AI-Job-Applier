export const extractSkillsSystem =
  "You are an expert technical recruiter and resume parser. You read raw resume text and extract " +
  "structured information accurately. Only use information present in the resume; never invent skills " +
  "or experience. Return concise, normalized skill names (e.g. 'React', 'Node.js', 'PostgreSQL').";

export function buildExtractSkillsPrompt(resumeText: string): string {
  return [
    "Extract the following from this resume:",
    "- skills: a deduplicated list of technical and professional skills (max 30).",
    "- summary: a 1-2 sentence professional summary of the candidate.",
    "- experienceYears: total years of professional experience as a number (estimate from dates; 0 if unknown).",
    "",
    "Resume text:",
    '"""',
    resumeText.slice(0, 12000),
    '"""',
  ].join("\n");
}
