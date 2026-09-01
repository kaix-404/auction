import mongoose, { Schema, Document, Model } from "mongoose";

export const runtime = "nodejs";

export interface IEmdLedger extends Document {
  userId: mongoose.Types.ObjectId;
  auctionId: mongoose.Types.ObjectId;
  amount: number;
  type: "locked" | "released" | "refunded" | "adjusted" | "forfeited";
  paymentSubmissionId: mongoose.Types.ObjectId;
  refundId: mongoose.Types.ObjectId;
  notes: string;
  processedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const EmdLedgerSchema = new Schema<IEmdLedger>(
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
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["locked", "released", "refunded", "adjusted", "forfeited"],
    },
    paymentSubmissionId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentSubmission",
    },
    refundId: {
      type: Schema.Types.ObjectId,
      ref: "Refund",
    },
    notes: {
      type: String,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

EmdLedgerSchema.index({ userId: 1 });
EmdLedgerSchema.index({ auctionId: 1 });
EmdLedgerSchema.index({ type: 1 });
EmdLedgerSchema.index({ userId: 1, auctionId: 1 });

const EmdLedger: Model<IEmdLedger> =
  mongoose.models.EmdLedger ||
  mongoose.model<IEmdLedger>("EmdLedger", EmdLedgerSchema);

export default EmdLedger;
