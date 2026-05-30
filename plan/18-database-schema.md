# Feature Development Plan — Database Schema

## Source studied (Rule 12)

- [docs/Next_Phase1.docx](../docs/Next_Phase1.docx) — Folder Structure / Core Modules.
- [docs/Next_Phase2.docx](../docs/Next_Phase2.docx) § Task 18 — Suggested Database Tables.

---

## Step 1 — What is the feature

**a.** Canonical inventory of every Mongoose collection the app uses (current + planned). Each per-feature plan touches a subset; this doc is the master reference.

**b. Source citation (docs/Next_Phase2.docx § Task 18):**
> Users · Connected Emails · AI Providers · Jobs · Connected Platforms · Email Logs · Questions · Answers · JSearch Usage.

**c. Status: Built + extended.** The docs propose snake_case columns; the implementation uses camelCase (Rule 1). Where the docs list `Questions` + `Answers` as separate tables, the implementation unifies them as the `QnA` collection (Rule 6: one storage row per concept). Plans 01-14 extend the schema; this plan consolidates.

---

## Step 2 — Pages

N/A.

---

## Step 3 — User Journey

N/A.

---

## Step 4 — Database schema (consolidated)

> Reminder — Rule 1: every Mongoose path + sub-doc field is camelCase. Models exported PascalCase via `mongoose.models.X || mongoose.model(...)`.

### 4.a Collections (existing)

#### users
| Field          | Type    | Constraints                       | Notes                                              |
|----------------|---------|-----------------------------------|----------------------------------------------------|
| email          | string  | required, unique, lowercase, trim |                                                    |
| passwordHash   | string  | required (unless signupMethod="nylasGoogle") | bcryptjs                                  |
| fullName       | string  | trim                              |                                                    |
| mobile         | string  | unique sparse                     |                                                    |
| isAdmin        | boolean | default false                     |                                                    |
| nylasUserId    | string  | optional, sparse unique           | plan/01                                            |
| nylasGrantId   | string  | optional                          | plan/01                                            |
| signupMethod   | string  | enum `["password","nylasGoogle"]` | plan/01                                            |
| disabledAt     | Date    | optional                          | plan/14                                            |
| autoApplyOptIn | object  | per-platform booleans + thresholds | plan/12 + plan/13                                  |
| timestamps     | —       | createdAt, updatedAt              |                                                    |

#### jobs
| Field             | Type     | Constraints                                                                 | Notes |
|-------------------|----------|-----------------------------------------------------------------------------|-------|
| externalId        | string   | optional, sparse unique                                                     | dedup |
| title             | string   | required, trim                                                              |       |
| company           | string   | required, trim                                                              |       |
| location          | string   | optional                                                                    |       |
| description       | string   | optional                                                                    |       |
| url               | string   | optional                                                                    |       |
| source            | string   | required, default "seed", widen enum (plan/05): seed\|jsearch\|linkedin\|naukri\|weworkremotely\|remoteok\|indeed\|workable | |
| tags              | string[] | optional                                                                    |       |
| postedAt          | Date     | optional                                                                    |       |
| salaryMin         | number   | optional                                                                    |       |
| salaryMax         | number   | optional                                                                    |       |
| salaryCurrency    | string   | optional                                                                    |       |
| employmentType    | string   | enum fullTime\|partTime\|contract\|internship                              |       |
| isRemote          | boolean  | optional                                                                    | Legacy — prefer jobMode |
| jobMode           | string   | enum remote\|hybrid\|onsite (plan/06)                                       |       |
| easyApply         | boolean  | default false (plan/06)                                                     |       |
| skills            | string[] | multikey indexed (plan/06)                                                  |       |
| experienceLevel   | string   | enum intern\|entry\|mid\|senior\|lead                                       |       |
| timestamps        | —        | createdAt, updatedAt                                                        |       |

Indexes: unique sparse `externalId`; unique partial `(title, company)` where externalId absent; multikey `skills`; compound `(jobMode, postedAt -1)`; text `(title, company, description)`.

#### resumes
| Field              | Type     | Constraints       | Notes                              |
|--------------------|----------|-------------------|------------------------------------|
| userId             | ObjectId | required, indexed | ref users                          |
| fileName           | string   | required          |                                    |
| rawText            | string   | required          |                                    |
| skills             | string[] | required          |                                    |
| summary            | string   | optional          |                                    |
| experienceYears    | number   | optional          |                                    |
| extractedAt        | Date     | default now       |                                    |
| (PHASE 2) fileUrl  | string   | optional          | object-storage URL (plan/12 OQ3)   |
| timestamps         | —        |                   |                                    |

