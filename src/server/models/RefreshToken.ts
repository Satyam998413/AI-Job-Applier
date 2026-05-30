import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    /** SHA-256 hash of the raw token. The raw token only ever exists in the user's cookie. */
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    /** When a token is rotated, this points to the tokenHash that replaced it. */
    replacedBy: { type: String, default: null },
  },
  { timestamps: true },
);

// TTL purge once a token is well past expiry (keep briefly for replay-attack auditing).
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

export type RefreshTokenDoc = InferSchemaType<typeof refreshTokenSchema> & { _id: Types.ObjectId };

export const RefreshToken: Model<RefreshTokenDoc> =
  (models.RefreshToken as Model<RefreshTokenDoc>) ??
  model<RefreshTokenDoc>("RefreshToken", refreshTokenSchema);
