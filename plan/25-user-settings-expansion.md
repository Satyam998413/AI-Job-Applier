# Plan 25 — Settings Tabs + UserSettings Collection + Multi-Resume

> Status: **SHIPPED 2026-05-28** (foundation layer). Source: [docs/Next_Phase3.docx](../docs/Next_Phase3.docx) §1–3 + §4. Master: [plan/20-phase3-master.md](20-phase3-master.md). Foundation for plans 21–24.

---

## What

The `UserSettings` collection + the five new settings-page tabs that read/write it. Without this, no other Phase 3 feature can be enrolled-into per-user. This is intentionally the **first** thing to ship in Phase 3.

**Verbatim from §1.1:**
> Add tabs: General · Auto Apply · Resume · AI Interview · Email Templates · Cron Logs

(`Cron Logs` is admin-only in this plan — surfaced inside the admin route, not the user settings page. See [plan/22 §Cron Logs](22-cron-and-reports.md).)

---

## Scope this plan owns

- The `UserSettings` Mongoose model + indexes.
- The settings page reorg from the current single-form view into a tabbed layout (5 tabs).
- The Auto Apply, AI Interview, and Email Templates tab forms — read/write `UserSettings` fields they own.
- Resume tab additions: multi-resume support (rename existing single-resume flow, add "set default", "delete").
- Service: `getUserSettings(userId)` + `updateUserSettings(userId, patch)` with zod-validated patches.

## Scope this plan does NOT own

- The actual behaviors gated by the settings (cron enrollment, interview defaults, notifications) — those live in plans 21–24, which READ these fields.
- Existing AI Provider / Nylas / JSearch sections — kept as-is (they live under General).
- Cron Logs UI — admin-only, in [plan/22](22-cron-and-reports.md).
- CAPTCHA configuration — descoped per [plan/20](20-phase3-master.md) §Decisions §5.

---

## Database

New collection: `usersettings` (Mongoose convention; one row per user).

| Field                | Default              | Purpose                                                   |
|----------------------|----------------------|-----------------------------------------------------------|
| userId               | required, unique     | Owner.                                                    |
| autoApplyEnabled     | false                | Master switch for Phase 3 daily loop.                     |
| applyLimit           | 25                   | Max jobs per day for the cron fan-out.                    |
| dateFilter           | `last7d`             | `last24h` \| `last2d` \| `last7d` \| `last30d`.            |
| includeKeywords      | `[]`                 | OR-matched.                                               |
| excludeKeywords      | `[]`                 | AND-NOT.                                                  |
| locations            | `[]`                 | Free text (Remote / India / USA / Hybrid / city).          |
| experienceBuckets    | `[]`                 | `fresher` \| `1-3` \| `3-5` \| `5-10` \| `10+`.            |
| salaryMin            | null                 | Annual; currency follows `salaryCurrency` on Job.         |
| cronTimezone         | `UTC`                | Drives which cron firing the user is in.                  |
| notifyChannels       | `{ inApp: true, email: false, push: false }` | Plan/23 channel routing.                       |
| dailyReportEnabled   | true                 | Plan/22 nightlyReport opt-out.                            |
| emailTemplates       | `{ recruiter, followUp }` strings | User-customizable templates (plan/07 reads these). |
| interviewDefaults    | `{ count: 10, durationMin: 30, categories: [...], language: 'en' }` | Plan/21 defaults. |
| createdAt, updatedAt | (timestamps)         |                                                           |

Indexes: `{ userId: 1 }` unique.

**Migration note:** lazy. `getUserSettings(userId)` returns defaults if no row exists; first update upserts. No backfill script.

---

## Multi-resume — what changes

Today: one `Resume` document per user (the latest upload wins via `sort({updatedAt: -1})`).

After this plan: still one model, but with `isDefault: Boolean`. The `find by user, sort by updatedAt` calls become `findOne({ userId, isDefault: true })`. A "Set as default" action toggles it across all of the user's resumes in a transaction.

Resume LIST endpoint and a delete endpoint are added; routes that consume "the resume" (match, tailor, cover-letter, interview) always read the default.

---

## Routes (preview)

```
GET    /api/user-settings                Get my settings (defaults if none).
PATCH  /api/user-settings                Partial update (zod-validated).
GET    /api/resume/list                  List my resumes (multi-resume support).
POST   /api/resume/[id]/default          Set as default (atomic toggle).
DELETE /api/resume/[id]                  Delete a non-default resume.
```

The 7 settings sub-forms hit the same `PATCH /api/user-settings` with a narrow payload — keeps the surface tiny.

---

## Open questions

1. **Tab vs sidebar layout.** Current `/settings` is a single page with sections. Phase 3 §1.1 says "sidebar navigation" + tabs. Recommend tabs at top, sticky on scroll — matches the rest of the app's design vocabulary.
2. **Per-resume settings.** Should `interviewDefaults`, keywords, etc. be per-resume (one user, multiple personas) or per-user? Recommend per-user for first cut; revisit when users explicitly ask for "freelance persona vs full-time persona" separation.
3. **Timezone autodetect.** Browser `Intl.DateTimeFormat().resolvedOptions().timeZone` is reliable. Auto-fill on first settings load; user can override.
4. **Email templates as zod-validated handlebars vs raw strings.** Raw strings + `{{variables}}` is good enough for v1; structured templating is overkill.
