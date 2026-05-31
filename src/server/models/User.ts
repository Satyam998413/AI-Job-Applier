import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    passwordSetByUser: { type: Boolean, default: true }, // false = random hash from Nylas login
    fullName: { type: String, required: true, trim: true },
    mobile: { type: String, trim: true, unique: true, sparse: true },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema>;

// Reuse the compiled model across hot-reloads to avoid OverwriteModelError.
export const User: Model<UserDoc> =
  (models.User as Model<UserDoc>) ?? model<UserDoc>("User", userSchema);
