export const runtime = "nodejs";

import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISystemSetting extends Document {
  key: string;
  value: unknown;
  category: string;
  description: string;
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

const SystemSettingSchema = new Schema<ISystemSetting>(
  {
    key: { type: String, unique: true, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    category: {
      type: String,
      required: true,
      enum: ["auction", "payment", "notification", "general"],
    },
    description: { type: String, default: "" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    updatedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

SystemSettingSchema.index({ key: 1 }, { unique: true });
SystemSettingSchema.index({ category: 1 });

const SystemSetting: Model<ISystemSetting> =
  mongoose.models.SystemSetting ||
  mongoose.model<ISystemSetting>("SystemSetting", SystemSettingSchema);

export default SystemSetting;
