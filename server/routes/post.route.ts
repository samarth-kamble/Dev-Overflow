import express from "express";
import upload from "../middlewares/multer";
import { isAuthenticated } from "../middlewares/auth";
import {
  addComment,
  addNewPost,
  bookmarkPost,
  deletePost,
  dislikePost,
  getAllPosts,
  getCommentsOfPost,
  getUserPosts,
  likePost,
} from "../controllers/post.controller";

const postRouter = express.Router();

postRouter
  .route("/post/addpost")
  .post(isAuthenticated, upload.single("image"), addNewPost);

postRouter.route("/post/all").get(isAuthenticated, getAllPosts);
postRouter.route("/post/userpost/all").get(isAuthenticated, getUserPosts);
postRouter.route("/post/:id/like").get(isAuthenticated, likePost);
postRouter.route("/post/:id/dislike").get(isAuthenticated, dislikePost);
postRouter.route("/post/:id/comment").post(isAuthenticated, addComment);
postRouter
  .route("/post/:id/comment/all")
  .post(isAuthenticated, getCommentsOfPost);
postRouter.route("/post/delete/:id").delete(isAuthenticated, deletePost);
postRouter.route("/post/:id/bookmark").get(isAuthenticated, bookmarkPost);

export default postRouter;
