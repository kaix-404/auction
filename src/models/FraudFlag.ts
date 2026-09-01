export const runtime = "nodejs";

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFraudFlag extends Document {
  userId: mongoose.Types.ObjectId;
  auctionId: mongoose.Types.ObjectId;
  type:
    | "duplicate_account"
    | "suspicious_bid"
    | "unusual_pattern"
    | "shill_bidding"
    | "payment_fraud"
    | "identity_fraud";
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "flagged" | "investigating" | "resolved" | "false_positive";
  flaggedBy: mongoose.Types.ObjectId;
  resolvedBy: mongoose.Types.ObjectId;
  resolvedAt: Date;
  resolutionNotes: string;
  evidence: Record<string, unknown>[];
  createdAt: Date;
  updatedAt: Date;
}

const FraudFlagSchema = new Schema<IFraudFlag>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    auctionId: {
      type: Schema.Types.ObjectId,
      ref: "Auction",
    },
    type: {
      type: String,
      required: true,
      enum: [
        "duplicate_account",
        "suspicious_bid",
        "unusual_pattern",
        "shill_bidding",
        "payment_fraud",
        "identity_fraud",
      ],
    },
    description: { type: String, required: true },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["flagged", "investigating", "resolved", "false_positive"],
      default: "flagged",
    },
    flaggedBy: { type: Schema.Types.ObjectId, ref: "AdminUser", required: true },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    resolvedAt: { type: Date },
    resolutionNotes: { type: String, default: "" },
    evidence: [{ type: Schema.Types.Mixed }],
  },
  { timestamps: true }
);

FraudFlagSchema.index({ userId: 1 });
FraudFlagSchema.index({ auctionId: 1 });
FraudFlagSchema.index({ type: 1 });
FraudFlagSchema.index({ status: 1 });
FraudFlagSchema.index({ severity: 1 });

const FraudFlag: Model<IFraudFlag> =
  mongoose.models.FraudFlag ||
  mongoose.model<IFraudFlag>("FraudFlag", FraudFlagSchema);

export default FraudFlag;
