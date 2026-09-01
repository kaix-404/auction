export const runtime = "nodejs";

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBid extends Document {
  auctionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  timestamp: Date;
  previousBidAmount?: number;
  currentHighestBidAfter?: number;
  status: string;
  rejectReason?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const BidSchema = new Schema<IBid>(
  {
    auctionId: {
      type: Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    previousBidAmount: {
      type: Number,
    },
    currentHighestBidAfter: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["accepted", "rejected"],
      default: "accepted",
    },
    rejectReason: {
      type: String,
      trim: true,
    },
    requestId: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

BidSchema.index({ auctionId: 1, amount: -1 });
BidSchema.index({ auctionId: 1, timestamp: -1 });
BidSchema.index({ userId: 1, auctionId: 1 });
BidSchema.index({ requestId: 1 }, { unique: true, sparse: true });
BidSchema.index({ status: 1 });

const Bid: Model<IBid> = mongoose.models.Bid || mongoose.model<IBid>("Bid", BidSchema);

export default Bid;
