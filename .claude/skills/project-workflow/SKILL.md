---
name: project-workflow
description: Use when planning new features, handling unclear requirements, or making architectural decisions. Enforces plan-first execution, strict agent permissions (env/migrations/deps), scoped refactoring, clear communication, and best practices like root-cause analysis and edge-case handling.
---

# Project Workflow & Management (Skill)

## When to use this skill
Use this skill whenever you:
- plan a new feature or change existing behavior
- touch architecture, data models, or cross-module changes
- face unclear requirements
- debug issues and need root-cause analysis
- consider refactoring, restructuring, or introducing new dependencies
- implement anything that can affect production stability

---

## 1) Plan Before Implementation (mandatory)

### Rule
Create a plan and get approval **before** writing code.

### Process
1. Understand current architecture
2. Identify files to be modified
3. Search for similar existing implementations
4. Search for existing libraries if applicable
5. Think through architectural implications
6. Consider edge cases
7. Identify best approach
8. Write a clear step-by-step plan
9. Get approval, then implement

### Requirement
If unclear, ask clarifying questions. **Do not assume.**

### Violation
- ❌ Jumping directly to implementation
- ❌ Making assumptions
- ❌ Skipping architecture review

---

## 2) Strict Agent Permissions & Protocol (non-negotiable)

### Must NOT do without explicit user approval
- Modify or create `.env` files / environment variables
- Run migrations or any DB-altering commands (e.g., `db:migrate`)
- Install/update dependencies (`package.json`, lockfiles)
- Touch production configurations/environments unless the task is explicitly deployment-related

### Violation
- ❌ Running destructive CLI commands
- ❌ Mutating environment state silently

---

## 3) Avoid Large Refactors Unless Instructed

### Rule
Do not perform large-scale refactors unless explicitly requested.

### Why
Unasked refactors can introduce unexpected changes and break existing functionality.

### Violation
- ❌ Restructuring project layout
- ❌ Reorganizing file structure
- ❌ Major API changes without request

---

## 4) Documentation & Communication

### 4.1 Clarify Ambiguous Tasks
**Rule:** Ask follow-up questions when requirements are unclear.

**Process:**
1. Identify unclear aspects
2. Ask focused questions
3. Get clarity before proceeding
4. Document assumptions (only after confirmation)

**Violation:**  
- ❌ Implementing wrong solution due to assumptions

### 4.2 No Dummy Implementations
**Rule:** Deliver complete, production-ready solutions.

**Requirement:**  
Never provide placeholder/skeleton code with "this is how it would look."

**Violation:**  
- ❌ Skeleton-only code
- ❌ Incomplete implementations
- ❌ Mock versions when production-ready is required

### 4.3 Break Down Large Tasks
**Rule:** Decompose large/vague tasks into smaller subtasks.

**Process:**
1. Analyze scope
2. Identify logical subtasks
3. Sequence them
4. Present breakdown
5. Get approval on approach

**Benefit:** reduces risk, enables milestones, better progress tracking.

---

## 5) Best Practices & Principles

### 5.1 Root Cause Analysis
**Rule:** Fix root causes, not symptoms.

**Process:**
1. Identify issue
2. Investigate underlying cause
3. Understand why it happens
4. Fix the root cause

**Violation:**  
- ❌ Random solutions without diagnosis
- ❌ Vague excuses instead of RCA

### 5.2 Read-First Approach
**Rule:** Understand existing code before modifying.

**Why:**
- prevents breaking functionality
- maintains codebase style
- identifies reusable blocks
- preserves architectural alignment

**Pattern:** Always read full context before editing any file.

**Violation:**  
- ❌ Blind edits without understanding

### 5.3 Handle Edge Cases (mandatory)
**Rule:** Anticipate and handle failures, concurrency issues, invalid states.

**Examples:**
- DB timeouts/deadlocks
- race conditions (inventory/payment)
- external API downtime/rate limits
- malformed payloads / large uploads
- token expiration during long-running work

**Patterns:**
- DB transactions for atomicity
- retries with exponential backoff for external calls
- validate all inputs (headers/body/query)
- correct 4xx vs 5xx status codes

**Violation:**  
- ❌ Happy-path-only implementations
- ❌ Crashing on DB errors
- ❌ Ignoring race conditions

---

## Completion Checklist (before you say “done”)
- [ ] Plan written and approved (if code changes are needed)
- [ ] No env/migration/dependency changes were made without explicit approval
- [ ] Changes are scoped (no unrequested refactor)
- [ ] Requirements clarified (no assumptions)
- [ ] Implementation is complete (no placeholders)
- [ ] Edge cases handled + correct status codes
- [ ] Root cause addressed (if debugging)
- [ ] Full context was reviewed before edits
