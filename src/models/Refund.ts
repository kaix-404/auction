import mongoose, { Schema, Document, Model } from "mongoose";
import { RefundStatus } from "@/types";

export const runtime = "nodejs";

export interface IRefund extends Document {
  refundId: string;
  userId: mongoose.Types.ObjectId;
  auctionId: mongoose.Types.ObjectId;
  emdLedgerId: mongoose.Types.ObjectId;
  amount: number;
  bankAccountId: mongoose.Types.ObjectId;
  utr: string;
  status: RefundStatus;
  processedBy: mongoose.Types.ObjectId;
  processedAt: Date;
  failureReason: string;
  retryCount: number;
  nextRetryAt: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

function generateRefundId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `REF-${result}`;
}

const RefundSchema = new Schema<IRefund>(
  {
    refundId: {
      type: String,
      required: true,
      unique: true,
      default: generateRefundId,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    auctionId: {
      type: Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
    },
    emdLedgerId: {
      type: Schema.Types.ObjectId,
      ref: "EmdLedger",
    },
    amount: {
      type: Number,
      required: true,
    },
    bankAccountId: {
      type: Schema.Types.ObjectId,
      ref: "BankAccount",
      required: true,
    },
    utr: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        "pending_review",
        "approved",
        "processing",
        "completed",
        "failed",
      ] as RefundStatus[],
      default: "pending_review",
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
    },
    processedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    nextRetryAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

RefundSchema.index({ userId: 1 });
RefundSchema.index({ auctionId: 1 });
RefundSchema.index({ status: 1 });
RefundSchema.index({ userId: 1, auctionId: 1 });

const Refund: Model<IRefund> =
  mongoose.models.Refund || mongoose.model<IRefund>("Refund", RefundSchema);

export default Refund;
