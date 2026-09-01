export const runtime = "nodejs";

import mongoose, { Schema, Document, Model } from "mongoose";
import { NotificationChannel } from "@/types";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  body: string;
  channels: NotificationChannel[];
  sentChannels: string[];
  read: boolean;
  readAt: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "registration",
        "kyc_status",
        "payment_submitted",
        "payment_verified",
        "payment_rejected",
        "emd_verified",
        "eligibility",
        "bid_placed",
        "outbid",
        "auction_ending",
        "won",
        "lost",
        "winner_payment_reminder",
        "payment_received",
        "shipment",
        "refund_initiated",
        "refund_completed",
        "refund_failed",
        "account_security",
      ],
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    channels: [
      {
        type: String,
        enum: ["email", "sms", "whatsapp", "push"],
      },
    ],
    sentChannels: [{ type: String }],
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
