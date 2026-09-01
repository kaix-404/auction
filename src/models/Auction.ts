export const runtime = "nodejs";

import mongoose, { Schema, Document, Model } from "mongoose";
import { AuctionStatus } from "@/types";

export interface IAuction extends Document {
  productId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  reservePrice: number;
  bidIncrement: number;
  participationFee: number;
  emdAmount: number;
  startDate: Date;
  endDate: Date;
  status: AuctionStatus;
  currentBidAmount: number;
  currentHighestBidder?: mongoose.Types.ObjectId;
  winningBid?: mongoose.Types.ObjectId;
  winner?: mongoose.Types.ObjectId;
  participantCount: number;
  bidCount: number;
  isFeatured: boolean;
  category?: string;
  adminNotes?: string;
  cancellationReason?: string;
  cancelledBy?: mongoose.Types.ObjectId;
  extensionMinutes: number;
  originalEndDate?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AuctionSchema = new Schema<IAuction>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    reservePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    bidIncrement: {
      type: Number,
      required: true,
      min: 1,
    },
    participationFee: {
      type: Number,
      required: true,
      min: 0,
    },
    emdAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "registration_open", "live", "ended", "payment_pending", "completed", "cancelled", "defaulted", "reauctioned"],
      default: "draft",
    },
    currentBidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentHighestBidder: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    winningBid: {
      type: Schema.Types.ObjectId,
      ref: "Bid",
    },
    winner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    participantCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bidCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      trim: true,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
    },
    extensionMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    originalEndDate: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

AuctionSchema.index({ status: 1 });
AuctionSchema.index({ endDate: 1 });
AuctionSchema.index({ status: 1, endDate: 1 });
AuctionSchema.index({ productId: 1 });
AuctionSchema.index({ isFeatured: 1 });
AuctionSchema.index({ createdBy: 1 });

const Auction: Model<IAuction> =
  mongoose.models.Auction || mongoose.model<IAuction>("Auction", AuctionSchema);

export default Auction;
