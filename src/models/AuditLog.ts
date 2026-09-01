export const runtime = "nodejs";

import mongoose, { Schema, Document, Model } from "mongoose";
import { AuditEntityType } from "@/types";

export interface IAuditLog extends Document {
  eventId: string;
  eventType: string;
  actorId: mongoose.Types.ObjectId;
  actorRole: string;
  action: string;
  entityType: AuditEntityType;
  entityId: string;
  beforeValues: Record<string, unknown>;
  afterValues: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  serverTimestamp: Date;
  correlationId: string;
  reason: string;
  createdAt: Date;
}

async function generateEventId(): Promise<string> {
  const timestamp = Date.now().toString(36);
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let random = "";
  for (let i = 0; i < 8; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EVT-${timestamp}-${random}`;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    eventId: { type: String, unique: true, required: true },
    eventType: { type: String, required: true },
    actorId: { type: Schema.Types.ObjectId, required: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true },
    entityType: {
      type: String,
      required: true,
      enum: [
        "user",
        "auction",
        "bid",
        "payment",
        "order",
        "refund",
        "product",
        "inventory",
        "emd",
        "bank_account",
        "kyc",
        "shipment",
        "notification",
        "support_ticket",
        "admin_user",
        "role_permission",
        "system_setting",
        "fraud_flag",
      ],
    },
    entityId: { type: String, required: true },
    beforeValues: { type: Schema.Types.Mixed, default: null },
    afterValues: { type: Schema.Types.Mixed, default: null },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    serverTimestamp: { type: Date, default: Date.now },
    correlationId: { type: String, default: "" },
    reason: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ actorId: 1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ eventType: 1 });
AuditLogSchema.index({ serverTimestamp: -1 });
AuditLogSchema.index({ correlationId: 1 });
AuditLogSchema.index({ action: 1 });

AuditLogSchema.pre<IAuditLog>("validate", async function () {
  if (!this.eventId) {
    this.eventId = await generateEventId();
  }
});

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