#### matches
| Field               | Type     | Constraints                                                                       | Notes |
|---------------------|----------|-----------------------------------------------------------------------------------|-------|
| userId              | ObjectId | required, indexed                                                                 |       |
| jobId               | ObjectId | required, indexed                                                                 |       |
| score               | number   | 0–100, null until scored                                                          |       |
| matchedSkills       | string[] | optional                                                                          |       |
| missingSkills       | string[] | optional                                                                          |       |
| reasoning           | string   | optional                                                                          |       |
| tailoredResume      | string   | optional (Markdown)                                                               |       |
| coverLetter         | string   | optional (Markdown)                                                               |       |
| interviewQuestions  | nested[] | `{ category, question, rationale }`                                               |       |
| interviewPrepAt     | Date     | optional                                                                          |       |
| status              | string   | enum new\|tailored\|applied\|responded\|interview\|offer\|rejected\|withdrawn     |       |
| statusHistory       | nested[] | `{ status, at, note }`                                                            |       |
| appliedAt           | Date     | optional                                                                          |       |
| autoApplyRunId      | ObjectId | optional, indexed (plan/12)                                                       |       |
| timestamps          | —        |                                                                                   |       |

Indexes: unique `(userId, jobId)`.

#### qnas (Questions + Answers, unified)
| Field              | Type     | Constraints                                          | Notes                       |
|--------------------|----------|------------------------------------------------------|-----------------------------|
| userId             | ObjectId | required, indexed                                    |                             |
| question           | string   | required, trim                                       |                             |
| normalizedQuestion | string   | required, indexed                                    | from normalizeQuestion()    |
| answer             | string   | required                                             |                             |
| category           | string   | enum (10 categories — plan/10)                       |                             |
| tags               | string[] | optional (plan/10)                                   |                             |
| source             | string   | enum saved\|ai                                       |                             |
| usageCount         | number   | default 0                                            |                             |
| lastUsedAt         | Date     | optional                                             |                             |
| confidenceScore    | number   | default 70 (plan/13)                                 |                             |
| acceptanceCount    | number   | default 0 (plan/13)                                  |                             |
| editCount          | number   | default 0 (plan/13)                                  |                             |
| lastFeedbackAt     | Date     | optional (plan/13)                                   |                             |
| timestamps         | —        |                                                      |                             |

Indexes: unique `(userId, normalizedQuestion)`; compound `(userId, category, usageCount -1)`.

#### aiproviders
| Field      | Type    | Constraints                              | Notes |
|------------|---------|------------------------------------------|-------|
| userId     | ObjectId | required, indexed                       |       |
| provider   | string  | enum gemini\|openai\|claude\|groq\|ollama |       |
| encrypted  | Sealed sub-doc | required (`{ iv, ciphertext, tag }`) |       |
| lastFour   | string  | required                                 |       |
| isActive   | boolean | default false                            |       |
| timestamps | —       |                                          |       |

Indexes: unique `(userId, provider)`.

#### connectedemails
| Field          | Type     | Constraints                                                  | Notes                |
|----------------|----------|--------------------------------------------------------------|----------------------|
| userId         | ObjectId | required, unique                                             |                      |
| grantId        | string   | required                                                     |                      |
| provider       | string   |                                                              |                      |
| emailAddress   | string   | lowercase, trim                                              |                      |
| syncStatus     | string   | enum active\|disconnected\|expired                          |                      |
| reconnectHint  | string   | enum grantExpired\|scopeRevoked (plan/03)                    | optional             |
| connectedAt    | Date     |                                                              |                      |
| lastSyncAt     | Date     |                                                              |                      |
| timestamps     | —        |                                                              |                      |

#### emaillogs
| Field          | Type     | Constraints                            | Notes |
|----------------|----------|----------------------------------------|-------|
| userId         | ObjectId | required, indexed                      |       |
| jobId          | ObjectId | optional                               |       |
| grantId        | string   | required                               |       |
| provider       | string   |                                        |       |
| to / cc / bcc  | string[] |                                        |       |
| subject        | string   |                                        |       |
| bodyPreview    | string   | max 280 chars                          |       |
| status         | string   | enum sent\|failed                      |       |
| errorMessage   | string   | optional                               |       |
| messageId      | string   | optional                               |       |
| sentAt         | Date     |                                        |       |
| mode           | string   | enum compose\|test                     |       |
| attachmentIds  | string[] | optional (plan/07)                     |       |
| aiGenerated    | boolean  | default false (plan/07)                |       |
| timestamps     | —        |                                        |       |

Indexes: `(userId, sentAt -1)`.

#### jsearchkeys
| Field           | Type     | Constraints              | Notes                                |
|-----------------|----------|--------------------------|--------------------------------------|
| userId          | ObjectId | required, unique         |                                      |
| encrypted       | Sealed   | required                 | AES-256-GCM                          |
| lastFour        | string   | required                 |                                      |
| isActive        | boolean  | default true             |                                      |
| totalLimit      | number   | default 100              |                                      |
| usedThisMonth   | number   | default 0                |                                      |
| monthKey        | string   | YYYY-MM                  |                                      |
| usedToday       | number   | default 0 (plan/09)      |                                      |
| dayKey          | string   | YYYY-MM-DD (plan/09)     |                                      |
| dailyLimit      | number   | default 20 (plan/09)     |                                      |
| lastCallAt      | Date     |                          |                                      |
| callHistory     | nested[] | `{ at }`, trim to last 200 |                                    |
| timestamps      | —        |                          |                                      |

### 4.b Collections (NEW per plans)

