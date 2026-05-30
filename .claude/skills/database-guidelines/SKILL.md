---
name: database-guidelines
description: Use when working with DB models, migrations, Postgres performance, raw queries, or SequelizeService. Covers schema management, transactions, indexing/optimization, SQL injection prevention, attribute selection, pagination, caching, and standardized CRUD via SequelizeService.
---

# Database Guidelines (Skill)

## When to use this skill
Use this skill when you are:
- Creating/updating Sequelize models or DB schema
- Writing migrations
- Optimizing Postgres/Sequelize queries
- Handling transactions
- Writing any raw SQL (`sequelize.query`)
- Implementing or refactoring CRUD using `SequelizeService`

---

## 1) Schema Management

### New Tables vs Existing Tables

| Scenario | Migration Required? | Approach |
|----------|---------------------|----------|
| **New Table** (no migration exists) | ❌ No | Use `sequelize.sync()` to create table |
| **Existing Table** (migration exists) | ✅ Yes | Create timestamped migration |

#### New Tables (No migration required)
For brand new tables that don't exist in any environment:
- Create the model file in `modules/[module]/model.js`
- Add `Model.sync()` in the model file to auto-create the table
- No migration file needed
- Still create a seeder for test data

**Example:**
```js
// In modules/category/model.js
const Category = sequelize.define("Category", { ... });

// Auto-create table for new models
Category.sync();

export default Category;
```

#### Existing Tables (Migration required)
For any changes to existing tables (adding columns, indexes, constraints):
- Always use migrations for schema changes
- Run migrations via: `npx sequelize-cli db:migrate`

### Violation
- ❌ Creating migration for a brand new table (use sync instead)
- ❌ Modifying DB directly
- ❌ Editing `model.js` for schema changes on existing tables without a migration

---

## 2) Data Integrity

### Rule
- Use **transactions** for multi-step writes.

### Pattern
- `await sequelize.transaction(async (t) => { ... })`

### Violation
- ❌ Partial updates leaving DB inconsistent

---

## 3) Performance & Optimization

### Rules
- Index foreign keys
- **Covering indexes**: Use **composite indexes** for columns frequently queried together
- Avoid N+1 queries (use eager loading)
- Use connection pooling
- **Least privilege**: runtime DB user should only have minimum permissions (SELECT/INSERT/UPDATE/DELETE). Avoid DROP/ALTER/TRUNCATE for runtime user.
- Select specific attributes (only the columns required)
- Use pagination for list endpoints


### Patterns
- Indexing in migrations:
  - `table.index(['user_id'])`
- Eager loading:
  - `Model.findAll({ include: [...] })`

### Violations
- ❌ Missing indexes on foreign keys
- ❌ Looping DB calls (N+1)
- ❌ Fetching unnecessary columns/rows
- ❌ Ignoring query performance
- ❌ No pagination on list endpoints

---

## 4) Raw Queries & SQL Injection Prevention

### Rule
- Avoid raw SQL where possible (prefer ORM/Query Builder)
- If raw SQL is required, **ALWAYS** use parameter binding / replacements

### Pattern (Sequelize)
```js
// Use replacements for security
const results = await sequelize.query(
  "SELECT * FROM users WHERE status = :status",
  {
    replacements: { status: "active" },
    type: QueryTypes.SELECT,
  }
);
```

### Violation
- ❌ Template literal interpolation in SQL strings:
  - `SELECT * FROM users WHERE status = '${status}'`

---

## 5) ORM Selection (findAll / reads)

### Rule
- For `findAll` (and any read operation), **ALWAYS** use `attributes` to select only required columns.

### Requirement
- Do not fetch entire rows if only 2–3 fields are needed (memory + performance).

### Pattern
```js
const users = await User.findAll({
  attributes: ["id", "name", "email"],
  where: { isActive: true },
  // Use modular constants for common attribute sets
});
```

### Violation
- ❌ `User.findAll()` without `attributes`

---

## 6) Centralized Database Service (SequelizeService) - MANDATORY

We use a centralized `utils/sequelizeService.js` for common CRUD operations to:
- reduce redundancy across modules
- standardize DB interactions
- enable caching and monitoring hooks

### Rule - NON-NEGOTIABLE
- **MUST** use `SequelizeService` for ALL database operations in service files
- **MUST NOT** use direct Sequelize model methods (`Model.findByPk`, `Model.findOne`, `Model.findAll`, `Model.create`, `Model.update`, `Model.destroy`)
- **MUST** import `MODEL_NAME` from `./constant.js` (not hardcoded strings)

