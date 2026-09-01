export const runtime = "nodejs";

import mongoose, { Schema, Document, Model } from "mongoose";
import { UserRole, AdminModule } from "@/types";

export interface IRolePermission extends Document {
  role: UserRole;
  module: AdminModule;
  actions: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const RolePermissionSchema = new Schema<IRolePermission>(
  {
    role: {
      type: String,
      required: true,
      enum: ["super_admin", "operations_admin", "finance_admin", "compliance_admin", "support_admin"],
    },
    module: {
      type: String,
      required: true,
      enum: [
        "users",
        "auctions",
        "products",
        "payments",
        "orders",
        "refunds",
        "reports",
        "audit",
        "settings",
        "notifications",
        "support",
      ],
    },
    actions: {
      type: [String],
      required: true,
    },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

RolePermissionSchema.index({ role: 1, module: 1 }, { unique: true });

const RolePermission: Model<IRolePermission> =
  mongoose.models.RolePermission ||
  mongoose.model<IRolePermission>("RolePermission", RolePermissionSchema);

export default RolePermission;
