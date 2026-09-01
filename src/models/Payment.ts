import mongoose, { Schema, Document, Model } from "mongoose";
import { PaymentStatus, PaymentType } from "@/types";

export const runtime = "nodejs";

export interface IPayment extends Document {
  transactionId: string;
  userId: mongoose.Types.ObjectId;
  auctionId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  type: PaymentType;
  amount: number;
  gstComponent: number;
  status: PaymentStatus;
  notes: string;
  verifiedBy: mongoose.Types.ObjectId;
  verifiedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

function generateTransactionId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PAY-${result}`;
}

const PaymentSchema = new Schema<IPayment>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      default: generateTransactionId,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    auctionId: {
      type: Schema.Types.ObjectId,
      ref: "Auction",
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    type: {
      type: String,
      required: true,
      enum: ["participation_fee", "emd", "balance", "refund"] as PaymentType[],
    },
    amount: {
      type: Number,
      required: true,
    },
    gstComponent: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "submitted",
        "under_review",
        "verified",
        "rejected",
        "reversed",
        "refunded",
        "reconciled",
      ] as PaymentStatus[],
      default: "pending",
    },
    notes: {
      type: String,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
    },
    verifiedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ auctionId: 1 });
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ type: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ userId: 1, auctionId: 1 });

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
