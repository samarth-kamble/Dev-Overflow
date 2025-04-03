import express, { NextFunction, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import http from "http";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";

import connectDB from "./lib/db";
import { ErrorMiddleware } from "./middlewares/error";
import userRouter from "./routes/user.routes";
import messageRouter from "./routes/message.route";
import postRouter from "./routes/post.route";

dotenv.config(); // Load environment variables

export const app = express();

// Connecting Database
connectDB();

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: process.env.URL || "*",
    methods: ["GET", "POST"],
  },
});

// Store online users: userId -> socketId
const userSocketMap: Record<string, string> = {};

// Function to get receiver's socket ID
export const getReceiverSocketId = (receiverId: string): string | undefined =>
  userSocketMap[receiverId];

// Handle Socket.IO connections
io.on("connection", (socket: Socket) => {
  const userId = socket.handshake.query.userId as string;

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Notify all clients about online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle disconnection
  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Body Parser
app.use(express.json({ limit: "50mb" }));

// Cookie Parser
app.use(cookieParser());

// API Request Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: "draft-7",
  legacyHeaders: true,
});

// Define Routes
app.use("/api/v1", userRouter, messageRouter, postRouter);

// Define a route for the root URL
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Unknown route handler
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

// CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});

export default cloudinary;
// Middleware Calls
app.use(limiter);
app.use(ErrorMiddleware);

// Start Server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
