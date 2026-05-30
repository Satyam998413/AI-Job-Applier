---
name: backend-development
description: Use ALWAYS when creating, scaffolding, or modifying backend code in this repo (Express + Sequelize + MySQL/Postgres + Redis). The authoritative playbook of non-negotiables for runtime, database changes, project structure, JavaScript style, API contracts, and workflow. Routes you to the deeper skills (database-guidelines, api-standards, javascript-best-practices, backend-file-structure, sequelize-patterns, project-workflow) and enforces the camelCase end-to-end and reuse-before-create rules from CLAUDE.md.
---

# Backend Development Guidelines (Skill)

You are a skilled backend engineer experienced with Software Architecture, Node.js, Express.js, Sequelize ORM, MySQL, PostgreSQL, Redis, Firebase, Socket.io, Joi, and best practices in Security and Scalability.

This skill is the authoritative checklist for every backend task. Apply it before, during, and after writing code. When a section says "use the skill: X", invoke that deeper skill for full details.

---

## When to use this skill

Apply this skill whenever you are:
- Bootstrapping a new backend service or module
- Adding/modifying an Express controller, service, model, route, or Joi schema
- Writing a Sequelize migration, seeder, or association
- Adding/changing an API endpoint (including health/ready checks)
- Touching `app.js`, `bin/www`, `configs/`, or any `modules/[name]/` folder
- Reviewing backend code or planning a backend change

If you are about to write backend code and you have NOT consulted this skill in the current task, stop and consult it first.

---

## Pre-flight checklist (run before writing any code)

1. **Skills first.** Confirm whether a more specific skill applies (`database-guidelines`, `api-standards`, `javascript-best-practices`, `backend-file-structure`, `sequelize-patterns`, `project-workflow`). Use it; do not reinvent its guidance.
2. **Reuse before create.** Search the codebase for an existing module/component/util before adding a new one. If it exists, reuse (extend with a prop/option) instead of duplicating.
3. **camelCase end-to-end.** The same camelCase key must flow from DB schema → model → service → controller → API request/response → frontend variable. Never introduce snake_case ↔ camelCase mapping layers.
4. **Plan first.** For non-trivial work, write a short step-by-step plan and get approval before coding.
5. **Ask, don't assume.** If requirements are unclear, ask focused questions.
6. **Approval gates.** Do NOT modify `.env` / env vars, run DB migrations, or install/update dependencies without explicit human approval.

---

## 1) Runtime & Environment

- **Node.js** 20.x (LTS) or higher.
- **Package manager**: `npm` by default (or `yarn`/`pnpm` if the project root specifies).
- Every project root must include a `.nvmrc`.
- Never hardcode secrets. Use env vars loaded via `configs/`.

---

## 2) Database Changes — Agent Checklist

### New Tables vs Existing Tables

| Scenario | Migration Required? | Approach |
|----------|---------------------|----------|
| **New Table** (no migration exists in `migrations/`) | ❌ No | Use `Model.sync()` in the model file |
| **Existing Table** (migration exists) | ✅ Yes | Create a timestamped migration |

**Decision rule:**
- **New table** → add the model in `modules/[module]/model.js` and call `Model.sync()` there. No migration file. Still create a seeder.
- **Existing table** → MUST go through a timestamped migration. Never alter schema by editing the model alone.

### Migration rules
- **No inline indexes with column DDL.** Create indexes in a separate migration, only when explicitly requested (large tables are expensive to index).
- **No destructive ops in one step.** Drop/rename = add new → backfill (batched) → switch reads/writes → drop old in a later migration.
- **NULL → NOT NULL safely.** Add nullable + default → backfill in batches → ALTER to NOT NULL in a separate migration.
- **Use transactions** wherever the DB supports them. For non-transactional ops, document the risk and require human approval.
- **Batch large data migrations.** Paginate, log progress, avoid long single transactions.
- **Pre-check duplicates** before adding UNIQUE constraints/indexes.
- **Always include a rollback / down migration** or a documented abort plan with data-loss risks.
- **Document risk per migration**: estimated runtime, affected rows, online/concurrent index build, suggested maintenance window.
- **Update models AND tests** to match the migration.
- **Production apply requires explicit human confirmation.** Agent generates files + local test suggestions only.
- **Generate a seeder** for every new model/module (dummy data for testing).

### Database non-negotiables
- New tables → `sequelize.sync()`. Existing tables → migrations only.
- **Associations live inside the model file** (import related models directly, set up associations inline). NEVER create separate association files.
- Multi-step writes MUST use transactions.
- Avoid raw SQL. If unavoidable, use parameter binding/replacements — NEVER string interpolation.
- Reads must specify explicit `attributes` (do not fetch full rows by default).
- Prevent N+1 with eager loading (`include`).
- Add indexes on foreign keys; composite indexes for frequently combined filters.
- List endpoints MUST paginate.
- Runtime DB user follows least privilege (no ALTER/DROP/TRUNCATE).
- For full details → use the skill: `database-guidelines` (and `sequelize-patterns` for templates).

---

## 3) Backend Structure Non-Negotiables

