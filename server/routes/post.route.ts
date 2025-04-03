import express from "express";
import upload from "../middlewares/multer";
import { isAuthenticated } from "../middlewares/auth";
import { addNewPost } from "../controllers/post.controller";

const postRouter = express.Router();

postRouter
  .route("/post/addpost")
  .post(isAuthenticated, upload.single("image"), addNewPost);

export default postRouter;
