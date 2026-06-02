/** Shared client/server types. camelCase end-to-end. */

export type UserDto = {
  id: string;
  email: string;
  fullName: string;
};

export type ResumeDto = {
  id: string;
  fileName: string;
  skills: string[];
  summary: string;
  experienceYears: number;
  extractedAt: string;
  isDefault: boolean;
  /** Auth-gated URL for downloading the original file (null for legacy text-only uploads). */
  fileUrl: string | null;
  mimeType: string | null;
  fileSize: number | null;
};

export type ExtractedEmailDto = {
  email: string;
  source: "description" | "page" | "guess";
  confidence: number;
  extractedAt: string;
};

export type ExperienceLevel = "intern" | "entry" | "mid" | "senior" | "lead";

export type JobDto = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  /** The most recently updating provider. `sources` carries the full provenance list. */
  source: string;
  /** Every (source, externalId) pair that resolves to this job. Length > 1 means deduped. */
  sources: { source: string; externalId: string | null }[];
  tags: string[];
  postedAt: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  employmentType: string | null;
  isRemote: boolean | null;
  experienceLevel: ExperienceLevel | null;
  /** Derived HR/recruiter contacts. Empty until extraction has run for the job. */
  extractedEmails: ExtractedEmailDto[];
};

export const USER_SETTINGS_DATE_FILTERS = ["last24h", "last2d", "last7d", "last30d"] as const;
export type UserSettingsDateFilter = (typeof USER_SETTINGS_DATE_FILTERS)[number];

export const USER_SETTINGS_EXPERIENCE_BUCKETS = ["fresher", "1-3", "3-5", "5-10", "10+"] as const;
export type UserSettingsExperienceBucket = (typeof USER_SETTINGS_EXPERIENCE_BUCKETS)[number];

export type UserSettingsDto = {
  autoApplyEnabled: boolean;
  applyLimit: number;
  dateFilter: UserSettingsDateFilter;
  includeKeywords: string[];
  excludeKeywords: string[];
  locations: string[];
  experienceBuckets: UserSettingsExperienceBucket[];
  salaryMin: number | null;
  cronTimezone: string;
  notifyChannels: { inApp: boolean; email: boolean; push: boolean };
  dailyReportEnabled: boolean;
  emailTemplates: { recruiter: string; followUp: string };
  interviewDefaults: {
    questionCount: number;
    durationMin: number;
    categories: string[];
    language: string;
  };
};

export const CRON_JOBS = ["dailyJobFetch", "dailyDraftPrep", "hourlyHrScrape", "nightlyReport"] as const;
export type CronJob = (typeof CRON_JOBS)[number];

export const CRON_STATUSES = ["pending", "running", "succeeded", "failed", "partial"] as const;
export type CronStatus = (typeof CRON_STATUSES)[number];

export type CronRunDto = {
  id: string;
  job: CronJob;
  scheduledAt: string;
  startedAt: string | null;
  completedAt: string | null;
  status: CronStatus;
  userCount: number;
  stats: Record<string, unknown>;
  errors: { userId: string | null; message: string }[];
};

export const NOTIFICATION_KINDS = [
  "applyFailed",
  "emailSent",
  "dailyReport",
  "interviewScored",
  "cronError",
  "matchScored",
] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export type NotificationDto = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string | null;
  seenAt: string | null;
  createdAt: string;
};

export const INTERVIEW_STATUSES = [
  "pending",
  "preparing",
  "live",
  "completed",
  "scoring",
  "scored",
  "failed",
] as const;
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];

export type InterviewQuestionDto = {
  question: string;
  category: string;
  smartAnswer: string;
  askedAt: string | null;
  answeredAt: string | null;
  transcript: string;
  codeSubmission: string;
};

export type InterviewMediaDto = {
  kind: "audio" | "video";
  url: string;
  mimeType: string;
  durationMs: number;
  sizeBytes: number;
};

export type InterviewScoresDto = {
  communication: number | null;
  technical: number | null;
  confidence: number | null;
  overall: number | null;
  rubric: { criterion: string; score: number; comment: string }[];
};

