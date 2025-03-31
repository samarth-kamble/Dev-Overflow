// Get User by ID
import { Response } from "express";
import UserModel from "../models/user.models";
import ErrorHandler from "../lib/ErrorHandler";

export const getUserById = async (id: string, res: Response) => {
  try {
    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
