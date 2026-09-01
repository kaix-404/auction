import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import PaymentSubmission from "@/models/PaymentSubmission";
import User from "@/models/User";
import { requireAdmin } from "@/lib/rbac";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const guard = await requireAdmin(request, "payments")();
    if ("error" in guard) return guard.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      PaymentSubmission.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "email mobile")
        .populate("auctionId", "title")
        .lean(),
      PaymentSubmission.countDocuments(query),
    ]);

    return NextResponse.json({
      submissions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Admin list payments error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
