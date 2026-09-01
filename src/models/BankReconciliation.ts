import mongoose, { Schema, Document, Model } from "mongoose";

export const runtime = "nodejs";

export interface IBankReconciliation extends Document {
  transactionId: string;
  utr: string;
  amount: number;
  transactionDate: Date;
  userId: mongoose.Types.ObjectId;
  matchedPaymentId: mongoose.Types.ObjectId;
  matchedRefundId: mongoose.Types.ObjectId;
  status: "unmatched" | "matched" | "disputed" | "ignored";
  matchedBy: mongoose.Types.ObjectId;
  matchedAt: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const BankReconciliationSchema = new Schema<IBankReconciliation>(
  {
    transactionId: {
      type: String,
      required: true,
    },
    utr: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionDate: {
      type: Date,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    matchedPaymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
    matchedRefundId: {
      type: Schema.Types.ObjectId,
      ref: "Refund",
    },
    status: {
      type: String,
      enum: ["unmatched", "matched", "disputed", "ignored"],
      default: "unmatched",
    },
    matchedBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
    },
    matchedAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

BankReconciliationSchema.index({ utr: 1 });
BankReconciliationSchema.index({ transactionId: 1 });
BankReconciliationSchema.index({ status: 1 });
BankReconciliationSchema.index({ matchedPaymentId: 1 });

const BankReconciliation: Model<IBankReconciliation> =
  mongoose.models.BankReconciliation ||
  mongoose.model<IBankReconciliation>("BankReconciliation", BankReconciliationSchema);

export default BankReconciliation;
