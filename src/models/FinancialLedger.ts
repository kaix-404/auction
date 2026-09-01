import mongoose, { Schema, Document, Model } from "mongoose";
import { FinancialEventType } from "@/types";

export const runtime = "nodejs";

export interface IFinancialLedger extends Document {
  entryId: string;
  eventType: FinancialEventType;
  userId: mongoose.Types.ObjectId;
  auctionId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  amount: number;
  gstComponent: number;
  status: string;
  referenceId: mongoose.Types.ObjectId;
  sourceTransactionId: string;
  notes: string;
  createdAt: Date;
}

function generateEntryId(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `FIN-${y}${m}${d}-${suffix}`;
}

const FinancialLedgerSchema = new Schema<IFinancialLedger>(
  {
    entryId: {
      type: String,
      required: true,
      unique: true,
      default: generateEntryId,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        "participation_fee",
        "participation_fee_gst",
        "emd_received",
        "emd_locked",
        "emd_released",
        "emd_refunded",
        "emd_adjusted",
        "emd_forfeited",
        "winner_balance_payable",
        "winner_balance_received",
        "order_created",
        "refund",
        "reversal",
        "adjustment",
      ] as FinancialEventType[],
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
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      refPath: "referenceModel",
    },
    sourceTransactionId: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

FinancialLedgerSchema.index({ eventType: 1 });
FinancialLedgerSchema.index({ userId: 1 });
FinancialLedgerSchema.index({ auctionId: 1 });
FinancialLedgerSchema.index({ orderId: 1 });
FinancialLedgerSchema.index({ createdAt: 1 });
FinancialLedgerSchema.index({ userId: 1, auctionId: 1 });

const FinancialLedger: Model<IFinancialLedger> =
  mongoose.models.FinancialLedger ||
  mongoose.model<IFinancialLedger>("FinancialLedger", FinancialLedgerSchema);

export default FinancialLedger;
