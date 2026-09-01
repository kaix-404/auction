import mongoose, { Schema, Document, Model } from "mongoose";
import { OrderStatus } from "@/types";

export const runtime = "nodejs";

export interface IOrder extends Document {
  orderNumber: string;
  auctionId: mongoose.Types.ObjectId;
  winnerId: mongoose.Types.ObjectId;
  winningBidAmount: number;
  emdAdjusted: number;
  balanceDue: number;
  balancePaid: number;
  shippingAddressSnapshot: Record<string, unknown>;
  status: OrderStatus;
  paymentDeadline: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `ORD-${y}${m}${d}-${rand}`;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      default: generateOrderNumber,
    },
    auctionId: {
      type: Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
    },
    winnerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    winningBidAmount: {
      type: Number,
      required: true,
    },
    emdAdjusted: {
      type: Number,
      default: 0,
    },
    balanceDue: {
      type: Number,
      required: true,
    },
    balancePaid: {
      type: Number,
      default: 0,
    },
    shippingAddressSnapshot: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: [
        "payment_pending",
        "partial_payment",
        "paid",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ] as OrderStatus[],
      default: "payment_pending",
    },
    paymentDeadline: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

OrderSchema.index({ winnerId: 1 });
OrderSchema.index({ auctionId: 1 });
OrderSchema.index({ status: 1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
