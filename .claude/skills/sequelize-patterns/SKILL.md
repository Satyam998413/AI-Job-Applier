---
name: sequelize-patterns
description: Use when implementing Sequelize models, associations, queries, and database patterns. Provides copy-paste templates for new models, associations, common queries, and anti-patterns to avoid.
---

# Sequelize Patterns (Skill)

## When to use this skill
Use this skill when you are:
- Creating a new Sequelize model from scratch
- Defining model associations (relationships)
- Writing complex queries with filters, search, pagination
- Implementing soft delete patterns
- Working with transactions

---

## 1) New Model Template

Copy and use this exact template when creating a new model:

```javascript
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
    // Add your custom fields here
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    // NOTE: created_at, updated_at, deleted_at are auto-managed by Sequelize
  },
  {
    paranoid: true, // Enables soft delete via deleted_at
    indexes: [
      {
        name: "idx_modelname_status",
        fields: ["status"],
      },
    ],
  }
);

// Define associations inline (if any exist)
// Example:
// User.hasMany(ModelName, { foreignKey: { name: "UserId", allowNull: false } });
// ModelName.belongsTo(User, { foreignKey: { name: "UserId", allowNull: false } });

// REQUIRED: Auto-create table for new models (no migration needed)
ModelName.sync();

export default ModelName;
```

---

## 2) Association Patterns (Reference: notification/model.js)

### One-to-Many (User has many Notifications)

**Pattern:** Import related models directly and define associations inline.

```javascript
// In modules/notification/model.js
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

// 1. Import the related model directly
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
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // ... other fields
});

// 2. Define associations inline within the same file
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
- Import related model at the top: `import User from "../user/model.js"`
- Define `hasMany` on the parent model (User)
- Define `belongsTo` on the child model (Notification)
- Use `foreignKey: { name: "UserId", allowNull: false }` format
- Set `onDelete: "CASCADE"` or `onDelete: "RESTRICT"` as needed

### Usage in Queries

```javascript
// Get user with all notifications
const user = await User.findOne({
  where: { id: userId },
  include: [{
    model: Notification,
    as: "Notifications", // Sequelize pluralizes by default
  }],
});

// Get notification with its user
const notification = await Notification.findOne({
  where: { id: notificationId },
  include: [{
    model: User,
    as: "User",
  }],
});
```

---

## 3) Query Patterns

### Basic CRUD with SequelizeService

```javascript
import * as SequelizeService from "../../utils/sequelizeService.js";

const MODEL_NAME = "Product";

// Create
const product = await SequelizeService.create(MODEL_NAME, {
  name: "Product Name",
  price: 99.99,
});

// Find one
const product = await SequelizeService.findOne(MODEL_NAME, {
  where: { id: productId },
});

// Find all with pagination
const products = await SequelizeService.findAndCountAll(MODEL_NAME, {
  where: { status: "active" },
  limit: 20,
  offset: 0,
  order: [["createdAt", "DESC"]],
});

// Update
await SequelizeService.update(
  MODEL_NAME,
  { name: "New Name", price: 199.99 },
  { where: { id: productId } }
);

// Soft delete (paranoid mode)
await SequelizeService.remove(MODEL_NAME, {
  where: { id: productId },
});
```

### Search and Filter Pattern

```javascript
import sequelize from "../../config/db.js";