| Collection           | Plan      | Purpose                                       |
|----------------------|-----------|-----------------------------------------------|
| refreshtokens        | plan/02   | Rotation chain for access tokens.              |
| connectedplatforms   | plan/05   | LinkedIn / Naukri / etc. per-user creds.       |
| autoapplyruns        | plan/12   | One per run of auto-apply.                     |
| autoapplyattempts    | plan/12   | One per (run, job) attempt.                    |
| answerfeedback       | plan/13   | Per-question (suggested → final) audit.        |
| auditlogs            | plan/14   | Admin-action audit.                            |

Schemas are in their respective plan files.

### 4.c References (Mongoose has no FK enforcement — refs documented)

```
matches.userId            → users._id
matches.jobId             → jobs._id
matches.autoApplyRunId    → autoapplyruns._id
resumes.userId            → users._id
qnas.userId               → users._id
aiproviders.userId        → users._id
connectedemails.userId    → users._id
emaillogs.userId          → users._id
emaillogs.jobId           → jobs._id
jsearchkeys.userId        → users._id
refreshtokens.userId      → users._id
connectedplatforms.userId → users._id
autoapplyruns.userId      → users._id
autoapplyattempts.runId   → autoapplyruns._id
autoapplyattempts.userId  → users._id
autoapplyattempts.jobId   → jobs._id
answerfeedback.userId     → users._id
answerfeedback.attemptId  → autoapplyattempts._id
answerfeedback.qnaId      → qnas._id (nullable)
auditlogs.userId          → users._id
auditlogs.actorId         → users._id (nullable)
```

Cleanup behavior: no cascading deletes in Mongoose. Soft-delete (plan/14 `disabledAt`) is preferred. If hard-delete is required (GDPR), implement a `services/admin/deleteUser.ts` that explicitly cascades.

### 4.d Indexes (consolidated)

| Collection         | Index                                                | Why |
|--------------------|------------------------------------------------------|-----|
| users              | unique email; unique sparse mobile; sparse nylasUserId | login + nylas linkage |
| jobs               | unique sparse externalId; multikey skills; compound `(jobMode, postedAt -1)`; text `(title, company, description)` | filtering + search |
| resumes            | userId                                                | personal load |
| matches            | unique `(userId, jobId)`                              | dedup |
| qnas               | unique `(userId, normalizedQuestion)`; compound `(userId, category, usageCount -1)` | similar lookup + listing |
| aiproviders        | unique `(userId, provider)`                           | one row per provider |
| connectedemails    | unique userId                                         | one inbox per user |
| emaillogs          | `(userId, sentAt -1)`                                 | activity feed |
| jsearchkeys        | unique userId                                         |       |
| refreshtokens      | userId, unique tokenHash, TTL expiresAt              | rotation + reaping |
| connectedplatforms | unique `(userId, platform)`                          |       |
| autoapplyruns      | `(userId, createdAt -1)`                              | dashboard |
| autoapplyattempts  | `(userId, runId, jobId)`, `(runId, status)`           |       |
| answerfeedback     | `(userId, questionNormalized)`, `(userId, createdAt -1)`, qnaId | learning agg |
| auditlogs          | `(userId, createdAt -1)`, `(action, createdAt -1)`, TTL `createdAt` 180d | retention |

### 4.e Other constraints

- RLS: MongoDB has no row-level security. Every read/write enforces `userId` from the session in the service layer.
- Required-string fields use `required: true` Mongoose validators; enums are arrays.
- `Sealed` is a sub-document `{ iv: string, ciphertext: string, tag: string }` produced only by [secretBox.encrypt](../src/server/crypto/secretBox.ts).

### 4.f Migration plan

Mongoose adds new fields lazily. For NEW collections, no migration step is needed — they create on first insert.

For renames or backfills (e.g. plan/06's `jobMode` backfill from `isRemote`), one-off Node scripts under `scripts/` connect via [src/server/db/connect.ts](../src/server/db/connect.ts) and walk documents in batches. Scripts are idempotent.

Index changes ship via `schema.index(...)` declarations — Mongoose builds them on first connect.

---

## Step 5–10

N/A — schema-only doc.

---

## Step 11 — Output folder structure

```
src/server/models/
├── User.ts
├── Job.ts
├── Resume.ts
├── Match.ts
├── QnA.ts
├── AiProvider.ts
├── ConnectedEmail.ts
├── EmailLog.ts
├── JsearchKey.ts
├── RefreshToken.ts             # plan/02
├── ConnectedPlatform.ts        # plan/05
├── AutoApplyRun.ts             # plan/12
├── AutoApplyAttempt.ts         # plan/12
├── AnswerFeedback.ts           # plan/13
└── AuditLog.ts                 # plan/14

scripts/
├── backfillJobMode.ts          # plan/06
└── ...
```

---

## Open questions

1. Multi-tenant isolation by `tenantId` on every collection — needed only if we add team accounts. Defer.
2. Soft-delete vs hard-delete for legal compliance (GDPR "right to be forgotten") — needs hard-delete path. Defer to legal review.
3. Should `Resume` support multiple per user (versioning)? Today there's one current resume. Recommended: add `isCurrent: boolean` and let users keep historical versions. Defer.
