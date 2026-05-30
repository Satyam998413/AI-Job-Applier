# AI-Job-Applier

An AI-powered job-application assistant. Upload your resume, let a local LLM extract your skills,
ingest jobs, score how well each job matches you, and generate an ATS-friendly tailored resume per job.

Single **Next.js (App Router)** full-stack app · **MongoDB** · **Google Gemini** (`@google/genai`).

## Features (Phase 1 + 2)

- Email/password auth (HS256 JWT in an HttpOnly cookie).
- Resume upload (PDF / DOCX) → text extraction → AI skill + summary extraction.
- Job ingestion (seeded provider; scraper-ready interface) and listing.
- AI match scoring: score, matched skills, missing skills, reasoning.
- AI resume customization: ATS-optimized tailored resume per job.

## Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

## Setup

```bash
cp .env.example .env.local   # then edit values
npm install
npm run dev                  # http://localhost:3000
```

### Environment variables

| Var            | Description                                  |
| -------------- | -------------------------------------------- |
| `MONGODB_URI`    | MongoDB connection string                    |
| `JWT_SECRET`     | Long random secret for signing session JWTs  |
| `GEMINI_API_KEY` | Google Gemini API key (AI Studio)            |
| `GEMINI_MODEL`   | Model id, e.g. `gemini-2.5-flash`            |

## Project structure

See [CLAUDE.md](CLAUDE.md) for the full conventions and folder layout.

## Roadmap

- **Phase 3/4 (deferred):** live job scraping (Playwright), Redis + BullMQ queues, notifications,
  analytics dashboard, full auto-apply.
