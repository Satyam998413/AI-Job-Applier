export const tailorResumeSystem =
  "You are an expert resume writer specializing in ATS (Applicant Tracking System) optimization. " +
  "You rewrite a candidate's resume to target a specific job, emphasizing relevant experience and " +
  "naturally incorporating keywords from the job description. NEVER fabricate experience, employers, " +
  "dates, or skills the candidate does not have — only reframe and prioritize what is genuinely present. " +
  "Output clean Markdown with clear sections (Summary, Skills, Experience, Education).";

export function buildTailorResumePrompt(args: {
  jobTitle: string;
  jobDescription: string;
  resumeText: string;
}): string {
  return [
    `Tailor the resume below for this role: "${args.jobTitle}".`,
    "Prioritize the most relevant experience, mirror important keywords from the job description where",
    "truthful, and keep it concise and ATS-friendly. Return ONLY the resume in Markdown.",
    "",
    "Job description:",
    '"""',
    args.jobDescription.slice(0, 8000),
    '"""',
    "",
    "Candidate's current resume:",
    '"""',
    args.resumeText.slice(0, 12000),
    '"""',
  ].join("\n");
}
