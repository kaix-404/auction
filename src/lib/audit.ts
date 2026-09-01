import { AuditEntityType } from "@/types";

interface AuditPayload {
  eventType: string;
  actorId: string;
  actorRole: string;
  action: string;
  entityType: AuditEntityType;
  entityId: string;
  beforeValues?: Record<string, unknown>;
  afterValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
  correlationId?: string;
}

export async function writeAuditLog(payload: AuditPayload): Promise<void> {
  try {
    const AuditLog = (await import("@/models/AuditLog")).default;
    await AuditLog.create({
      eventType: payload.eventType,
      actorId: payload.actorId,
      actorRole: payload.actorRole,
      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId,
      beforeValues: payload.beforeValues || {},
      afterValues: payload.afterValues || {},
      ipAddress: payload.ipAddress || "",
      userAgent: payload.userAgent || "",
      reason: payload.reason || "",
      correlationId: payload.correlationId || "",
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

export async function writeNotification(payload: {
  userId: string;
  type: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const Notification = (await import("@/models/Notification")).default;
    await Notification.create({
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      channels: ["email", "sms"],
      sentChannels: [],
      metadata: payload.metadata || {},
    });
  } catch (err) {
    console.error("Failed to write notification:", err);
  }
}
