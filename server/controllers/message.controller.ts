import { Request, Response, NextFunction } from "express";
import { Conversation } from "../models/conversation.models";
import { MessageModel } from "../models/message.models";
import { getReceiverSocketId, io } from "../socket";
import { IUser } from "../models/user.models";
import ErrorHandler from "../lib/ErrorHandler";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors";

export interface AuthenticatedRequest extends Request {
  user?: IUser; // Attach the authenticated user
}

// Send Message

export const sendMessage = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const senderId = req.user.id;
      const receiverId = req.params.id;
      const { textMessage } = req.body;

      // Check if a conversation exists
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, receiverId],
        });
      }

      // Create new message
      const newMessage = await MessageModel.create({
        senderId,
        receiverId,
        messages: textMessage,
      });

      // Push message ID into conversation
      conversation.messages.push(newMessage._id as any);
      await Promise.all([conversation.save(), newMessage.save()]);

      // Emit real-time message
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }

      return new ErrorHandler("Message Error", 401);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Get Messages Between Two Users

export const getMessages = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const senderId = req.user.id;
      const receiverId = req.params.id;

      // Find the conversation
      const conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      }).populate("messages");

      if (!conversation) {
        return res.status(200).json({ success: true, messages: [] });
      }

      return res
        .status(200)
        .json({ success: true, messages: conversation.messages });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
