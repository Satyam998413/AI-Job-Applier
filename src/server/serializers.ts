import type { ResumeDoc } from "./models/Resume";
import type { JobDoc } from "./models/Job";
import type { MatchDoc } from "./models/Match";
import type { QnaDoc } from "./models/QnA";
import type { UserSettingsDoc } from "./models/UserSettings";
import type { CronRunDoc } from "./models/CronRun";
import type { NotificationDoc } from "./models/Notification";
import type { InterviewDoc } from "./models/Interview";
import type {
  ResumeDto,
  JobDto,
  MatchDto,
  ExperienceLevel,
  QnaDto,
  QnaSource,
  InterviewQuestion,
  MatchStatus,
  StatusHistoryEntry,
  UserSettingsDto,
  CronRunDto,
  CronJob,
  CronStatus,
  UserSettingsDateFilter,
  UserSettingsExperienceBucket,
  NotificationDto,
  NotificationKind,
  InterviewDto,
  InterviewStatus,
} from "@/types";

export function resumeToDto(doc: ResumeDoc): ResumeDto {
  return {
    id: String(doc._id),
    fileName: doc.fileName,
    skills: doc.skills,
    summary: doc.summary,
    experienceYears: doc.experienceYears,
    extractedAt: doc.extractedAt.toISOString(),
    isDefault: Boolean(doc.isDefault),
    fileUrl: doc.fileUrl ?? null,
    mimeType: doc.mimeType ?? null,
    fileSize: doc.fileSize ?? null,
  };
}

export function userSettingsToDto(doc: UserSettingsDoc): UserSettingsDto {
  return {
    autoApplyEnabled: doc.autoApplyEnabled,
    applyLimit: doc.applyLimit,
    dateFilter: doc.dateFilter as UserSettingsDateFilter,
    includeKeywords: doc.includeKeywords,
    excludeKeywords: doc.excludeKeywords,
    locations: doc.locations,
    experienceBuckets: doc.experienceBuckets as UserSettingsExperienceBucket[],
    salaryMin: doc.salaryMin ?? null,
    cronTimezone: doc.cronTimezone,
    notifyChannels: {
      inApp: doc.notifyChannels.inApp,
      email: doc.notifyChannels.email,
      push: doc.notifyChannels.push,
    },
    dailyReportEnabled: doc.dailyReportEnabled,
    emailTemplates: {
      recruiter: doc.emailTemplates.recruiter,
      followUp: doc.emailTemplates.followUp,
    },
    interviewDefaults: {
      questionCount: doc.interviewDefaults.questionCount,
      durationMin: doc.interviewDefaults.durationMin,
      categories: doc.interviewDefaults.categories,
      language: doc.interviewDefaults.language,
    },
  };
}

export function notificationToDto(doc: NotificationDoc): NotificationDto {
  return {
    id: String(doc._id),
    kind: doc.kind as NotificationKind,
    title: doc.title,
    body: doc.body,
    href: doc.href ?? null,
    seenAt: doc.seenAt ? doc.seenAt.toISOString() : null,
    createdAt: (doc as unknown as { createdAt: Date }).createdAt.toISOString(),
  };
}

