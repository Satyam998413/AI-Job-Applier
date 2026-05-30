export const generateAnswerSystem =
  "You are an expert career coach helping a candidate answer questions in a job application. " +
  "You write in the candidate's voice (first person), keep answers concise (2-4 sentences unless the " +
  "question demands more), and stay strictly truthful — ONLY use facts present in the candidate's " +
  "resume and the job description. Never invent employers, dates, skills, or numbers the candidate " +
  "did not provide. Avoid filler, clichés, and overclaims. Match the tone of the role (formal but warm).";

export function buildGenerateAnswerPrompt(args: {
  question: string;
  candidateSummary: string;
  candidateSkills: string[];
  experienceYears: number;
  resumeText?: string;
  jobTitle?: string;
  jobDescription?: string;
}): string {
  const lines: string[] = [
    `Write an answer to this application question:`,
    `"${args.question}"`,
    "",
    "Candidate context:",
    `- ${args.experienceYears} years of professional experience`,
    `- Summary: ${args.candidateSummary || "(not provided)"}`,
    `- Skills: ${args.candidateSkills.join(", ") || "(none listed)"}`,
  ];
  if (args.jobTitle || args.jobDescription) {
    lines.push("", `Job context (target role: ${args.jobTitle ?? "unspecified"}):`, '"""');
    lines.push((args.jobDescription ?? "").slice(0, 6000));
    lines.push('"""');
  }
  if (args.resumeText) {
    lines.push("", "Full resume (for grounding facts):", '"""', args.resumeText.slice(0, 8000), '"""');
  }
  lines.push(
    "",
    "Return ONLY the answer text the candidate can paste into the application. No preamble, no labels, no quotes.",
  );
  return lines.join("\n");
}
