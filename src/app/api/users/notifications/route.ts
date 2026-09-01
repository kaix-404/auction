import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getAuthContext } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const context = await getAuthContext(request);
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") || 50);

    const notifications = await Notification.find({ userId: context.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ notifications });
  } catch (err) {
    console.error("List notifications error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
