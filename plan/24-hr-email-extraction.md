# Plan 24 — HR Email Extraction

> Status: **PARTIALLY SHIPPED 2026-05-28** — Pure `extractEmailsFromText` (+ 8 unit tests) + `/api/jobs/[id]/extract-emails` route + `Job.extractedEmails` field + automatic extraction inside the hourly + daily cron handlers. URL fetcher (`extractEmailsFromUrl`), per-domain throttle, robots check, MX validation, and composer-UI "Likely HR contacts" picker are **not yet started** (held for the next iteration once the ToS/robots posture is finalized). Source: [docs/Next_Phase3.docx](../docs/Next_Phase3.docx) §7. Master: [plan/20-phase3-master.md](20-phase3-master.md).

---

## What

For a job posting that doesn't carry a recruiter email in the structured fields, derive a candidate HR/recruiter address by:

1. Regex-scanning the posting description.
2. Regex-scanning the posting page's HTML footer (when we have the URL and a fetch budget).
3. Falling back to a guess from the company website root (e.g. `careers@<company-domain>`).

Each extracted candidate carries a **confidence** score so the user reviews low-confidence picks before send.

**Verbatim from §7:**
> Detect: hr@ · careers@ · jobs@ · recruiter@

---

## Scope this plan owns

- Pure `extractEmailsFromText(text)` utility (regex over an explicit prefix allow-list).
- `extractEmailsFromUrl(url)` service that fetches the URL with a small timeout + budget, runs the extractor on the HTML.
- `guessHrEmail(company, domain)` fallback — only constructs `careers@domain` when the domain is verifiable (MX record check optional but recommended).
- Per-job cache: `Job.extractedEmails: [{ email, source: 'description'\|'page'\|'guess', confidence: 0..1, extractedAt }]`.
- UI surface in the email composer: a "Likely HR contacts" picker that pre-fills the To field, ranked by confidence.

## Scope this plan does NOT own

- LinkedIn / Indeed recruiter pages (they require auth + a session-based provider — see plan/05).
- Verifying that the extracted email is deliverable — out of scope for first cut.
- The send mechanics — that's existing Nylas integration.

---

## Dependencies / what must exist first

- Network access from the cron worker (plan/22 trigger calls into this).
- Rate limiting — plan/24 must NOT hammer external sites. Per-domain throttle baked into `extractEmailsFromUrl`.

---

## Algorithm sketch

```ts
// Pure: no I/O. Easy to unit-test like plan/12 did for normalize.ts.
export function extractEmailsFromText(text: string): { email: string; confidence: number }[]

const PREFIX_CONFIDENCE: Record<string, number> = {
  hr: 0.95, careers: 0.9, jobs: 0.85, recruit: 0.85, recruiter: 0.9,
  talent: 0.8, hiring: 0.8, apply: 0.75, joinus: 0.7,
};
```

Anything outside the prefix allow-list either gets a low default confidence (0.3) or is filtered out — depends on whether we want recall or precision. **First pass: precision** (filter unknown prefixes).

URL fetcher:
- Honor `robots.txt` (cheap check).
- Single GET; 5s timeout; 200 KB body cap.
- Per-domain rate: 1 request / 10s.

---

## Database

No new collection; embed on `Job`:

```ts
extractedEmails: [{
  email: string,
  source: 'description' | 'page' | 'guess',
  confidence: number,  // 0..1
  extractedAt: Date,
}]
```

Index: none (per-job retrieval is by Job `_id`).

---

## Routes (preview)

```
POST   /api/jobs/[id]/extract-emails      (Re-)run extraction for one job (protected)
```

Mostly called transitively from the cron worker; the manual route is for "user clicked refresh" on the composer.

---

## Open questions

1. **Robots / ToS posture.** Even passive HTML fetches risk a `cease & desist` from sites that prohibit scraping. Recommend default-disabled; user-enabled per-domain after a one-time warning.
2. **Confidence threshold for auto-fill.** Below 0.7, surface as suggestion only; above 0.9, pre-fill recipient. Tune after real usage.
3. **MX validation.** A `dig MX` check eliminates obvious typos before send. Cheap; defer to second iteration.