export function interviewToDto(doc: InterviewDoc): InterviewDto {
  return {
    id: String(doc._id),
    jobId: doc.jobId ? String(doc.jobId) : null,
    matchId: doc.matchId ? String(doc.matchId) : null,
    status: doc.status as InterviewStatus,
    language: doc.language,
    durationMin: doc.durationMin,
    questions: (doc.questions ?? []).map((q) => ({
      question: q.question,
      category: q.category,
      askedAt: q.askedAt ? q.askedAt.toISOString() : null,
      answeredAt: q.answeredAt ? q.answeredAt.toISOString() : null,
      transcript: q.transcript ?? "",
      codeSubmission: q.codeSubmission ?? "",
    })),
    media: (doc.media ?? []).map((m) => ({
      kind: m.kind as "audio" | "video",
      url: m.url,
      mimeType: m.mimeType,
      durationMs: m.durationMs,
      sizeBytes: m.sizeBytes,
    })),
    scores: {
      communication: doc.scores?.communication ?? null,
      technical: doc.scores?.technical ?? null,
      confidence: doc.scores?.confidence ?? null,
      overall: doc.scores?.overall ?? null,
      rubric: (doc.scores?.rubric ?? []).map((r) => ({
        criterion: r.criterion,
        score: r.score,
        comment: r.comment ?? "",
      })),
    },
    startedAt: doc.startedAt ? doc.startedAt.toISOString() : null,
    completedAt: doc.completedAt ? doc.completedAt.toISOString() : null,
    createdAt: (doc as unknown as { createdAt: Date }).createdAt.toISOString(),
  };
}

export function cronRunToDto(doc: CronRunDoc): CronRunDto {
  return {
    id: String(doc._id),
    job: doc.job as CronJob,
    scheduledAt: doc.scheduledAt.toISOString(),
    startedAt: doc.startedAt ? doc.startedAt.toISOString() : null,
    completedAt: doc.completedAt ? doc.completedAt.toISOString() : null,
    status: doc.status as CronStatus,
    userCount: doc.userCount,
    stats: (doc.stats ?? {}) as Record<string, unknown>,
    errors: (doc.errors ?? []).map((e) => ({ userId: e.userId ?? null, message: e.message })),
  };
}

export function jobToDto(doc: JobDoc): JobDto {
  return {
    id: String(doc._id),
    title: doc.title,
    company: doc.company,
    location: doc.location,
    description: doc.description,
    url: doc.url,
    source: doc.source,
    sources: (doc.sources ?? []).map((s) => ({ source: s.source, externalId: s.externalId ?? null })),
    tags: doc.tags,
    postedAt: doc.postedAt.toISOString(),
    salaryMin: doc.salaryMin ?? null,
    salaryMax: doc.salaryMax ?? null,
    salaryCurrency: doc.salaryCurrency ?? null,
    employmentType: doc.employmentType ?? null,
    isRemote: doc.isRemote ?? null,
    experienceLevel: (doc.experienceLevel as ExperienceLevel | null | undefined) ?? null,
    extractedEmails: (doc.extractedEmails ?? []).map((e) => ({
      email: e.email,
      source: e.source as "description" | "page" | "guess",
      confidence: e.confidence,
      extractedAt: e.extractedAt.toISOString(),
    })),
  };
}

export function qnaToDto(doc: QnaDoc): QnaDto {
  return {
    id: String(doc._id),
    question: doc.question,
    normalizedQuestion: doc.normalizedQuestion,
    answer: doc.answer,
    category: doc.category,
    source: doc.source as QnaSource,
    usageCount: doc.usageCount,
    lastUsedAt: doc.lastUsedAt ? doc.lastUsedAt.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
  };
}

export function matchToDto(doc: MatchDoc): MatchDto {
  return {
    id: String(doc._id),
    jobId: String(doc.jobId),
    score: doc.score ?? null,
    matchedSkills: doc.matchedSkills,
    missingSkills: doc.missingSkills,
    reasoning: doc.reasoning,
    tailoredResume: doc.tailoredResume || undefined,
    coverLetter: doc.coverLetter || undefined,
    interviewQuestions: (doc.interviewQuestions ?? []) as InterviewQuestion[],
    interviewPrepAt: doc.interviewPrepAt ? doc.interviewPrepAt.toISOString() : null,
    status: doc.status as MatchStatus,
    statusHistory: ((doc.statusHistory ?? []) as { status: string; at: Date; note?: string }[]).map(
      (h): StatusHistoryEntry => ({
        status: h.status as MatchStatus,
        at: h.at.toISOString(),
        note: h.note ?? "",
      }),
    ),
    appliedAt: doc.appliedAt ? doc.appliedAt.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
  };
}
