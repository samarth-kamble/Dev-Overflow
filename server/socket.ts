import { Server, Socket } from "socket.io";
import express from "express";
import http from "http";
import dotenv from "dotenv";
import { app } from "./server";

dotenv.config(); // Load environment variables

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.ORIGIN || "*", // Ensure CORS allows frontend connections
    methods: ["GET", "POST"],
  },
});

// User socket mapping: userId -> socketId
const userSocketMap: Record<string, string> = {};

// Function to get receiver's socket ID
export const getReceiverSocketId = (receiverId: string): string | undefined =>
  userSocketMap[receiverId];

// Handle socket connection
io.on("connection", (socket: Socket) => {
  const userId = socket.handshake.query.userId as string;

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Notify clients about online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle disconnection
  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io };
