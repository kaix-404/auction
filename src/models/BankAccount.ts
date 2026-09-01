export const runtime = "nodejs";

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBankAccount extends Document {
  userId: mongoose.Types.ObjectId;
  holderName: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  accountType: "savings" | "current";
  isDefault: boolean;
  status: "pending_review" | "approved" | "rejected";
  rejectionReason: string;
  reviewedBy: mongoose.Types.ObjectId;
  reviewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BankAccountSchema = new Schema<IBankAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    holderName: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    ifsc: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      enum: ["savings", "current"],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending_review", "approved", "rejected"],
      default: "pending_review",
    },
    rejectionReason: {
      type: String,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

BankAccountSchema.index({ userId: 1 });
BankAccountSchema.index({ status: 1 });

const BankAccount: Model<IBankAccount> =
  mongoose.models.BankAccount ||
  mongoose.model<IBankAccount>("BankAccount", BankAccountSchema);

export default BankAccount;
