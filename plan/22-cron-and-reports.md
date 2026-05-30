# Plan 22 — Vercel Cron + Cron Logs + Daily Reports

> Status: **PARTIALLY SHIPPED 2026-05-28** — Cron trigger + CronRun model + admin logs page landed (Milestones A & D). Job handlers are **stubs** (no per-user fan-out yet). Daily report send is **not started** (blocked on worker-host decision). Source: [docs/Next_Phase3.docx](../docs/Next_Phase3.docx) §5, §15, §17. Master: [plan/20-phase3-master.md](20-phase3-master.md).

---

## What

Three tightly-coupled subsystems that share the same execution path:

1. **Cron runner (§5).** A Vercel Cron-triggered route that walks active users, fans out per-user work (fetch jobs by their saved filters, run dedup, generate HR emails, prep drafts).
2. **Cron Logs (§15).** Admin-visible history of every cron run: what happened, what failed, what was emitted. Surfaced at `/admin/cron`.
3. **Daily Reports (§17).** Per-user end-of-day summary email: jobs fetched, applies sent, drafts pending, errors. Uses existing Nylas integration.

These are one plan because they share the `CronRun` collection, the trigger architecture, and the failure-handling surface.

---

## Scope this plan owns

- `vercel.json` cron config + `/api/cron/[job]/route.ts` trigger handler (verifies Vercel Cron signature).
- `CronRun` Mongoose model — one row per (job, scheduledAt).
- The actual job functions: `dailyJobFetch`, `dailyDraftPrep`, `nightlyReport`, `hourlyHrScrape` (works with [plan/24](24-hr-email-extraction.md)).
- Admin page `/admin/cron` showing recent runs, filterable by job + status.
- Daily-report HTML template + send service (reuses `nylas/send.ts`).

## Scope this plan does NOT own

- The per-user `UserSettings` model — that's [plan/25](25-user-settings-expansion.md). This plan READS it.
- The notification fan-out — [plan/23](23-notifications-system.md). Cron writes events; notifications reads/dispatches.
- Auto-submit. Cron runs end at "draft prepared" — actual sending requires user action. (See §9 descope.)

---

## Dependencies / what must exist first

- `UserSettings` collection (plan/25) — the source of truth for "is this user enrolled in daily cron?" and their filters/schedule.
- A worker model for long-running per-user fan-out. Vercel functions are too short. See plan/20 OQ1.
- HR extraction service (plan/24) for the daily email-draft step.

---

## Database

New collection: `cronruns`.

| Field         | Purpose                                                          |
|---------------|------------------------------------------------------------------|
| job           | `dailyJobFetch` \| `dailyDraftPrep` \| `nightlyReport` \| `hourlyHrScrape` |
| scheduledAt   | When Vercel Cron was supposed to fire.                           |
| startedAt     | When it actually started.                                        |
| completedAt   | When it finished (or null if still running).                     |
| status        | `pending`, `running`, `succeeded`, `failed`, `partial`           |
| userCount     | How many users processed.                                        |
| stats         | Free-form per-job dict: `{ jobsIngested, emailsDrafted, notificationsQueued, … }` |
| errors        | `[{ userId, message, stack }]` capped at 50.                     |

Indexes: `{ job: 1, scheduledAt: -1 }`; TTL on `scheduledAt` (180d).

---

## Routes (preview)

```
POST   /api/cron/[job]                   Vercel Cron trigger (signature-verified)
GET    /api/admin/cron                   List recent runs (admin)
GET    /api/admin/cron/[runId]           Single run detail with errors (admin)
```

`vercel.json` — example:
```json
{ "crons": [
  { "path": "/api/cron/dailyJobFetch",    "schedule": "0 9 * * *" },
  { "path": "/api/cron/dailyDraftPrep",   "schedule": "30 9 * * *" },
  { "path": "/api/cron/hourlyHrScrape",   "schedule": "0 * * * *" },
  { "path": "/api/cron/nightlyReport",    "schedule": "0 22 * * *" }
]}
```

---

## Cross-cutting

- Trigger route verifies `Authorization: Bearer ${CRON_SECRET}` (Vercel injects this). Anyone else → 401. Master plan flags this as a security primitive.
- Every cron run emits `Sentry.captureException` on any per-user failure that exceeds a small threshold; partial-success runs report as `partial` rather than throwing.
- `cronTimezone` lives on `UserSettings` (plan/25). The cron route reads the user's tz and decides which cohort to include in this firing.

---

## Open questions

1. **Vercel Cron vs external scheduler.** Vercel Cron is free and tightly integrated, but its max execution time is the function timeout. If per-run work exceeds that, a separate scheduler + worker becomes necessary (plan/20 OQ1).
2. **Per-user fan-out concurrency.** A naive `for (user of users)` is fine for 100 users; at 10k it starves the function. Once user count grows past ~500, the cron route should enqueue per-user jobs to a queue and exit immediately.
3. **Daily-report unsubscribe.** Need a one-click unsubscribe link → updates `UserSettings.dailyReportEnabled`. Implies a signed-token route similar to plan/21's share tokens.
