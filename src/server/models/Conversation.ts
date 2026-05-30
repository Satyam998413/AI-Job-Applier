import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

const messageSchema = new Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const conversationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true },
);

export type ConversationDoc = InferSchemaType<typeof conversationSchema> & {
  _id: Types.ObjectId;
  updatedAt: Date;
};

export const Conversation: Model<ConversationDoc> =
  (models.Conversation as Model<ConversationDoc>) ??
  model<ConversationDoc>("Conversation", conversationSchema);
