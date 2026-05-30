import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

const sealedSchema = new Schema(
  {
    iv: { type: String, required: true },
    ciphertext: { type: String, required: true },
    tag: { type: String, required: true },
  },
  { _id: false },
);

const callEntrySchema = new Schema({ at: { type: Date, required: true } }, { _id: false });

const jsearchKeySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    encrypted: { type: sealedSchema, required: true },
    lastFour: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    totalLimit: { type: Number, default: 100, min: 0 },
    usedThisMonth: { type: Number, default: 0, min: 0 },
    monthKey: { type: String, default: () => currentMonthKey() }, // YYYY-MM
    lastCallAt: { type: Date, default: null },
    callHistory: { type: [callEntrySchema], default: [] },
  },
  { timestamps: true },
);

export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export type JsearchKeyDoc = InferSchemaType<typeof jsearchKeySchema> & { _id: Types.ObjectId };

export const JsearchKey: Model<JsearchKeyDoc> =
  (models.JsearchKey as Model<JsearchKeyDoc>) ?? model<JsearchKeyDoc>("JsearchKey", jsearchKeySchema);
