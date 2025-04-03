import { CatchAsyncError } from "../middlewares/catchAsyncErrors";
import { Request, Response, NextFunction } from "express";
import UserModel, { IUser } from "../models/user.models";
import sharp from "sharp";
import cloudinary from "../server";
import { PostModel } from "../models/post.models";
import ErrorHandler from "../lib/ErrorHandler";
import { getReceiverSocketId, io } from "../socket";
import { CommentModel } from "../models/comment.models";

export interface AuthenticatedRequest extends Request {
  user?: IUser; // Attach the authenticated user
}

export const addNewPost = CatchAsyncError(
  async (req: AuthenticatedRequest, res: Response) => {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.user?.id;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    if (!authorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({ width: 800, height: 800, fit: "inside" })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();

    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;
    const cloudResponse = await cloudinary.uploader.upload(fileUri);

    const post = await PostModel.create({
      caption,
      image: cloudResponse.secure_url,
      author: authorId,
    });

    const user = await UserModel.findById(authorId);
    if (user) {
      user.posts.push(post._id as any);
      await user.save();
    }

    await post.populate({ path: "author", select: "-password" });

    return res.status(201).json({
      message: "New post added",
      post,
      success: true,
    });
  }
);

export const getAllPosts = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const posts = await PostModel.find()
        .sort({ createdAt: -1 })
        .populate({ path: "author", select: "username profilePicture" })
        .populate({
          path: "comments",
          populate: { path: "author", select: "username profilePicture" },
          options: { sort: { createdAt: -1 } },
        });

      res.status(200).json({
        success: true,
        posts,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getUserPosts = CatchAsyncError(
  async (req: AuthenticatedRequest, res: Response) => {
    const authorId = req.user?.id;

    if (!authorId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const posts = await PostModel.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture" })
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: { path: "author", select: "username profilePicture" },
      });

    return res.status(200).json({ success: true, posts });
  }
);

export const likePost = CatchAsyncError(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const postId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Add user to likes if not already liked
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } },
      { new: true }
    );

    // Notify the post owner
    const postOwnerId = post.author.toString();
    if (postOwnerId !== userId) {
      const user = await UserModel.findById(userId).select(
        "username profilePicture"
      );
      const postOwnerSocketId = getReceiverSocketId(postOwnerId);

      if (postOwnerSocketId) {
        const notification = {
          type: "like",
          userId,
          userDetails: user,
          postId,
          message: "Your post was liked",
        };
        io.to(postOwnerSocketId).emit("notification", notification);
      }
    }

    return res
      .status(200)
      .json({ success: true, message: "Post liked", post: updatedPost });
  }
);

export const dislikePost = CatchAsyncError(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const postId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Remove user from likes
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true }
    );

    // Notify the post owner
    const postOwnerId = post.author.toString();
    if (postOwnerId !== userId) {
      const user = await UserModel.findById(userId).select(
        "username profilePicture"
      );
      const postOwnerSocketId = getReceiverSocketId(postOwnerId);

      if (postOwnerSocketId) {
        const notification = {
          type: "dislike",
          userId,
          userDetails: user,
          postId,
          message: "Your post was disliked",
        };
        io.to(postOwnerSocketId).emit("notification", notification);
      }
    }

    return res
      .status(200)
      .json({ success: true, message: "Post disliked", post: updatedPost });
  }
);

export const addComment = CatchAsyncError(
  async (req: AuthenticatedRequest, res: Response) => {
    const postId = req.params.id;
    const userId = req.user?.id;
    const { text } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: "Text is required" });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const comment = await CommentModel.create({
      text,
      author: userId,
      post: postId,
    });

    post.comments.push(comment._id as any);
    await post.save();

    // Populate the author details
    await comment.populate({
      path: "author",
      select: "username profilePicture",
    });

    return res.status(201).json({
      success: true,
      message: "Comment Added",
      comment,
    });
  }
);

export const getCommentsOfPost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;

    // Fetch comments and populate author details
    const comments = await CommentModel.find({ post: postId })
      .populate("author", "username profilePicture")
      .sort({ createdAt: -1 }); // Sort by latest comments

    // Check if there are no comments
    if (comments.length === 0) {
      return res.status(404).json({
        message: "No comments found for this post",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const authorId = req.user.id; // Assuming `req.id` is set by auth middleware

    // Find the post
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    // Check if the logged-in user is the owner of the post
    if (post.author.toString() !== authorId) {
      return res.status(403).json({
        message: "Unauthorized: You can only delete your own posts",
        success: false,
      });
    }

    // Delete post from database
    await post.deleteOne();

    // Remove the post ID from the user's posts array
    await UserModel.findByIdAndUpdate(authorId, {
      $pull: { posts: postId },
    });

    // Delete all associated comments
    await CommentModel.deleteMany({ post: postId });

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const bookmarkPost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id; // Assuming `req.id` is set by authentication middleware

    // Check if the post exists
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    // Find the user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Toggle Bookmark: If exists, remove it; otherwise, add it
    if (user.bookmarks.includes(post._id as any)) {
      await user.updateOne({ $pull: { bookmarks: post._id } });
      return res.status(200).json({
        type: "unsaved",
        message: "Post removed from bookmarks",
        success: true,
      });
    } else {
      await user.updateOne({ $addToSet: { bookmarks: post._id } });
      return res.status(200).json({
        type: "saved",
        message: "Post bookmarked successfully",
        success: true,
      });
    }
  } catch (error) {
    console.error("Error in bookmarking post:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
