import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/rbac";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const guard = await requireAdmin(request, "orders")();
    if ("error" in guard) return guard.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("winnerId", "email mobile")
        .populate("auctionId", "title")
        .lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Admin list orders error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
