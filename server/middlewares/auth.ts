import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../lib/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import UserModel from "../models/user.models"; // Import user model
import { updateAccessToken } from "../controllers/user.controller";

// Middleware to authenticate users
export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies["access-token"]; // Get the access token from cookies

    if (!access_token) {
      return next(
        new ErrorHandler("Please login to access this resource", 400)
      );
    }

    try {
      // Verify the access token
      const decoded = jwt.verify(
        access_token,
        process.env.ACCESS_TOKEN_SECRET || ""
      ) as JwtPayload;

      if (!decoded || !decoded.id) {
        return next(new ErrorHandler("Invalid access token", 400));
      }

      // Check if the access token is expired
      if (decoded.exp && decoded.exp <= Date.now() / 1000) {
        // If expired, attempt to refresh the access token
        try {
          await updateAccessToken(req, res, next);
        } catch (error) {
          return next(error); // Pass error to next middleware if refreshing token fails
        }
      } else {
        // Find the user from the database
        const user = await UserModel.findById(decoded.id);
        if (!user) {
          return next(
            new ErrorHandler("User not found. Please login again.", 400)
          );
        }

        req.user = user; // Attach the user to the request object
        next(); // Proceed to the next middleware
      }
    } catch (error) {
      return next(new ErrorHandler("Access token is invalid or expired", 400));
    }
  }
);
export const authorizeRoles = (
  ...roles: Array<"farmer" | "buyer" | "seller" | "admin">
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ErrorHandler("Authentication required", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not authorized to access this resource`,
          403
        )
      );
    }

    next();
  };
};
