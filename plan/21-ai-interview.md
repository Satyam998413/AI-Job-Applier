# Plan 21 — AI Interview Page

> Status: **SHIPPED 2026-05-28**. Source: [docs/Next_Phase3.docx](../docs/Next_Phase3.docx) §12–14. Master: [plan/20-phase3-master.md](20-phase3-master.md).
>
> **Decisions taken at build time:**
> - **Transcription:** OpenAI Whisper via the user's stored OpenAI API key. If they don't have one, transcription is skipped silently and the user's typed answer becomes the source.
> - **Media storage:** Vercel Blob (`@vercel/blob` + `BLOB_READ_WRITE_TOKEN`). Without the token configured, audio upload is a 503 — the rest of the interview still functions on typed answers.
> - **Live coding:** styled textarea (no Monaco). Saves ~5 MB of bundle weight + SSR complexity; trade-off accepted because LLM rubric scoring evaluates the submitted text identically.
> - **Share URLs:** HS256-signed `{interviewId, nonce}` tokens at `/i/[token]`, 30-day default expiry, revocation via DELETE on `/api/interview/[id]/share`.
> - **Async scoring:** uses `next/server.after()` so `/finish` returns 202 immediately; the UI polls `/api/interview/[id]` every 3s for `scoring → scored`.

---

## What

A user-owned interview page that hosts the candidate through an AI-driven mock interview, captures their audio/video, scores the session, and exposes a shareable public URL the candidate attaches to job applications. Recruiters click the URL → land on a read-only summary (transcript + scores + replay), no login required.

**Verbatim from §12:**
> AI voice questions · Camera support · Microphone support · Live coding · Timer

**Verbatim from §14 (DB):**
> Store: Video · Audio · Answers · Scores · Reports

---

## Scope this plan owns

- The candidate-facing page at `/interview/[id]` (authenticated user) — runs the live session.
- The public read-only page at `/i/[shareToken]` — what recruiters see.
- The `Interview` Mongoose model + media storage references.
- Server services for: question generation (reusing existing LLM adapters), AI scoring of answers, share-token issuing + revocation.
- The Settings → AI Interview tab (drives defaults: question count, duration, categories).

## Scope this plan does NOT own

- General AI features (cover letter, tailoring, etc.) — covered by existing plans.
- The Phase 2 `interview-prep` route (text-only practice questions) — that stays as-is and shows a link to "Run a full AI interview" pointing here.
- Embedding the interview UI inside an outbound job email — that's [plan/22 §Daily Report](22-cron-and-reports.md) territory (the email body includes the public URL).

---

## Dependencies / what must exist first

- **Media storage backend** (S3 / Cloudinary / Vercel Blob). No file storage exists in the project today; the first feature to need it builds it. Master plan §Open-questions recommends Vercel Blob to avoid AWS bootstrapping.
- **Public route guard pattern.** Existing `requireUser` redirects unauthenticated users to `/login`. The public summary page needs the opposite: explicitly anonymous + signed-token validated. A new `validateShareToken(token)` helper in `src/server/auth/` is implied.
- **Long-running AI scoring** must run off the request path (Vercel timeout). See plan/20 OQ1 (worker host).
- **WebRTC vs MediaRecorder.** WebRTC is overkill for a single-participant session. `MediaRecorder` + chunked upload is simpler and ships everywhere. Decide before building.

---

## Sub-features and shape

| Sub-feature                       | Surface added                                                                                          |
|-----------------------------------|--------------------------------------------------------------------------------------------------------|
| Live interview UI                 | `/interview/[id]` page with question stepper, mic/cam controls, timer, optional live-code editor pane  |
| AI voice questions                | Server generates per-job questions (reuses plan/07's interview-prep LLM); browser TTS reads them aloud |
| Media capture                     | `MediaRecorder` → chunked upload to storage; references stored on `Interview.media[]`                  |
| Live coding                       | Embedded Monaco editor with language picker; submission saved as text + final snapshot                 |
| AI scoring                        | Post-session worker: transcribe (Whisper or equivalent) → LLM rubric → `Interview.scores`              |
| Public share URL                  | `/i/[shareToken]` page; tokens are HS256-signed `{ interviewId, expiresAt }`                           |
| Interview Settings tab            | Defaults (count, duration, categories, language); part of plan/25                                      |

---

## Database

New collection: `interviews`.

| Field            | Purpose                                                                                  |
|------------------|------------------------------------------------------------------------------------------|
| userId           | Owner.                                                                                   |
| matchId / jobId  | What the interview was for. Nullable for "practice" sessions.                            |
| questions        | `[{ question, category, askedAt, answeredAt, transcript, codeSubmission }]`              |
| media            | `[{ kind: 'audio'\|'video', storageKey, mimeType, durationMs }]`                         |
| scores           | `{ communication, technical, confidence, overall, rubric: [{criterion, score, comment}] }` |
| share            | `{ token: string (hash), expiresAt, revokedAt, viewedCount }`                            |
| status           | `pending`, `live`, `completed`, `scoring`, `scored`, `failed`                            |

Indexes: `{userId: 1, createdAt: -1}`; `{ "share.token": 1 }` unique sparse; TTL on `share.expiresAt` to auto-revoke.

---

## Routes (preview)

```
POST   /api/interview                       Start a session (returns id + signed session token)
GET    /api/interview/[id]                  Owner-only state + question stream
POST   /api/interview/[id]/upload-chunk     Multipart chunked upload of audio/video
POST   /api/interview/[id]/answer           Save text/code answer for current question
POST   /api/interview/[id]/finish           Mark complete + enqueue scoring
GET    /api/interview/[id]/share            Get current share token (owner)
POST   /api/interview/[id]/share/revoke     Revoke + rotate
GET    /api/i/[shareToken]                  Public read-only DTO (subject to expiry)
```

All write routes rate-limited via [src/server/services/rateLimit.ts](../src/server/services/rateLimit.ts) (new buckets: `interviewStart`, `interviewUpload`).

---

## Open questions specific to this plan

1. **Transcription provider.** OpenAI Whisper API is the obvious default; Gemini has audio understanding too. Pick one; structure scoring to be transcription-source-agnostic.
2. **Live-coding execution.** Run code in-browser (Pyodide / WebContainers) or no execution (static editor + LLM-judged)? Static is far cheaper for first launch.
3. **PII in transcripts.** Stored verbatim by default; need an opt-in to scrub names/emails before sharing. Defer to a later iteration.
4. **Bandwidth cost of video.** A 30-min 720p webcam recording is ~250-500 MB. At 1k users/month, storage cost becomes real. Audio-only mode should be the default.

---

## Estimated size

Largest plan in Phase 3 by a wide margin. Rough estimate when fully built out: ~20-25 new files, 2-3k LOC, plus media storage bill.
