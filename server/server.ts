import express, { NextFunction, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";

import connectDB from "./lib/db";
import { ErrorMiddleware } from "./middlewares/error";
import userRouter from "./routes/user.routes";

export const app = express();

// Connecting Database
connectDB();

// Body Parser
app.use(express.json({ limit: "50mb" }));

// Cookie Parser
app.use(cookieParser());

// Server Listening
app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running on port ${process.env.PORT || 8000}`);
});

//API Request Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: "draft-7",
  legacyHeaders: true,
});

// Define a Routes
app.use("/api/v1", userRouter);

// Define a route for the root URL
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// unknown route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

// middleware calls
app.use(limiter);
app.use(ErrorMiddleware);
