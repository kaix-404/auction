export const runtime = "nodejs";

import mongoose, { Schema, Document, Model } from "mongoose";
import { TicketStatus, TicketPriority } from "@/types";

export interface ITicketMessage {
  sender: "user" | "admin";
  senderId: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
}

export interface ISupportTicket extends Document {
  ticketNumber: string;
  userId: mongoose.Types.ObjectId;
  subject: string;
  message: string;
  category: "general" | "payment" | "auction" | "shipping" | "refund" | "technical" | "other";
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: mongoose.Types.ObjectId;
  assignedAt: Date;
  messages: ITicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

async function generateTicketNumber(): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "TKT-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const TicketMessageSubSchema = new Schema<ITicketMessage>(
  {
    sender: { type: String, enum: ["user", "admin"], required: true },
    senderId: { type: Schema.Types.ObjectId, required: true, refPath: "sender" },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketNumber: { type: String, unique: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    category: {
      type: String,
      enum: ["general", "payment", "auction", "shipping", "refund", "technical", "other"],
      default: "general",
    },
    status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open" },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    assignedAt: { type: Date },
    messages: [TicketMessageSubSchema],
  },
  { timestamps: true }
);

SupportTicketSchema.index({ ticketNumber: 1 }, { unique: true });
SupportTicketSchema.index({ userId: 1 });
SupportTicketSchema.index({ status: 1 });
SupportTicketSchema.index({ assignedTo: 1 });

SupportTicketSchema.pre<ISupportTicket>("validate", async function () {
  if (!this.ticketNumber) {
    this.ticketNumber = await generateTicketNumber();
  }
});

const SupportTicket: Model<ISupportTicket> =
  mongoose.models.SupportTicket ||
  mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);

export default SupportTicket;
