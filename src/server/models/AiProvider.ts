import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

const sealedSchema = new Schema(
  {
    iv: { type: String, required: true },
    ciphertext: { type: String, required: true },
    tag: { type: String, required: true },
  },
  { _id: false },
);

export const AI_PROVIDER_NAMES = ["gemini", "openai", "claude", "groq", "ollama"] as const;
export type AiProviderName = (typeof AI_PROVIDER_NAMES)[number];

const aiProviderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    provider: { type: String, enum: AI_PROVIDER_NAMES, required: true },
    encrypted: { type: sealedSchema, required: true },
    lastFour: { type: String, required: true },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true },
);

aiProviderSchema.index({ userId: 1, provider: 1 }, { unique: true });

export type AiProviderDoc = InferSchemaType<typeof aiProviderSchema> & { _id: Types.ObjectId };

export const AiProvider: Model<AiProviderDoc> =
  (models.AiProvider as Model<AiProviderDoc>) ?? model<AiProviderDoc>("AiProvider", aiProviderSchema);
