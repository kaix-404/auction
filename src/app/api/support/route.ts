import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SupportTicket from "@/models/SupportTicket";
import { getAuthContext, getClientIp } from "@/lib/api";
import { writeAuditLog } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const context = await getAuthContext(request);
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tickets = await SupportTicket.find({ userId: context.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ tickets });
  } catch (err) {
    console.error("List support tickets error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const context = await getAuthContext(request);
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { subject, category, message } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: "subject and message are required" }, { status: 400 });
    }

    const ticket = await SupportTicket.create({
      userId: context.userId,
      subject,
      category: category || "general",
      message,
      status: "open",
      priority: "medium",
      messages: [
        {
          sender: "user",
          senderId: context.userId,
          message,
        },
      ],
    });

    await writeAuditLog({
      eventType: "support.ticket_create",
      actorId: context.userId,
      actorRole: context.role,
      action: "create_ticket",
      entityType: "support_ticket",
      entityId: ticket._id.toString(),
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "",
      afterValues: { subject, category: category || "general" },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (err) {
    console.error("Create support ticket error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
