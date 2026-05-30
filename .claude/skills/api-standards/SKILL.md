---
name: api-standards
description: Use when designing/implementing API endpoints (Express), deciding HTTP status codes, implementing /health & /ready checks, adding field selection, bulk endpoints, or building list endpoints using sqquery + SequelizeService.
---


# API Standards & Patterns (Skill)

## When to use this skill
Use this skill whenever you:
- create/update REST endpoints
- decide response status codes
- implement health/readiness endpoints
- build list endpoints (`getAll`, `findAndCountAll`)
- need filtering/sorting/search/date-range support
- implement field selection (`?fields=...`)
- design bulk operations (`/bulk` endpoints)

## Health & Readiness Checks

- **Rule**: Every project **MUST** include both `/health` and `/ready` endpoints.
- **Liveness (`/health`)**:
  - **Purpose**: Verifies if the process is alive.
  - **Requirement**: Returns `200 OK` immediately if the server is running.
- **Readiness (`/ready`)**:
  - **Purpose**: Verifies if the system is ready to handle traffic.
  - **Requirement**: Must verify critical dependencies:
    - Database connection status.
    - Redis connection (if used).
    - Message queue connectivity (if used).
  - **Behavior**: Returns `200 OK` only if ALL critical dependencies are healthy. If any dependency is degraded, return `503 Service Unavailable`.
- **Purpose**: Enables automated monitoring and robust liveness/readiness orchestration in containerized environments (AWS ECS, Kubernetes).

---

## Advanced API Patterns

- **Field Selection**: Support `?fields=id,name` to allow clients to request only the data they need, reducing bandwidth and improving database performance (use the utility to select only these columns in the DB query).
- **Bulk Operations**: When processing multiple resources, use dedicated bulk endpoints (e.g., `POST /users/bulk`) and database `bulkCreate`/`bulkUpdate` methods instead of looping individual API calls.

---

## Standard Status Codes

- **Rule**: Use these status codes consistently across all modules:

| Code    | Usage             | Example                                                  |
| ------- | ----------------- | -------------------------------------------------------- |
| **200** | Success           | Standard response for GET, PUT, PATCH                    |
| **201** | Created           | Successful POST (resource creation)                      |
| **204** | No Content        | Successful DELETE (no body returned)                     |
| **400** | Bad Request       | Validation errors, malformed input                       |
| **401** | Unauthorized      | Missing or invalid auth token                            |
| **403** | Forbidden         | Valid token but insufficient permissions                 |
| **404** | Not Found         | Resource does not exist                                  |
| **409** | Conflict          | Duplicate resource (e.g., email already exists)          |
| **422** | Unprocessable     | Validation or semantic errors (standard for modern APIs) |
| **429** | Too Many Requests | Rate limit exceeded                                      |
| **500** | Internal Error    | Unexpected server failures                               |

---

## Joi Validation with Custom Error Messages

### Rule

Always provide **user-friendly custom error messages** in Joi schemas. Do not rely on Joi's default error messages which are technical and not user-friendly.

###  Field-Level Custom Messages (Recommended)

Use the `.messages()` method on each field for granular control:

```javascript
export const createCategory = Joi.object().keys({
  name: Joi.string().min(1).max(100).required()
    .messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least {#limit} character(s)',
      'string.max': 'Name cannot exceed {#limit} characters',
      'any.required': 'Name is required'
    }),
  description: Joi.string().max(500).optional()
    .messages({
      'string.max': 'Description cannot exceed {#limit} characters'
    }),
  iconUrl: Joi.string().uri().max(500).optional()
    .messages({
      'string.uri': 'Icon URL must be a valid URL',
      'string.max': 'Icon URL cannot exceed {#limit} characters'
    })
});
```


---

## Custom Query Generator (`sqquery`)

We use a custom utility `utils/query.js` to standardize and automate database querying. This utility handles pagination, sorting, filtering, searching, and date ranges automatically.

### Rule

**ALWAYS** use the `sqquery` utility for retrieving lists of data (`getAll` endpoints) to ensure consistent API behavior.

### Usage Pattern

```javascript
import { sqquery } from "../../utils/query.js";
import * as SequelizeService from "../../utils/sequelizeService.js";

// Controller example:
export async function getAll(req, res, next) {
  // Usage: GET /users?page=1&limit=50&search=john&startDate=2023-01-01&status=active
  const queryOptions = sqquery(
    req.query, // 1. Request query params
    { role: "User" }, // 2. Default/Hardcoded filters
    ["name", "email"] // 3. Searchable columns (for ?search=term)
  );

  const data = await SequelizeService.findAndCountAll("User", queryOptions);
  res.send({ status: "success", data });
}
```

### Key Features & Params

1. **Pagination**:
   - `page`: Current page (default: 1).
   - `limit`: Records per page (default: 100).
2. **Sorting**:
   - `sort`: Column to sort by (default: `createdAt`).
   - `sortBy`: Order `ASC` or `DESC` (default: `DESC`).
3. **Date Filtering**:
   - `startDate` & `endDate`: Automatically filters records by `createdAt` range.
   - Logic: `createdAt >= startDate` AND `createdAt < endDate + 1 day` (inclusive of start, covers end date).
4. **Advanced Filtering (Operators)**:
   - Pass conditions like `price[gt]=100` or `status[ne]=inactive`.
   - Supported Operators:
     - `gt` (>), `gte` (>=), `lt` (<), `lte` (<=)
     - `eq` (=), `ne` (!=)
     - `between`, `notBetween`, `in`, `notIn`
5. **Search**:
   - `search`: Keyword for `LIKE` query (`%term%`) on columns defined in the 3rd argument.
6. **Auto-Cleanup**:
   - The utility automatically removes special params (`page`, `limit`, `sort`, `search`, `startDate`, etc.) from the filter object, so you can pass `req.query` directly.


## Completion Checklist (API work)
- [ ] `/health` returns 200 immediately (no dependency checks)
- [ ] `/ready` checks DB/Redis/Queue and returns 200 or 503 accordingly
- [ ] Correct HTTP status codes used consistently
- [ ] List endpoints use `sqquery` + `SequelizeService.findAndCountAll`
- [ ] Support `?fields=` where it improves performance
- [ ] Use `/bulk` endpoints + DB bulk ops for multi-resource processing
