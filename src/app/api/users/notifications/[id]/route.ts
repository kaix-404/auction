import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getAuthContext } from "@/lib/api";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const context = await getAuthContext(request);
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const notification = await Notification.findOne({
      _id: id,
      userId: context.userId,
    });
    if (!notification) return NextResponse.json({ error: "Notification not found" }, { status: 404 });

    if (body.read !== undefined) {
      notification.read = body.read;
      notification.readAt = new Date();
      await notification.save();
    }

    return NextResponse.json({ notification });
  } catch (err) {
    console.error("Update notification error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
