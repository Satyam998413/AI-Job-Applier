---
name: backend-file-structure
description: Use when creating new modules, organizing project files, or setting up Node.js/Express backends. Enforces the repo folder layout, module architecture, naming conventions, routing strategy, and process stability requirements.
---

# Backend File Structure & Architecture (Skill)

## When to use this skill
Use this skill when you are:
- Creating a **new module** under `modules/`
- Adding new controllers/services/models/routes
- Refactoring folders or moving files
- Setting up a new Node.js backend repo using this stack
- Registering routes in `routes/` and module routers
- Adding server startup and reliability behaviors (`bin/www`, graceful shutdown, crash handling)

---

## Golden Rule
Follow the **Vertical Slice / Module-first** structure:
- Each feature lives inside `modules/[moduleName]/`
- Controllers are thin (HTTP only)
- Services contain business logic
- Models define DB mapping and associations
- Validation lives in `joiSchema.js`
- Module constants and attribute projections live in `constant.js`

---

## Multi-Entity Feature Implementation Example

When implementing a feature with multiple related database entities, **each table gets its own module**.

### 🗂️ Module Creation Rule

> ⚠️ **EXAMPLE ONLY** - The tables below illustrate naming conventions. **DO NOT** create these modules unless they exist in the current feature's `database_design.md`:

| Database Table | Module Name | Convention |
|----------------|-------------|------------|
| `communities` | `community` | Singular noun, camelCase |
| `community_members` | `communityMember` | Singular noun, camelCase, compound |
| `posts` | `post` | Singular noun, camelCase |
| `post_tags` | `postTag` | Junction table as compound noun |
| `post_likes` | `postLike` | Junction table as compound noun |

### 📁 Resulting Structure

> ⚠️ **EXAMPLE ONLY** - This shows structure for a hypothetical "Community" feature. Create modules based on **your** feature's actual tables:

```
modules/
├── community/          ← Core community management (communities table)
│   ├── model.js
│   ├── controller.js
│   ├── service.js
│   ├── joiSchema.js
│   ├── constant.js
│   └── routers/
│       ├── index.js
│       └── admin.js
├── communityMember/    ← Membership tracking (community_members table)
│   ├── model.js
│   ├── service.js
│   └── ...
├── post/               ← Posts (posts table)
│   └── ...
├── comment/            ← Comments (comments table)
│   └── ...
└── [yourModule]/       ← Your actual module from database_design.md
    └── ...
```

### 🔗 Cross-Module Relationships

> ⚠️ **EXAMPLE ONLY** - Replace with actual module names from your feature:

```js
// modules/[yourModule]/model.js
import RelatedModule from '../[relatedModule]/model.js';
import User from '../user/model.js';

YourModel.belongsTo(RelatedModule, { foreignKey: 'relatedId' });
YourModel.belongsTo(User, { foreignKey: 'userId' });
```

```js
// modules/[yourModule]/service.js
import RelatedModel from '../[otherModule]/model.js';

export const yourFunction = async (data) => {
  // Validate related record exists
  const related = await RelatedModel.findByPk(data.relatedId);
  if (!related) throw new Error('Related record not found');
  // ...
};
```

### 📝 Router Registration

> ⚠️ **EXAMPLE ONLY** - Replace with actual module names from your feature:

```js
// routes/v1/index.js
import * as yourModuleRoutes from '../../modules/[yourModule]/routers/index.js';

router.use('/your-endpoint', yourModuleRoutes.default);
```

### 🔄 Implementation Order

1. **Independent modules first** (no foreign key dependencies)
2. **Dependent modules second** (entities with FKs to already-implemented modules)
3. **Junction tables last** (depends on two+ modules)

> ⚠️ **EXAMPLE ONLY** - This is an example order. Determine your own based on actual foreign key relationships in `database_design.md`:
> ```
> 1. community (independent)
> 2. tag (depends on community)
> 3. communityMember (depends on community)
> 4. post (depends on community)
> 5. comment (depends on post)
> 6. postTag (depends on post, tag) - junction table
> 7. postLike (depends on post) - junction table
> 8. report (depends on post, comment)
> ```

🚫 **Never** cram multiple entities into a single module folder.

---

## Standard Project Tree (reference)
```txt
project-root/
├── bin/
│   └── www
├── configs/
├── constants/
├── middlewares/
├── migrations/
├── modules/
│   └── [moduleName]/
│       ├── model.js
│       ├── controller.js
│       ├── service.js
│       ├── joiSchema.js
│       ├── constant.js
│       └── routers/
│           ├── index.js
│           └── admin.js
├── public/
├── routes/
│   ├── index.js
│   └── v1/
│       ├── index.js
│       └── admin.js
├── scripts/
├── seeders/
├── services/
├── utils/
├── uploads/
├── app.js
└── README.md
```

---

## Folder Responsibilities (non-negotiables)

### `bin/www`
- **Only** server bootstrapping: create server, set port, handle server-level errors, call `listen()`.
- **Never** place application logic here.

### `app.js`
- Express app factory: middleware setup, mount router, global error handler.
- **Do not** start the server in `app.js` (that belongs in `bin/www`).

