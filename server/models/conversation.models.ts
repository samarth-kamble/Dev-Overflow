import mongoose, { Document, Schema, Model } from "mongoose";

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  messages: mongoose.Types.ObjectId[];
}

const ConversationSchema: Schema<IConversation> = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }, // Adds createdAt and updatedAt fields
);

// Ensure unique conversations between the same two users
ConversationSchema.index({ participants: 1 }, { unique: true });

export const Conversation: Model<IConversation> = mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema,
);
