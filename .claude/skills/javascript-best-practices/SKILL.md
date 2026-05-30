---
name: javascript-best-practices
description: Use when writing or refactoring JavaScript/Node.js backend code (Express controllers/services, utilities, async flows). Enforces naming, ES6+ module style, error handling, performance patterns, logging, and code quality standards.
---

# JavaScript Best Practices (Skill)

## When to use this skill
Use this skill whenever you:
- Write or refactor JS/Node.js code (controllers, services, utils)
- Add new functions, async flows, or error handling
- Optimize performance (loops, async concurrency)
- Decide naming conventions, file names, module boundaries
- Add logging or documentation (JSDoc)

---

# JavaScript Best Practices

## Naming Conventions

| Type | Rule | ✅ Good | ❌ Bad |
|------|------|---------|--------|
| Variables | `camelCase` | `firstName`, `userEmail` | `first_name`, `FirstName` |
| Functions | `camelCase` + verb prefix | `getUserData()`, `validateEmail()` | `userData()`, `check()` |
| Constants | `UPPER_CASE` | `MAX_RETRY_COUNT`, `API_BASE_URL` | `maxRetryCount` |
| Booleans | `is/has/can/should` prefix | `isActive`, `hasPermission` | `active`, `permission` |
| Files | `camelCase.js` | `publicRoutes.js` | `user-profile.js` |
| Private | `_` prefix or `#` field | `_cache`, `#privateField` | exposing internals |

**Verb Prefixes**: `get`→retrieve, `set`→assign, `is/has`→boolean, `calculate`→compute, `validate`→check, `fetch`→server, `handle`→events

---

## Code Organization

- **One responsibility per file** — export single purpose or related utilities
- **ES6 modules only** — use `import`/`export`, set `"type": "module"` in package.json
- **No globals** — encapsulate in modules; ❌ `global.myVar`, `var x` at root

```js
import { getUser } from './services/userService.js';
export const processLog = (log) => { /* ... */ };
```

---

## Variables

| Rule | Pattern |
|------|---------|
| Use `const` default, `let` if reassign, never `var` | `const x = 3; let y = 0;` |
| Initialize at declaration | `let data = null;` not `let data;` |
| Block scope in loops/conditionals | `for (let i = 0; ...)` |
| Short names for counters, descriptive for logic | `i`, `j` OK; ❌ `x`, `temp`, `data1` |

---

## Functions

**Named declarations** for controllers/services (stack traces, hoisting); **arrow functions** for callbacks/iterators.

```js
export async function getUserProfile(id) { /* service */ }
const sum = (a, b) => a + b;  // utility
users.map(u => u.id);         // callback
```

| Rule | Pattern |
|------|---------|
| Max 3 params; use object for more | `({ name, email, role }) => {}` |
| Default params | `(attempts = 3) => {}` not `if (!attempts)` |
| Early returns for errors | `if (!data) return false;` |
| Pure functions (no side effects) | Don't mutate params or global state |

---

## Error Handling

```js
try {
  const data = await fetchUser(id);
  return process(data);
} catch (error) {
  logger.error('Fetch failed', { id, error: error.message });
  throw new ApiError(500, `Failed: ${error.message}`);
}
```

| Rule | Requirement |
|------|-------------|
| Always catch async errors | Never swallow: ❌ `catch (e) {}` |
| Throw `Error` instances only | ❌ `throw 'error'`, `throw 500` |
| Custom error classes | `class ValidationError extends Error` |
| Global error middleware | Standardized JSON: `{ status, message, stack? }` |
| Defensive access | `user?.profile?.name ?? 'Guest'` |

---

## Performance

```js
// ✅ Array methods over loops
const active = users.filter(u => u.isActive).map(u => u.name);

// ✅ async/await over .then() chains
const user = await fetchUser(id);

// ✅ Promise.all for parallel; for...of for sequential
const [a, b] = await Promise.all([fetchA(), fetchB()]);
for (const t of tasks) { await step(t); }
```

| Rule | Avoid |
|------|-------|
| No nested loops | ❌ O(n²) iterations |
| Use `.map()/.filter()/.reduce()` | ❌ manual `for` loops |
| Parallel independent tasks | ❌ sequential `await` for independent calls |

---

## Code Quality

| Principle | Implementation |
|-----------|----------------|
| **DRY** | Extract common logic: `validateEmail(e)` reused |
| **No magic values** | `const MAX_RETRIES = 3;` not `i < 3` |
| **Complexity limits** | Max 40 lines, 3 nesting levels per function |
| **Read files fully** | Review before editing to avoid duplication |
| **Lint after changes** | Catch errors early, validate style |

---

## Documentation (JSDoc)

```js
/**
 * Fetches user by ID
 * @param {string} userId
 * @param {{ timeout?: number }} options
 * @returns {Promise<User>}
 * @throws {Error} If not found
 */
async function getUser(userId, options = {}) { /* ... */ }

/** @typedef {{ id: number, name: string, email: string }} User */
```

---

## ES6+ Standards

| Feature | ✅ Use | ❌ Avoid |
|---------|--------|---------|
| Template literals | `` `Hello, ${name}!` `` | `'Hello, ' + name` |
| Destructuring | `const { name, email } = user` | `const name = user.name` |
| Spread | `{ ...user, email: 'new' }` | `user.email = 'new'` |
| Optional chaining | `user?.role?.name ?? 'Guest'` | `user.role.name` |
| Strict equality | `===`, `!==` | `==`, `!=` |
| Map/Set | `new Map()`, `new Set()` | objects for dynamic keys |
| Simple ternary | `isActive ? 'Yes' : 'No'` | nested ternaries |

---

## Logging & Libraries

**Structured logging** — Use Winston/Morgan, not `console.log`. Include `x-request-id` for tracing.
```js
logger.error('Failed', { requestId: req.id, error: err.message });
```

**External libraries** — Verify latest syntax via `context7` MCP or official docs before use. Don't suggest alternatives if user specified a library.

---

## Additional Standards

- **Defense in Depth**: Joi validation at edge + DB constraints (FK, NOT NULL, CHECK)
- **Date Format**: ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`) in all API responses



