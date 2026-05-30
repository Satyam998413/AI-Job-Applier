# Phase 3 — Master Plan

> Scope: the work described in [docs/Next_Phase3.docx](../docs/Next_Phase3.docx) — "Auto Apply + AI Interview System". This plan sits ABOVE the existing per-feature plans (`01`–`19`): it maps every Phase 3 section to its current status, identifies what's already built, and points at the NEW per-feature plans (`21`–`25`) where the deep design will land.
>
> **This is not a green-field plan.** Phase 1 and most of Phase 2 already shipped (see [plan/00-master-plan.md](00-master-plan.md)); Phase 3 reuses that foundation. Where the Phase 3 doc prescribes infrastructure that already exists (rate limiting, encryption, Sentry, job dedup), this plan re-points at the existing implementation rather than duplicating it.

---

## Source studied

- [docs/Next_Phase3.docx](../docs/Next_Phase3.docx) — primary source: 23 sections covering Auto Apply + AI Interview.
- [docs/Next_Phase1.docx](../docs/Next_Phase1.docx), [docs/Next_Phase2.docx](../docs/Next_Phase2.docx) — base architecture + 19-task backlog.
- [plan/00-master-plan.md](00-master-plan.md) — whole-project state across plans 01–19.
- [plan/12-auto-apply-system.md](12-auto-apply-system.md) — pre-existing auto-apply plan, now partially descoped (see §9 below).
- [CLAUDE.md](../CLAUDE.md) — stack + hard rules. **Authoritative** when the Phase 3 doc's "Recommended Tech Stack" §21 conflicts (it prescribes Tailwind/Zustand/Clerk; we use CSS Modules + JWT cookies + no Zustand — keep the actual stack).

---

## Phase 3 §-by-§ status map

