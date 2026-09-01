import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import UserProfile from "@/models/UserProfile";
import KycRecord from "@/models/KycRecord";
import { requireAdmin } from "@/lib/rbac";
import { getClientIp } from "@/lib/api";
import { writeAuditLog } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const guard = await requireAdmin(request, "users")();
    if ("error" in guard) return guard.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      users: users.map((u) => ({
        ...u,
        passwordHash: undefined,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Admin list users error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