export type InterviewDto = {
  id: string;
  jobId: string | null;
  matchId: string | null;
  status: InterviewStatus;
  language: string;
  durationMin: number;
  questions: InterviewQuestionDto[];
  media: InterviewMediaDto[];
  scores: InterviewScoresDto;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

export type InterviewShareDto = {
  url: string;
  expiresAt: string;
  revokedAt: string | null;
  viewedCount: number;
};

export type PublicInterviewDto = {
  candidateName: string;
  jobTitle: string | null;
  jobCompany: string | null;
  status: InterviewStatus;
  questions: InterviewQuestionDto[];
  scores: InterviewScoresDto;
  media: InterviewMediaDto[];
  completedAt: string | null;
};

export const MATCH_STATUSES = [
  "new",
  "tailored",
  "applied",
  "responded",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

export type StatusHistoryEntry = { status: MatchStatus; at: string; note: string };

export const AI_PROVIDER_NAMES = ["gemini", "openai", "claude", "groq", "ollama"] as const;
export type AiProviderName = (typeof AI_PROVIDER_NAMES)[number];

export type AiProviderRowDto = {
  provider: AiProviderName;
  configured: boolean;
  lastFour: string | null;
  isActive: boolean;
};

export type UserProfileDto = UserDto & { mobile: string | null; passwordSetByUser: boolean };

export type JsearchStatusDto = {
  configured: boolean;
  lastFour: string | null;
  isActive: boolean;
  totalLimit: number;
  usedThisMonth: number;
  remaining: number;
  monthKey: string;
  lastCallAt: string | null;
};

export type AssistantRole = "user" | "assistant";

export type AssistantMessageDto = {
  role: AssistantRole;
  content: string;
  at: string;
};

export type AssistantConversationDto = {
  messages: AssistantMessageDto[];
  updatedAt: string | null;
};

export type SyncStatus = "active" | "disconnected" | "expired";

export type ConnectedEmailDto = {
  configured: boolean;
  emailAddress: string | null;
  provider: string | null;
  syncStatus: SyncStatus;
  connectedAt: string | null;
  /** Whether Nylas is configured on the server (drives UI affordances). */
  nylasConfigured: boolean;
};

export type EmailSendResultDto = {
  status: "sent" | "failed";
  messageId: string | null;
  errorMessage: string | null;
  logId: string;
};

export type AtsBreakdownKey = "keywords" | "structure" | "experience" | "skills" | "clarity" | "actionVerbs";

export type AtsResultDto = {
  score: number;
  breakdown: { key: AtsBreakdownKey; score: number; comment: string }[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  /** Mirrors the request mode for display. */
  jobTitle: string | null;
  jobCompany: string | null;
};

export type QnaSource = "saved" | "ai";

export type QnaDto = {
  id: string;
  question: string;
  normalizedQuestion: string;
  answer: string;
  category: string;
  source: QnaSource;
  usageCount: number;
  lastUsedAt: string | null;
  createdAt: string;
};

export type QnaSuggestionDto = {
  match: QnaDto;
  similarity: number;
};

export type QnaSuggestResultDto = {
  /** Existing saved matches ranked by similarity. */
  suggestions: QnaSuggestionDto[];
  /** A freshly AI-generated answer for the question (uses resume + optional job). */
  aiAnswer: string | null;
  /** Set when an existing saved answer is an exact match (>= 0.999). */
  exact: QnaDto | null;
};

export type InterviewCategory = "behavioral" | "technical" | "rolespecific" | "culture" | "other";

export type InterviewQuestion = {
  category: InterviewCategory;
  question: string;
  rationale: string;
};

export type MatchDto = {
  id: string;
  jobId: string;
  /** null until the job has been scored. */
  score: number | null;
  matchedSkills: string[];
  missingSkills: string[];
  reasoning: string;
  tailoredResume?: string;
  coverLetter?: string;
  interviewQuestions: InterviewQuestion[];
  interviewPrepAt: string | null;
  status: MatchStatus;
  statusHistory: StatusHistoryEntry[];
  appliedAt: string | null;
  createdAt: string;
};
