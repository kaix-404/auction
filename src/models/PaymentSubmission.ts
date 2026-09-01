import mongoose, { Schema, Document, Model } from "mongoose";
import { PaymentStatus } from "@/types";

export const runtime = "nodejs";

export interface IPaymentSubmission extends Document {
  userId: mongoose.Types.ObjectId;
  auctionId: mongoose.Types.ObjectId;
  paymentId: mongoose.Types.ObjectId;
  utr: string;
  amount: number;
  paymentDate: Date;
  method: "upi" | "imps" | "neft" | "bank_transfer";
  proofUrl: string;
  notes: string;
  status: PaymentStatus;
  reviewedBy: mongoose.Types.ObjectId;
  reviewedAt: Date;
  rejectionReason: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSubmissionSchema = new Schema<IPaymentSubmission>(
  {
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
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
    utr: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    method: {
      type: String,
      required: true,
      enum: ["upi", "imps", "neft", "bank_transfer"],
    },
    proofUrl: {
      type: String,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "submitted", "under_review", "verified", "rejected", "reversed", "refunded", "reconciled"] as PaymentStatus[],
      default: "pending",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
  },
  { timestamps: true }
);

PaymentSubmissionSchema.index({ utr: 1 });
PaymentSubmissionSchema.index({ userId: 1, auctionId: 1 });
PaymentSubmissionSchema.index({ status: 1 });

const PaymentSubmission: Model<IPaymentSubmission> =
  mongoose.models.PaymentSubmission ||
  mongoose.model<IPaymentSubmission>("PaymentSubmission", PaymentSubmissionSchema);

export default PaymentSubmission;
