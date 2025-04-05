// Register User
import { NextFunction, Request, Response } from "express";
import ejs from "ejs";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import path from "path";
import bcrypt from "bcryptjs";

import { CatchAsyncError } from "../middlewares/catchAsyncErrors";
import ErrorHandler from "../lib/ErrorHandler";
import UserModel, { IUser } from "../models/user.models";
import sendMail from "../lib/sendMails";
import { sendToken } from "../lib/jwt";
import {
  getAllUsersService,
  getUserById,
  updateUserRoleService,
} from "../services/user.services";

// Registration User
interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  username: string;
}

// Registration User
export const registrationUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, username }: IRegistrationBody = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler("Email already exists", 400));
    }

    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) {
      return next(new ErrorHandler("Username already taken", 400));
    }

    const activationPayload = { name, email, password, username };
    const activationToken = createActivationToken(activationPayload);

    const activationCode = activationToken.activationCode;

    try {
      await sendMail({
        email,
        subject: "Activate your account",
        template: "activation-mail.ejs",
        data: { user: { name }, activationCode },
      });

      res.status(201).json({
        success: true,
        message: `Please check your email: ${email} to activate your account!`,
        activationToken: activationToken.token,
      });
    } catch (error: any) {
      return next(new ErrorHandler("Failed to send activation email", 500));
    }
  }
);

// Activation Token Creation
interface IActivationToken {
  token: string;
  activationCode: string;
}

export const createActivationToken = (
  user: IRegistrationBody & { username: string }
): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const token = jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_SECRET as Secret,
    { expiresIn: "5m" }
  );

  return { token, activationCode };
};
// Activate User
interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

export const activateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } = req.body;

      if (!activation_token) {
        return res
          .status(400)
          .json({ success: false, message: "Activation token missing" });
      }

      let newUser: any;
      try {
        newUser = jwt.verify(
          activation_token.trim(),
          process.env.ACTIVATION_SECRET as Secret
        );
      } catch (error: any) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired activation token",
        });
      }

      const { name, email, password, username } = newUser.user;

      if (newUser.activationCode !== activation_code) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid activation code" });
      }

      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      }

      const existingUsername = await UserModel.findOne({ username });
      if (existingUsername) {
        return res
          .status(400)
          .json({ success: false, message: "Username already taken" });
      }

      const user = await UserModel.create({ name, email, password, username });

      res.status(201).json({
        success: true,
        message: "Account activated successfully",
        user,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

export const resendOTP = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { activation_token } = req.body;

    if (!activation_token) {
      return next(new ErrorHandler("Activation token is required", 400));
    }

    try {
      const decoded = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as Secret
      ) as JwtPayload;

      const { user } = decoded;
      const newActivation = createActivationToken(user);

      await sendMail({
        email: user.email,
        subject: "Resend OTP - Activate Your Account",
        template: "activation-mail.ejs",
        data: {
          user: { name: user.name },
          activationCode: newActivation.activationCode,
        },
      });

      res.status(200).json({
        success: true,
        message: "OTP resent successfully",
        activationToken: newActivation.token, // 🧠 this must replace the old one in the frontend
      });
    } catch (error) {
      return next(new ErrorHandler("Invalid or expired activation token", 400));
    }
  }
);

// Login User
interface ILoginRequest {
  email: string;
  password: string;
}

export const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginRequest;

      if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
      }

      const user = await UserModel.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("Invalid email or password", 400));
      }

      const isPasswordMatch = await user.comparePassword(password);

      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid password", 400));
      }

      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Logout user
export const logoutUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Clear the access and refresh token cookies
      res.cookie("access-token", "", {
        maxAge: 1,
        httpOnly: true,
        secure: true,
      });
      res.cookie("refresh-token", "", {
        maxAge: 1,
        httpOnly: true,
        secure: true,
      });

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Update Access Token
export const updateAccessToken = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token as string;
      if (!refresh_token) {
        return next(
          new ErrorHandler("Refresh token missing, please login", 401)
        );
      }

      const decoded = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN as string
      ) as JwtPayload;

      if (!decoded || !decoded.id) {
        return next(
          new ErrorHandler("Invalid refresh token, please login again", 401)
        );
      }

      // Fetch user from DB
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        return next(
          new ErrorHandler("User not found, please login again", 401)
        );
      }

      // Generate a new access token
      const newAccessToken = user.signAccessToken();

      // Attach new access token to response
      res.cookie("access-token", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      req.user = user;
      return next();
    } catch (error: any) {
      return next(
        new ErrorHandler(
          "Invalid or expired refresh token, please login again",
          401
        )
      );
    }
  }
);

// Get User Info
export const getUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      getUserById(userId, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Update User Password
interface IUpdatePassword {
  oldPassword: string;
  newPassword: string;
}

export const updatePassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body as IUpdatePassword;

      if (!oldPassword || !newPassword) {
        return next(new ErrorHandler("Please enter old and new password", 400));
      }

      const user = await UserModel.findById(req.user?._id).select("+password");

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      const isPasswordMatch = await user.comparePassword(oldPassword);

      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid old password", 400));
      }

      // Hash the new password before saving (handled by pre-save hook)
      user.password = newPassword;

      await user.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Update User Info
interface IUpdateUserInfo {
  name?: string;
  email?: string;
}

export const updateUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body as IUpdateUserInfo;
      const userId = req.user?._id;

      const user = await UserModel.findById(userId);

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      if (name) {
        user.name = name;
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: "User info updated successfully",
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Get All Users --only for admin
export const getAllUsers = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllUsersService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Update User Role --only for Admin
export const updateUserRole = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, role } = req.body;

      // Validate input
      if (!email || !role) {
        return next(new ErrorHandler("Email and role are required", 400));
      }

      const isUserExist = await UserModel.findOne({ email });

      if (!isUserExist) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const id = isUserExist._id; // Ensure that id is a string

      // Pass the stringified id to the service function
      // @ts-ignore
      await updateUserRoleService(res, id, role);

      res.status(200).json({
        success: true,
        message: "User role updated successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
