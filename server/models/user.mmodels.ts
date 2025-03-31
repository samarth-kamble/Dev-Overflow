require("dotenv").config();
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: "farmer" | "buyer" | "seller" | "admin";
  isVerified: boolean;
  refreshTokens: string[];
  comparePassword: (password: string) => Promise<boolean>;
  signAccessToken: () => string;
  signRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      validate: {
        validator: function (value: string) {
          return emailRegexPattern.test(value);
        },
        message: "Please enter a valid email",
      },
      unique: true,
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Prevent password from being returned in queries
    },
    avatar: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    role: {
      type: String,
      enum: ["farmer", "buyer", "seller", "admin"],
      default: "farmer",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshTokens: {
      type: [String], // Store refresh tokens for better security management
      default: [],
    },
  },
  { timestamps: true },
);

// Hash Password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Sign Access Token
userSchema.methods.signAccessToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.ACCESS_TOKEN || "default_access_token_secret",
    { expiresIn: "15m" }, // Increased to 15 minutes
  );
};

// Sign Refresh Token
userSchema.methods.signRefreshToken = function () {
  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.REFRESH_TOKEN || "default_refresh_token_secret",
    { expiresIn: "7d" }, // Increased to 7 days
  );
  this.refreshTokens.push(refreshToken); // Store refresh tokens in DB
  this.save();
  return refreshToken;
};

// Compare Password
userSchema.methods.comparePassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const UserModel: Model<IUser> = mongoose.model("User", userSchema);

export default UserModel;
