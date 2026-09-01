import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";
import { requireAdmin } from "@/lib/rbac";
import { getClientIp } from "@/lib/api";
import { writeAuditLog } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const guard = await requireAdmin(request, "audit")();
    if ("error" in guard) return guard.error;

    const { searchParams } = new URL(request.url);
    const actorId = searchParams.get("actorId");
    const action = searchParams.get("action");
    const eventType = searchParams.get("eventType");
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const query: Record<string, unknown> = {};
    if (actorId) query.actorId = actorId;
    if (action) query.action = action;
    if (eventType) query.eventType = eventType;
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;
    if (from || to) {
      const range: Record<string, Date> = {};
      if (from) range.$gte = new Date(from);
      if (to) range.$lte = new Date(to);
      query.serverTimestamp = range;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ serverTimestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    await writeAuditLog({
      eventType: "audit.view",
      actorId: guard.context.userId,
      actorRole: guard.context.role,
      action: "view_audit_logs",
      entityType: "user",
      entityId: guard.context.userId,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "",
      reason: "Admin viewed audit logs",
    });

    return NextResponse.json({
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("List audit logs error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
