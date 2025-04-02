import express from "express";
import { isAuthenticated } from "../middlewares/auth";
import { getMessages, sendMessage } from "../controllers/message.controller";
import upload from "../middlewares/multer";

const messageRouter = express.Router();

messageRouter.route("/community/send/:id").post(isAuthenticated, sendMessage);
messageRouter.route("/community/all/:id").get(isAuthenticated, getMessages);

export default messageRouter;
