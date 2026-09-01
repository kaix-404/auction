export const runtime = "nodejs";

import mongoose, { Schema, Document, Model } from "mongoose";
import { UserRole, UserStatus } from "@/types";

export interface IUser extends Document {
  email: string;
  mobile: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  lastLoginAt: Date;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "super_admin", "operations_admin", "finance_admin", "compliance_admin", "support_admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "pending", "restricted", "suspended", "blocked"],
      default: "pending",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ mobile: 1 }, { unique: true });
UserSchema.index({ status: 1 });
UserSchema.index({ role: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
