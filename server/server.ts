import express, { NextFunction, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import http from "http";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./lib/db";
import { ErrorMiddleware } from "./middlewares/error";
import userRouter from "./routes/user.routes";
import messageRouter from "./routes/message.route";
import postRouter from "./routes/post.route";

// Load environment variables
dotenv.config();

export const app = express();

// Connect to MongoDB
connectDB();

// HTTP server
const server = http.createServer(app);

// CORS middleware for Express
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000", // Frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

// Body parser
app.use(express.json({ limit: "50mb" }));

// Cookie parser
app.use(cookieParser());

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP
  standardHeaders: "draft-7",
  legacyHeaders: true,
});
app.use(limiter);

// CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});

export default cloudinary;

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const userSocketMap: Record<string, string> = {};

// Get receiver's socket ID
export const getReceiverSocketId = (receiverId: string): string | undefined =>
  userSocketMap[receiverId];

// Handle socket connection
io.on("connection", (socket: Socket) => {
  const userId = socket.handshake.query.userId as string;

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Emit online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // On disconnect
  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// API Routes
app.use("/api/v1", userRouter);
app.use("/api/v1", messageRouter);
app.use("/api/v1", postRouter);

// Root Route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// 404 Route Handler
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

// Error Middleware
app.use(ErrorMiddleware);

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
