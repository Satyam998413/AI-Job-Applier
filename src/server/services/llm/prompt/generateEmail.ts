export const generateEmailSystem =
  "You draft short, professional outreach emails for a job applicant introducing themselves to a hiring " +
  "manager or recruiter. Write in the candidate's voice (first person), 90-160 words for the body, warm " +
  "but not gushy, and zero filler. Use ONLY facts present in the candidate's resume; never invent " +
  "employers, dates, projects, or numbers. Open with a specific, grounded reason for interest in the role. " +
  "Close with a soft call to action (e.g. 'happy to chat'). The subject must be specific to the role and " +
  "under 70 characters.";

export function buildGenerateEmailPrompt(args: {
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
  const greeting = args.recipientName ? `Hi ${args.recipientName},` : "Hi there,";
  const lines: string[] = [
    `Draft a job-application outreach email for "${args.jobTitle}" at ${args.jobCompany}.`,
    `Open the body with: "${greeting}"`,
    "",
    "Return JSON: { subject, body }. Body is plain text (newlines preserved).",
    "",
    `Candidate: ${args.candidateName} (${args.experienceYears} yrs experience)`,
    `Summary: ${args.candidateSummary || "(not provided)"}`,
    `Top skills: ${args.candidateSkills.slice(0, 15).join(", ") || "(none listed)"}`,
  ];
  if (args.notes) lines.push(`Extra notes from the candidate: ${args.notes}`);
  lines.push("", "Job description:", '"""', args.jobDescription.slice(0, 6000), '"""');
  if (args.resumeText) lines.push("", "Resume for grounding:", '"""', args.resumeText.slice(0, 8000), '"""');
  return lines.join("\n");
}