### Usage Pattern - CORRECT ✅
```js
import * as SequelizeService from "../../utils/sequelizeService.js";
import { MODEL_NAME } from "./constant.js";

export const findOne = async (id) => {
  return SequelizeService.findOne(MODEL_NAME, { where: { id } });
};

export const findAll = async (query) => {
  return SequelizeService.findAndCountAll(MODEL_NAME, query);
};

export const create = async (data) => {
  return SequelizeService.create(MODEL_NAME, data);
};

export const update = async (id, data) => {
  return SequelizeService.update(MODEL_NAME, data, { where: { id } });
};

export const remove = async (id) => {
  return SequelizeService.remove(MODEL_NAME, { where: { id } });
};
```

### Anti-Patterns - WRONG ❌
```js
// WRONG: Direct model query
const user = await User.findByPk(id);

// WRONG: Direct model query
const user = await User.findOne({ where: { id } });

// WRONG: Direct model query
const users = await User.findAll({ where: { status: "active" } });

// WRONG: Direct model create
const newUser = await User.create(data);

// WRONG: Direct model update
await user.update(data);

// WRONG: Direct model delete
await user.destroy();

// WRONG: Hardcoded model name
const user = await SequelizeService.findOne("User", { where: { id } });
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

### Verification Checklist
- [ ] Service imports `* as SequelizeService` from `"../../utils/sequelizeService.js"`
- [ ] Service imports `MODEL_NAME` from `./constant.js`
- [ ] No direct `Model.method()` calls anywhere in service files
- [ ] All query options (where, include, attributes, etc.) passed through SequelizeService
- [ ] For complex queries with includes, pass the full options object:
  ```js
  SequelizeService.findOne(MODEL_NAME, {
    where: { id },
    include: [{ model: OtherModel, as: "other" }],
    paranoid: false, // if needed
  });
  ```

---

## 7) Model Associations

### Rule
- **ALWAYS** define associations within the model file
- **NEVER** create separate association files (e.g., `config/associations.js`)
- Import related models directly and define associations inline

### Pattern (Example from notification/model.js)
```js
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

// Import related models directly
import User from "../user/model.js";

const Notification = sequelize.define("Notification", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // ... other fields
});

// Define associations inline within the same file
User.hasMany(Notification, {
  foreignKey: {
    name: "UserId",
    allowNull: false,
  },
  onDelete: "CASCADE",
});

Notification.belongsTo(User, {
  foreignKey: {
    name: "UserId",
    allowNull: false,
  },
});

Notification.sync();
export default Notification;
```

### Key Points
- Import the related model at the top: `import User from "../user/model.js"`
- Define `hasMany` on the parent model (User)
- Define `belongsTo` on the child model (Notification)
- Set `foreignKey` with `allowNull` constraint
- Use `onDelete: "CASCADE"` or `onDelete: "RESTRICT"` as appropriate

### Violation
- ❌ Creating separate `config/associations.js` file
- ❌ Defining associations in `app.js` or other entry points
- ❌ Using `Model.associate = (models) => {}` pattern instead of inline
- ❌ Not defining associations at all

---

## 8) Complete New Model Template

Use this exact template when creating a new model:

```js
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

// Import related models if associations exist
// import User from "../user/model.js";

const ModelName = sequelize.define(
  "ModelName",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // Add your fields here
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    // created_at, updated_at, deleted_at are auto-managed by Sequelize
  },
  {
    paranoid: true, // Enables soft delete
    indexes: [
      // Add indexes here
      { name: "idx_modelname_status", fields: ["status"] },
    ],
  }
);

// Define associations inline (if any)
// Example:
// User.hasMany(ModelName, { foreignKey: { name: "UserId", allowNull: false } });
// ModelName.belongsTo(User, { foreignKey: { name: "UserId", allowNull: false } });

// REQUIRED: Sync for new tables (auto-creates table, no migration needed)
ModelName.sync();

export default ModelName;
```

---

## Quick checklist before finishing DB work
- [ ] **New tables**: Use `Model.sync()` in model file (no migration needed)
- [ ] **Existing tables**: Schema changes done via migration (not direct DB changes)
- [ ] **Associations**: Defined within model file (no separate association files)
- [ ] Multi-step writes wrapped in a transaction
- [ ] FK indexes added (and composite indexes where needed)
- [ ] No N+1 (use eager loading)
- [ ] Reads use `attributes` (no full-row fetch by default)
- [ ] List endpoints use pagination
- [ ] Raw SQL (if any) uses replacements/binding (no interpolation)
- [ ] Prefer SequelizeService for basic CRUD
