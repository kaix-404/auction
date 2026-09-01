import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/rbac";
import { getClientIp } from "@/lib/api";
import { writeAuditLog, writeNotification } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const guard = await requireAdmin(request, "users")();
    if ("error" in guard) return guard.error;

    const { id } = await params;
    const body = await request.json();
    const { status, reason } = body;

    const allowed = ["active", "restricted", "suspended", "blocked"];
    if (!status || !allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (["restricted", "suspended", "blocked"].includes(status) && !reason) {
      return NextResponse.json({ error: "Reason required for restriction actions" }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const before = user.status;
    user.status = status;
    await user.save();

    await writeAuditLog({
      eventType: "admin.user_status_change",
      actorId: guard.context.userId,
      actorRole: guard.context.role,
      action: `change_user_status_to_${status}`,
      entityType: "user",
      entityId: id,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "",
      beforeValues: { status: before },
      afterValues: { status },
      reason,
    });

    await writeNotification({
      userId: id,
      type: "account_security",
      title: "Account status updated",
      body: `Your account status was changed to ${status}. ${reason ? `Reason: ${reason}` : ""}`,
    });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Admin update user error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
