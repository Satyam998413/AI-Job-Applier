# Plan 23 — Notifications System

> Status: **SHIPPED 2026-05-28** — `Notification` model, `notify()` entry point, SSE `/api/notifications/stream`, `NotificationBell` in NavBar with live updates + unread badge. Email digest channel wired via plan/22's nightlyReport (notifications batched into the daily summary email). Web Push deferred. Source: [docs/Next_Phase3.docx](../docs/Next_Phase3.docx) §16. Master: [plan/20-phase3-master.md](20-phase3-master.md).

---

## What

A unified emit-once / receive-anywhere notification surface. Backend code calls `notify(userId, kind, payload)`; the user sees the result in (a) an in-app bell with unread badge, (b) optionally an email digest, (c) optionally a Web Push notification.

**Verbatim from §16:**
> Events: Job applied · Email sent · Apply failed · Daily report

---

## Scope this plan owns

- `Notification` Mongoose model + index.
- `notify()` service — the single entry point everywhere else calls.
- `/api/notifications` (list + mark-read).
- `/api/notifications/stream` (Server-Sent Events; users get push from the bell without polling).
- In-app `NotificationBell` component in the NavBar.
- Email digest path — buckets unread notifications, sends one Nylas email/day.
- (Deferred) Web Push registration + delivery.

## Scope this plan does NOT own

- The EVENTS that trigger notifications — those live in the feature plans that own them (cron run failure → plan/22 calls `notify`; AI Interview scored → plan/21 calls `notify`).
- Email send mechanics — reuses `nylas/send.ts`.

---

## Dependencies / what must exist first

- `UserSettings` (plan/25) for per-channel opt-in (`notifyChannels: { inApp, email, push }`).
- `notify()` service can land alongside this plan; emitters wire in opportunistically as each feature ships.

---

## Database

New collection: `notifications`.

| Field         | Purpose                                                                |
|---------------|------------------------------------------------------------------------|
| userId        | Recipient.                                                             |
| kind          | `applyFailed` \| `emailSent` \| `dailyReport` \| `interviewScored` \| `cronError` \| `matchScored` |
| payload       | Free-form `{}` — what the kind needs.                                 |
| title         | Short display string (denormalized for fast list rendering).            |
| body          | Display body (markdown OK).                                            |
| href          | Where the bell click should land the user.                             |
| seenAt        | When the user marked it read.                                          |
| createdAt     | (timestamps)                                                           |

Indexes: `{ userId: 1, createdAt: -1 }`; partial index on unread (`seenAt: null`) for fast badge counts.

---

## Routes (preview)

```
GET    /api/notifications                    List my notifications (paginated)
GET    /api/notifications/unread-count       Just the number (cheap)
POST   /api/notifications/[id]/mark-read     Set seenAt
POST   /api/notifications/mark-all-read      Batch
GET    /api/notifications/stream             SSE — new notifications pushed to bell
```

The SSE endpoint replaces the older "poll every 30s" approach in the spec — same UX, far less load.

---

## Channel routing

Inside `notify()`:

1. Always write the row (so it shows up in `/notifications` / bell).
2. If user has `notifyChannels.inApp`: broadcast via SSE.
3. If user has `notifyChannels.email` AND the notification is `kind` in the email allow-list: enqueue into the daily-digest bucket (handled by plan/22's `nightlyReport`).
4. If user has `notifyChannels.push` AND a push subscription is registered: send a Web Push payload.

This puts the policy (channel routing) in ONE place, so feature code never decides "send an email" — it just calls `notify`.

---

## Open questions

1. **Real-time mechanism: SSE vs WebSocket vs polling.** SSE is simpler, sufficient for unidirectional push, and works with Next.js Route Handlers. Recommend SSE.
2. **Notification grouping.** "5 jobs failed today" beats 5 separate rows. Implement a `groupKey` on rows so the UI can collapse runs from the same source. Defer until volume justifies it.
3. **Web Push.** Needs VAPID keys + a service worker. Skip in initial pass; ship in-app + email digest first.
