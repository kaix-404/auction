import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Session from "@/models/Session";
import { getAuthContext, getClientIp } from "@/lib/api";
import { clearAuthCookie } from "@/lib/auth-cookies";
import { writeAuditLog } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const context = await getAuthContext(request);
    if (context) {
      await Session.findByIdAndUpdate(context.sessionId, { isActive: false });

      await writeAuditLog({
        eventType: "user.logout",
        actorId: context.userId,
        actorRole: context.role,
        action: "logout",
        entityType: "user",
        entityId: context.userId,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || "",
      });
    }

    const response = NextResponse.json({ message: "Logged out" });
    clearAuthCookie(response);
    return response;
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
