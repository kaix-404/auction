export const runtime = "nodejs";

import mongoose, { Schema, Document, Model } from "mongoose";
import { UserRole } from "@/types";

export interface IAdminUser extends Document {
  userId: mongoose.Types.ObjectId;
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  lastLoginAt: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["super_admin", "operations_admin", "finance_admin", "compliance_admin", "support_admin"],
    },
    permissions: [{ type: String }],
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

AdminUserSchema.index({ userId: 1 }, { unique: true });
AdminUserSchema.index({ role: 1 });

const AdminUser: Model<IAdminUser> =
  mongoose.models.AdminUser ||
  mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);

export default AdminUser;
