import mongoose, { Document, Schema, Model } from "mongoose";

export interface IPost extends Document {
  caption: string;
  image: string;
  author: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema<IPost> = new mongoose.Schema(
  {
    caption: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const PostModel: Model<IPost> = mongoose.model<IPost>(
  "Post",
  PostSchema
);