const buildQuery = (queryParams) => {
  const { Op } = sequelize.Sequelize;
  const whereClause = {
    status: "active",
  };

  // Search by name or description
  if (queryParams.search) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${queryParams.search}%` } },
      { description: { [Op.like]: `%${queryParams.search}%` } },
    ];
  }

  // Filter by category
  if (queryParams.categoryId) {
    whereClause.categoryId = queryParams.categoryId;
  }

  // Filter by price range
  if (queryParams.minPrice || queryParams.maxPrice) {
    whereClause.price = {};
    if (queryParams.minPrice) {
      whereClause.price[Op.gte] = parseFloat(queryParams.minPrice);
    }
    if (queryParams.maxPrice) {
      whereClause.price[Op.lte] = parseFloat(queryParams.maxPrice);
    }
  }

  return whereClause;
};

// Usage
const where = buildQuery({ search: "phone", categoryId: "uuid", minPrice: 100 });
const products = await SequelizeService.findAndCountAll("Product", { where });
```

---

## 4) Common Anti-Patterns to Avoid

### ❌ Wrong: Missing Model.sync()
```javascript
// BAD - Table won't be auto-created
const Category = sequelize.define("Category", { ... });
export default Category;
```

### ✅ Correct: Include Model.sync()
```javascript
// GOOD - Table auto-created for new models
const Category = sequelize.define("Category", { ... });
Category.sync();
export default Category;
```

---

### ❌ Wrong: Separate Associations File
```javascript
// BAD - config/associations.js
import Category from "../modules/category/model.js";
import Product from "../modules/product/model.js";

Category.hasMany(Product);
Product.belongsTo(Category);
```

### ✅ Correct: Associations Inline in Model File
```javascript
// GOOD - In modules/notification/model.js
import User from "../user/model.js";

const Notification = sequelize.define("Notification", { ... });

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

---

### ❌ Wrong: Defining timestamp columns manually
```javascript
// BAD - Sequelize handles these automatically
{
  created_at: { type: DataTypes.DATE },
  updated_at: { type: DataTypes.DATE },
  deleted_at: { type: DataTypes.DATE }
}
```

### ✅ Correct: Let Sequelize manage timestamps
```javascript
// GOOD - Don't define these fields
{
  // Your custom fields only
}
// Sequelize automatically adds createdAt, updatedAt
// deletedAt is added when paranoid: true
```

---

### ❌ Wrong: Custom soft delete field (isDeleted/is_deleted)
```javascript
// BAD - Never create manual soft delete fields
{
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: "is_deleted"
  }
}
// ...
{
  paranoid: false  // Wrong - disables built-in soft delete
}
```

### ✅ Correct: Use Sequelize paranoid mode
```javascript
// GOOD - Let Sequelize handle soft delete
{
  // Don't define any deleted/deleted_at fields
  // Only define your business fields
}
// ...
{
  paranoid: true  // Enables deletedAt field automatically
}
// Query: Model.findAll() automatically excludes soft-deleted records
// Query: Model.findAll({ paranoid: false }) includes soft-deleted records
```

**Important**: Even if `database_design.md` shows `is_deleted` column, **DO NOT** implement it manually. Instead:
- Use `paranoid: true` in Sequelize
- The `deletedAt` field (auto-created by Sequelize) maps to `deleted_at` in DB
- Translate business requirement ("soft delete") → Sequelize pattern (`paranoid: true`)


---

### ❌ Wrong: Fetching all attributes
```javascript
// BAD - Unnecessary data transfer
const users = await User.findAll();
```

### ✅ Correct: Select specific attributes
```javascript
// GOOD - Only fetch needed fields
const users = await User.findAll({
  attributes: ["id", "name", "email"],
});
```

---

## 5) Validation Patterns

### Model-level Validation
```javascript
const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
   
  },
  age: {
    type: DataTypes.INTEGER,
    
  },
});
```

### Hooks Pattern
```javascript
const User = sequelize.define(
  "User",
  { ... },
  {
    hooks: {
      beforeCreate: async (user, options) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  }
);
```

---

## Quick Reference Checklist

When creating a new model:
- [ ] UUID primary key with `defaultValue: DataTypes.UUIDV4`
- [ ] `paranoid: true` for soft delete
- [ ] `Model.sync()` at file end (for new tables)
- [ ] Import related models directly for associations
- [ ] Define associations inline (not in separate files)
- [ ] Foreign keys use `foreignKey: { name: "ColumnName", allowNull: false }`
- [ ] Database column names use snake_case with `field: "column_name"`
- [ ] Indexes added for frequently queried fields
- [ ] No manual created_at/updated_at/deleted_at fields