- Follow the canonical **modules-first / vertical-slice** layout.
- **One Table = One Module.** Each DB table is its own module under `modules/`. Multi-entity features split into multiple modules (e.g., `community/`, `post/`, `comment/` — never one mega-module).
- Each feature lives in `modules/[moduleName]/` with:
  - `model.js`
  - `controller.js`
  - `service.js`
  - `joiSchema.js`
  - `constant.js`
  - `routers/` containing `index.js` and `admin.js`
- **Controllers are thin** (HTTP only). All business logic lives in **Services**.
- `app.js` configures Express. `bin/www` starts the server. Never mix.
- `configs/` holds external service configs. Never hardcode secrets — always env vars.
- Validate inputs with Joi via the validator middleware on every read/write.
- New model/module → add a corresponding seeder.
- Implement reliability:
  - Handle `uncaughtException` and `unhandledRejection`.
  - Graceful shutdown on `SIGTERM` and `SIGINT`.
- For full details → use the skill: `backend-file-structure`.

---

## 4) JavaScript Non-Negotiables

- ES6 modules (`import` / `export`); `"type": "module"` in `package.json`.
- `const` by default, `let` only when reassignment is required, **never `var`**.
- Naming:
  - `camelCase` for variables/functions
  - `UPPER_CASE` for constants
  - `is*` / `has*` / `can*` / `should*` for booleans
- Always handle async errors. Never swallow exceptions. Throw `Error` instances only and route through standardized error middleware.
- Prefer `async/await` over `.then()` chains; use `Promise.all` for parallel independent work.
- No raw `console.log` — use structured logging with a request ID.
- Strict equality (`===`/`!==`); use optional chaining and destructuring.
- Defense in depth: Joi at the edge **and** DB constraints.
- For full details → use the skill: `javascript-best-practices`.

---

## 5) API Non-Negotiables

- Every project must expose:
  - `GET /health` — liveness. Returns `200` immediately if the process is up. **No dependency checks.**
  - `GET /ready` — readiness. Validates critical deps (DB, Redis, Queue if used). Returns `200` only if healthy, otherwise `503`.
- Use HTTP status codes consistently: `200` / `201` / `204` / `400` / `401` / `403` / `404` / `409` / `422` / `429` / `500`.
- All `getAll` / list endpoints MUST use **`sqquery`** for pagination, sort, filter, search, and date-range consistency.
- Prefer `?fields=` for field selection.
- Use dedicated `/bulk` endpoints for bulk operations.
- camelCase keys throughout request and response payloads.
- For full details → use the skill: `api-standards`.

---

## 6) Project Workflow Non-Negotiables

- **Plan-first.** Write a clear step-by-step plan and get approval before coding.
- **Ask, don't assume.** Unclear requirements → focused questions.
- **Approval gates** (no autonomous changes here):
  - `.env` / environment variables
  - DB migrations (production apply)
  - Installing / updating dependencies
- **No large refactors / restructures** unless explicitly requested.
- **No skeletons or stubs.** Ship production-ready code with validation and error handling.
- Break large work into subtasks; align on approach before executing each.
- **Root-cause debugging.** Don't patch symptoms.
- Read existing code before editing.
- Handle edge cases: failures, concurrency, retries, correct 4xx vs 5xx.
- For full details → use the skill: `project-workflow`.

---

## 7) Hard Rules from CLAUDE.md (always)

- **Keep pages/files as short as possible.** Extract to components, hooks, services, configs, and constants.
- **Reuse before create.** Search first; extend an existing thing with a prop/option before adding a new one.
- **camelCase end-to-end.** Same camelCase key from DB schema → API → frontend. No naming-variant mappers.
- **Skills first.** Always check `.claude/skills/` before performing a task and use the matching skill.

---

## Definition of Done (every backend change)

Before marking a backend task complete, verify:

- [ ] The matching deeper skill(s) were consulted.
- [ ] No new module duplicates an existing one (reuse-before-create satisfied).
- [ ] camelCase keys are consistent end-to-end (DB ↔ API ↔ frontend).
- [ ] New table → `Model.sync()` and seeder added. Existing table → timestamped migration with rollback.
- [ ] Associations defined inside the model file (no separate association files).
- [ ] Controller is thin; business logic is in the service.
- [ ] Joi schema covers every input field.
- [ ] List endpoints use `sqquery` and pagination.
- [ ] Reads specify explicit `attributes`; no N+1 (eager `include` where needed).
- [ ] Multi-step writes are wrapped in transactions.
- [ ] No raw SQL — or, if unavoidable, parameter-bound only.
- [ ] No hardcoded secrets; config goes through `configs/` + env vars.
- [ ] `/health` and `/ready` still behave correctly.
- [ ] Errors thrown as `Error` instances and routed through error middleware.
- [ ] Structured logging with request IDs (no raw `console.log`).
- [ ] No `var`; ES6 modules; strict equality.
- [ ] `uncaughtException`, `unhandledRejection`, `SIGTERM`, `SIGINT` handled.
- [ ] No `.env` / migration / dependency change made without explicit human approval.
- [ ] Tests / models updated to match schema changes.
