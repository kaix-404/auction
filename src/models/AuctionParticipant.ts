export const runtime = "nodejs";

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuctionParticipant extends Document {
  auctionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  eligibilityStatus: string;
  participationFeePaymentId?: mongoose.Types.ObjectId;
  emdPaymentId?: mongoose.Types.ObjectId;
  balancePaymentId?: mongoose.Types.ObjectId;
  participationFeeVerified: boolean;
  emdVerified: boolean;
  balanceVerified: boolean;
  won: boolean;
  emdLocked: boolean;
  verifiedAt?: Date;
  rejectedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuctionParticipantSchema = new Schema<IAuctionParticipant>(
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
    eligibilityStatus: {
      type: String,
      enum: ["pending_eligible", "participation_paid", "emd_paid", "eligible", "rejected"],
      default: "pending_eligible",
    },
    participationFeePaymentId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentSubmission",
    },
    emdPaymentId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentSubmission",
    },
    balancePaymentId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentSubmission",
    },
    participationFeeVerified: {
      type: Boolean,
      default: false,
    },
    emdVerified: {
      type: Boolean,
      default: false,
    },
    balanceVerified: {
      type: Boolean,
      default: false,
    },
    won: {
      type: Boolean,
      default: false,
    },
    emdLocked: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
    rejectedReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

AuctionParticipantSchema.index({ auctionId: 1, userId: 1 }, { unique: true });
AuctionParticipantSchema.index({ userId: 1 });
AuctionParticipantSchema.index({ eligibilityStatus: 1 });

const AuctionParticipant: Model<IAuctionParticipant> =
  mongoose.models.AuctionParticipant ||
  mongoose.model<IAuctionParticipant>("AuctionParticipant", AuctionParticipantSchema);

export default AuctionParticipant;
