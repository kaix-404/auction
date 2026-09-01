export const runtime = "nodejs";

import mongoose, { Schema, Document, Model } from "mongoose";
import { KycStatus } from "@/types";

export interface IKycRecord extends Document {
  userId: mongoose.Types.ObjectId;
  documentType: "aadhaar" | "pan" | "passport" | "driving_license" | "voter_id";
  documentNumber: string;
  documentFrontUrl: string;
  documentBackUrl: string;
  selfieUrl: string;
  status: KycStatus;
  verifiedBy: mongoose.Types.ObjectId;
  verifiedAt: Date;
  rejectionReason: string;
  createdAt: Date;
  updatedAt: Date;
}

const KycRecordSchema = new Schema<IKycRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentType: {
      type: String,
      enum: ["aadhaar", "pan", "passport", "driving_license", "voter_id"],
    },
    documentNumber: {
      type: String,
      required: true,
    },
    documentFrontUrl: {
      type: String,
    },
    documentBackUrl: {
      type: String,
    },
    selfieUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
    },
    verifiedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

KycRecordSchema.index({ userId: 1 });
KycRecordSchema.index({ status: 1 });

const KycRecord: Model<IKycRecord> =
  mongoose.models.KycRecord ||
  mongoose.model<IKycRecord>("KycRecord", KycRecordSchema);

export default KycRecord;