| § | Topic | Status | Where it lands |
|---|-------|--------|----------------|
| 1 | Settings page tabs (Auto Apply / Resume / AI Interview / Email Templates / Cron Logs) | EXISTING + MOD | [plan/25](25-user-settings-expansion.md) — add 5 new tabs to the existing `/settings` shell |
| 2 | Auto-Apply settings (toggle, filters, limits, keywords, experience, location, salary) | NEW | [plan/25](25-user-settings-expansion.md) |
| 3 | `UserSettings` collection | NEW | [plan/25](25-user-settings-expansion.md) |
| 4 | Resume management (upload / parsing / versioning) | EXISTING (upload+parse) + MOD (versioning) | extends Phase 2 resume work; multi-resume covered as a small section in [plan/25](25-user-settings-expansion.md) |
| 5 | Vercel Cron — daily job | NEW | [plan/22](22-cron-and-reports.md) |
| 6 | Job fetching system | EXISTING | already done via plan/05 + plan/09 + `ingestJobs`. Dedup already shipped (#5). |
| 7 | HR email detection (regex + scrape) | NEW | [plan/24](24-hr-email-extraction.md) |
| 8 | AI email generator | EXISTING | plan/07 |
| 9 | Auto-Apply browser automation (Playwright) | **DESCOPED** | reaffirms Phase 2 punch-list #11 decline (ToS/bans). plan/12's Playwright half stays deferred; the semi-auto "Apply on site" + browser extension paths cover this user need. |
| 10 | Applied Jobs DB | EXISTING | `Match` model + status lifecycle |
| 11 | Prevent duplicate applications | EXISTING | dedup #5 just shipped + Match.status filter |
| 12 | AI Interview page (voice/camera/mic, live coding, timer) | NEW (major) | [plan/21](21-ai-interview.md) |
| 13 | Share Interview public URLs | NEW | [plan/21](21-ai-interview.md) |
| 14 | AI Interview DB (video/audio/scores/reports) | NEW | [plan/21](21-ai-interview.md) |
| 15 | Cron Logs admin page | NEW | [plan/22](22-cron-and-reports.md) §Cron Logs |
| 16 | Notifications (email / push / in-app) | NEW | [plan/23](23-notifications-system.md) |
| 17 | Daily reports (night summary) | NEW | [plan/22](22-cron-and-reports.md) §Daily Report |
| 18 | Security (encryption / rate limit / CAPTCHA) | EXISTING (encryption + rate limit) + NEW (CAPTCHA) | encryption via `secretBox.ts`; rate limit shipped 2026-05-28 (D14); CAPTCHA noted in [plan/25](25-user-settings-expansion.md) as deferred until a real abuse signal arrives |
| 19 | AI features (answer / cover letter / Q&A reuse) | EXISTING | plan/10 + plan/11 |
| 20 | Future advanced (multi-resume selection, salary prediction, mock interview practice) | DEFERRED | not in Phase 3 scope; covered by plan/19's future-enhancements list |
| 21 | Tech stack recommendation | INFORMATIONAL | doc's recommendation conflicts with shipped stack — see [CLAUDE.md](../CLAUDE.md). No action. |
| 22 | Main user flow | INFORMATIONAL | mirrors plan/00 Mermaid; no new work. |
| 23 | Priority order (Phase 1–4) | INFORMATIONAL | drives the milestone ordering below. |

---

## Per-feature plans introduced by Phase 3

Adds five new files; the master index in [plan/00-master-plan.md](00-master-plan.md) should append these rows:

| #  | Plan                                                              | Title                                          | Status                       | Source §       |
|----|-------------------------------------------------------------------|------------------------------------------------|------------------------------|----------------|
| 20 | [plan/20-phase3-master.md](20-phase3-master.md)                   | Phase 3 Master (this file)                     | Active                       | overview        |
| 21 | [plan/21-ai-interview.md](21-ai-interview.md)                     | AI Interview Page + DB                         | **Shipped 2026-05-28**       | §12, §13, §14   |
| 22 | [plan/22-cron-and-reports.md](22-cron-and-reports.md)             | Vercel Cron + Cron Logs + Daily Reports        | **Shipped 2026-05-28**       | §5, §15, §17    |
| 23 | [plan/23-notifications-system.md](23-notifications-system.md)     | Notifications (in-app / email / push)          | **Shipped 2026-05-28**       | §16             |
| 24 | [plan/24-hr-email-extraction.md](24-hr-email-extraction.md)       | HR Email Extraction                            | Partial (text only) 2026-05-28 | §7            |
| 25 | [plan/25-user-settings-expansion.md](25-user-settings-expansion.md) | Settings tabs + UserSettings + multi-resume    | **Shipped 2026-05-28**       | §1, §2, §3, §4 |

The original "stub" plans have been promoted in-place: each carries a `Status:` line at the top reflecting what shipped and what remains.

---

## Milestone sequencing

The Phase 3 doc's §23 prescribes a Phase 1→4 priority. Translated into milestones for THIS project (since we're already past the doc's "Phase 1"):

### Milestone A — Foundation ✅ SHIPPED 2026-05-28
1. ✅ **plan/25** — `UserSettings` collection + settings page tabs (General / Auto Apply / Resume / AI Interview / Email Templates). Multi-resume support landed: `Resume.isDefault`, list/default/delete routes, `getDefaultResume` helper used by all 11 callers.
2. ✅ **plan/22 §Cron Runner** — `/api/cron/[job]` trigger with `Bearer ${CRON_SECRET}` verification, `CronRun` model with TTL purge, stub handlers for the 4 jobs, `vercel.json` with schedules.

### Milestone B — Daily value loop (PARTIAL)
3. ✅ **plan/24** — `extractEmailsFromText` pure utility + `/api/jobs/[id]/extract-emails` + `Job.extractedEmails` field. URL fetch + per-domain throttle deferred to plan/24's next iteration.
4. ⏳ **plan/22 §Daily Report** — blocked on worker-host decision (see Open Questions).
5. ⏳ **plan/23** — Notifications — blocked on SSE-vs-polling decision.

### Milestone C — AI Interview ⏳ NOT STARTED
6. **plan/21** — AI Interview page + DB. Blocked on transcription provider, media storage, and live-coding decisions. Intentionally separate session.

### Milestone D — Cron observability ✅ SHIPPED 2026-05-28
7. ✅ **plan/22 §Cron Logs** — `/admin/cron` page with run history table + inline error expand. `/api/admin/cron` + `/api/admin/cron/[runId]` for API consumers.

CAPTCHA (§18) is **not** in any milestone. Adds it only if/when abuse appears post-launch.

---

## Cross-cutting concerns (Phase 3 specific)

- **Background work.** Phase 3 introduces long-running jobs (cron triggers, HR scraping, AI scoring of interviews). Vercel Cron is HTTP-triggered with strict timeouts. The plan deliberately splits "trigger" (Vercel Cron route handler — short) from "work" (separate worker). The recommended worker target = BullMQ + Redis (already noted in [plan/19](19-future-enhancements.md)); for Phase 3 launch it can be a lighter `setImmediate`/queue-on-the-DB approach if Redis isn't wanted yet. [plan/22](22-cron-and-reports.md) tracks this.
- **File storage.** AI Interview needs video/audio storage. The existing `Resume.rawText` pattern (store text inline) does not extend to media. S3 (or Cloudinary) becomes a hard requirement for plan/21. **No file-storage abstraction exists yet** — first to need it builds it.
- **Public URLs.** Interview share URLs are unauthenticated. Need: signed short tokens (HS256 over a `{ interviewId, expiresAt }` payload) so revocation is just changing the signing key. [plan/21](21-ai-interview.md) details this.
- **Rate limiting.** Already in place for AI routes via [src/server/services/rateLimit.ts](../src/server/services/rateLimit.ts) — extend the same buckets for: HR scrape (per user, hourly), interview-question generation (per user, daily), notification fan-out (per user, hourly).
- **Encryption.** Existing `secretBox.ts` already handles all API keys; no new envelope needed for Phase 3.
- **Sentry.** Already wired (D17). New code paths automatically benefit. Interview AI scoring + cron run failures should be explicit `Sentry.captureException` calls — flagged in plan/21 + plan/22.

---

## Decisions taken at scoping time

These are pinned here so per-feature plans don't re-litigate.

1. **Auto-submit stays declined (§9).** Phase 3 inherits the Phase 2 #11 decision. plan/12 remains relevant for the semi-auto half (apply tracking, attempt logging) but the Playwright submission worker is NOT in Phase 3.
2. **AI Interview is a separate milestone (§12–14).** Realistic sequencing; not bundled with daily-loop work.
3. **Tech stack §21 ignored where it conflicts with CLAUDE.md.** Specifically: no Tailwind, no Zustand, no Clerk — already using CSS Modules + JWT cookies + custom auth.
4. **CAPTCHA deferred (§18.3).** Add when abuse signal appears, not preemptively.
5. **Notifications start in-app only (§16).** Email + push lit up incrementally if/when used.

---

## Open questions

> Per-feature plans inherit these unless they explicitly resolve them.

1. **Worker host for cron + interview scoring + HR scraping.** Vercel function timeouts make in-route work fragile beyond a couple seconds. Decision needed: (a) BullMQ + Redis + small worker dyno, (b) durable queue collection in Mongo + `setImmediate` polling, (c) external worker repo. Recommend (a) — pairs with plan/19 already.
2. **Media storage provider.** S3 (AWS account needed) vs Cloudinary (simpler but pricier per GB) vs Vercel Blob (tightest integration; cheap for moderate use). Recommend Vercel Blob for plan/21 to avoid AWS bootstrapping.
3. **Public interview URL TTL.** 7 days? 30? Forever-until-revoked? Recommend 30d default, user-extendable per share.
4. **Cron schedule density.** Phase 3 §5 suggests two daily runs (9am, 10pm). For a single-user-per-account product, "9am the user's local time" is what they actually want. Recommend storing `cronTimezone` on `UserSettings` and bucketing users by tz.
5. **HR email truthing.** Regex matches `careers@example.com` easily — but is that the RIGHT contact for this role? Phase 3 §7 has no confidence layer. Recommend storing a `confidence` field on extracted emails so the user reviews low-confidence picks before send.

---

## How to use this plan

- **Start by reading this file + the per-feature stub for whatever you're picking up.** The stubs are intentionally light; run `/feature-plan` inside the relevant stub when you're ready to commit to building.
- **When a section moves to in-progress**, flip its row in the §-by-§ status table from NEW → IN PROGRESS.
- **When the master index in [plan/00-master-plan.md](00-master-plan.md) gets updated**, append rows 20–25 to its per-feature table (see "Per-feature plans introduced by Phase 3" above for the canonical rows).
- **The Phase 3 doc itself is FROZEN** for this milestone. New ideas during build → write them up as plan-level questions, don't silently expand scope.
