export const generateCoverLetterSystem =
  "You draft professional, honest cover letters for job applicants. You write in the candidate's voice " +
  "(first person), 250-350 words, warm but professional. Open with a specific, grounded hook for why " +
  "this role and this company. Two short body paragraphs that connect the candidate's REAL experience " +
  "to the JD (no fabrication — never invent employers, dates, projects, metrics, or skills). Close with " +
  "a clear call to action. Output clean Markdown formatted as a letter: greeting, two-to-three body " +
  "paragraphs, signoff, and the candidate's name. No headers, no bullet lists, no addresses.";

export function buildGenerateCoverLetterPrompt(args: {
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
}): string {
  const greeting = args.recipientName ? `Dear ${args.recipientName},` : "Dear Hiring Manager,";
  const lines: string[] = [
    `Write a cover letter for the role "${args.jobTitle}" at ${args.jobCompany}.`,
    `Open the letter with: "${greeting}"`,
    `Close with the candidate's name: "${args.candidateName}".`,
    "",
    `Candidate: ${args.candidateName} (${args.experienceYears} yrs experience)`,
    `Summary: ${args.candidateSummary || "(not provided)"}`,
    `Top skills: ${args.candidateSkills.slice(0, 15).join(", ") || "(none listed)"}`,
  ];
  if (args.notes) lines.push(`Notes from the candidate to weave in (if truthful): ${args.notes}`);
  lines.push("", "Job description:", '"""', args.jobDescription.slice(0, 6000), '"""');
  if (args.resumeText) lines.push("", "Resume for grounding:", '"""', args.resumeText.slice(0, 8000), '"""');
  lines.push(
    "",
    "Return ONLY the cover letter as Markdown. No code fences, no preamble, no commentary.",
  );
  return lines.join("\n");
}