### `configs/`
- One file per external dependency (DB/AWS/Redis/Firebase/etc.).
- **Never** hardcode secrets; use `process.env`.

### `modules/[moduleName]/`
Each module must contain:
- `model.js`: Sequelize schema + associations
- `controller.js`: HTTP handlers only, no business logic
- `service.js`: business logic + DB interactions; returns data (not res)
- `joiSchema.js`: Joi validations for body/query/params
- `constant.js`: module constants, response messages, attribute projections
- `routers/index.js`: authenticated user routes
- `routers/admin.js`: authenticated admin routes

### `routes/`
- Top-level API versioning and mounting:
  - `routes/index.js` mounts global routers
  - `routes/v1/index.js` mounts v1 module routers
  - `routes/v1/admin.js` mounts admin routers
- Module routers define the actual endpoints; `routes/` just registers them.

### `middlewares/`
- Single-responsibility middleware only (auth, validation, rate limiting, file upload, etc.).
- Always `next()` or return a response.

### `utils/`
- Stateless helpers; avoid business logic.
- `sequelizeService.js` lives here for standardized CRUD.

### `seeders/`
- **Required**: When creating a new model/module, add a corresponding seeder with dummy data.

### `uploads/`
- Local storage only (if not S3). Must be git-ignored.

---

## Controller Non-Negotiables (MANDATORY)

### Message Constants Rule
**MUST** import and use message constants from `./constant.js` for ALL API responses.
**MUST NOT** hardcode any string messages in controllers.

```javascript
// CORRECT ✅
import { categoryMessages } from "./constant.js";

res.status(201).json({
  status: "success",
  message: categoryMessages.categoryCreated,
});

// WRONG ❌
res.status(201).json({
  status: "success",
  message: "Category created successfully",  // Hardcoded!
});
```

### Pattern Verification Checklist
- [ ] All success response messages use constants
- [ ] All error response messages use constants
- [ ] constant.js exports a `[module]Messages` object
- [ ] Controller imports messages from `./constant.js`

---

## Service Layer Non-Negotiables (MANDATORY)

### SequelizeService Rule
**MUST** use `utils/sequelizeService.js` functions for ALL database operations.
**MUST NOT** use direct model queries (`Model.findByPk`, `Model.findOne`, etc.).
**MUST** import `MODEL_NAME` from `./constant.js`.

```javascript
// CORRECT ✅
import * as SequelizeService from "../../utils/sequelizeService.js";
import { MODEL_NAME } from "./constant.js";

const user = await SequelizeService.findOne(MODEL_NAME, { where: { id } });
const users = await SequelizeService.findAndCountAll(MODEL_NAME, queryOptions);
const newRecord = await SequelizeService.create(MODEL_NAME, data);
await SequelizeService.update(MODEL_NAME, data, { where: { id } });
await SequelizeService.remove(MODEL_NAME, { where: { id } });

// WRONG ❌
const user = await User.findByPk(id);              // Direct model query!
const user = await User.findOne({ where: { id } }); // Direct model query!
const users = await User.findAll();                 // Direct model query!
const newUser = await User.create(data);            // Direct model query!
await user.update(data);                            // Direct model query!
await user.destroy();                               // Direct model query!
```

### SequelizeService Available Functions
- `create(modelName, data, options)`
- `bulkCreate(modelName, data, options)`
- `findOne(modelName, query, options)`
- `findAll(modelName, query, options)`
- `findAndCountAll(modelName, query, options)`
- `count(modelName, query, options)`
- `update(modelName, data, query, options)`
- `remove(modelName, query, options)`

### Pattern Verification Checklist
- [ ] Service imports `* as SequelizeService`
- [ ] Service imports `MODEL_NAME` from `./constant.js`
- [ ] All DB operations use SequelizeService functions
- [ ] No direct Model.method() calls in service files
- [ ] Query options (where, include, etc.) passed as parameters

---

## Reference Module Pattern

Before implementing a new module, **MUST** examine an existing module (e.g., `modules/user/`) and match its exact patterns for:
- Import statements
- Function signatures
- Error handling
- Response formatting
- SequelizeService usage

---

## Naming Conventions
- Use consistent suffixes:
  - `controller.js`, `service.js`, `model.js`, `joiSchema.js`, `constant.js`
- In module routers, export routes via `index.js` and `admin.js` only.

---

## Process Stability & Reliability (mandatory)
- Handle:
  - `uncaughtException`
  - `unhandledRejection`
- Implement graceful shutdown for:
  - `SIGTERM`
  - `SIGINT`
  - Steps: stop accepting requests → close DB/Redis → exit (timeout e.g. 10s)
- Use a process manager (PM2) in production for restarts/clustering.

---

## PR Checklist (structure changes)
- [ ] New module placed under `modules/[moduleName]/`
- [ ] Routes registered in `routes/v1/*` and module routers
- [ ] Controller is thin; logic in service
- [ ] Validation exists in `joiSchema.js` and is wired via middleware
- [ ] Seeder added for new model/module
- [ ] Migration added for schema changes
- [ ] No secrets committed (`.env` never committed)
- [ ] Crash + shutdown handling present (`bin/www`)

---

