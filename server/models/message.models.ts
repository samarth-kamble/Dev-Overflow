import mongoose, { Document, Schema, Model } from "mongoose";

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  messages: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema<IMessage> = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const MessageModel: Model<IMessage> = mongoose.model<IMessage>(
  "Message",
  MessageSchema,
);
