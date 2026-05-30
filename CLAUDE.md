# CLAUDE.md — AI-Job-Applier

Guidance for Claude Code when working in this project. These rules OVERRIDE defaults.

## What this is

An AI-powered job-application platform (single **Next.js App Router** full-stack app). It extracts
resume skills, ingests jobs, scores job ↔ resume matches, and generates ATS-friendly tailored resumes.

This project is **standalone** — it does not share code or conventions with the sibling
`new-total-agent-app` / `total-agent-app` projects in the parent repo.

## Docs

All product, planning, and architecture documents live in [docs/](docs/). Read every file in that
folder before scoping or planning a feature.

- [docs/Next_Phase1.docx](docs/Next_Phase1.docx) — high-level architecture, core modules, MVP roadmap (Phase 1→4).
- [docs/Next_Phase2.docx](docs/Next_Phase2.docx) — the 19-task feature backlog (Signup → Future Enhancements).
- [AI_Job_Application_Agent_Documentation.docx](AI_Job_Application_Agent_Documentation.docx) — original spec; superseded by `docs/Next_Phase1.docx` for current planning.

Note: `docs/Next_Phase1.docx` and `docs/Next_Phase2.docx` are stored as plain UTF-8 (read with `cat`,
not a docx parser). The root-level `.docx` is a real Word file (use `mammoth`).

Per-feature implementation plans derived from these docs live in [plan/](plan/). The
`/feature-plan` slash command (see [.claude/commands/feature-plan.md](.claude/commands/feature-plan.md))
writes new plans there.

## Stack

- Next.js 15 (App Router) + TypeScript + React 19 — Route Handlers ARE the backend (no Express).
- MongoDB + Mongoose 8.
- Google Gemini via `@google/genai` for all AI (skill extraction, matching, resume tailoring).
- `zod` + `zod-to-json-schema` for validation and LLM structured outputs.
- `jsonwebtoken` + `bcryptjs` for auth (HS256 JWT in HttpOnly `aja_session` cookie).
- `pdf-parse` (PDF) + `mammoth` (DOCX) for resume text extraction.
- CSS Modules + CSS-variable design tokens. No Tailwind / MUI / shadcn.

## Hard rules

- **400 LOC ceiling per file.** Pages are thin shells (10–30 LOC) composing components.
- **One component per file. No raw DOM in pages** — extract JSX into dedicated components.
- **Reuse before create.** Search `src/components/` before adding a new primitive; extend with a prop.
- **camelCase end-to-end.** Same key from frontend var → API body → service → Mongoose field. No
  snake_case in the DB and mapping layers.
- **LLM split.** All Gemini calls go through `src/server/services/llm/geminiClient.ts`. Each
  `services/llm/<fn>.ts` holds orchestration + parser only; the prompt builder lives in the paired
  `services/llm/prompt/<fn>.ts`. No inline LLM calls in route handlers, no prompt strings in services.
- **Every route folder** has `page.tsx`, `error.tsx`, `loading.tsx`, plus `_components/_hooks/_types`.
- **Node runtime for server libs.** Route handlers using Mongoose/pdf-parse/mammoth/Gemini set
  `export const runtime = "nodejs"`.
- **Secrets only in `.env.local`** (gitignored). Validate required vars via `src/lib/env.ts`.

## Layout

```
src/app/        routes (pages + api/*/route.ts)
src/server/     db/connect.ts, models/, auth/, services/{resume,jobs,llm}
src/components/ shared primitives
src/lib/        env.ts (validated), apiClient.ts
src/styles/     tokens.css
src/types/      shared types
```

## Run

1. Start MongoDB; get a Gemini API key from https://aistudio.google.com/apikey.
2. `cp .env.example .env.local` and fill values (incl. `GEMINI_API_KEY`).
3. `npm install && npm run dev` → http://localhost:3000.

## Deferred (Phase 3/4)

Live scraping (Playwright), Redis+BullMQ queues, notifications, analytics. The `jobProvider`
interface is shaped so a real scraper plugs in later without touching callers.
