import mongoose, { Document, Schema, Model } from "mongoose";

// Define Comment Interface
export interface IComment extends Document {
  text: string;
  author: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Define Comment Schema
const commentSchema: Schema<IComment> = new mongoose.Schema(
  {
    text: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: true } // Automatically add createdAt & updatedAt
);

// Create Index for Faster Queries
commentSchema.index({ post: 1 });

export const CommentModel: Model<IComment> = mongoose.model<IComment>(
  "Comment",
  commentSchema
);
