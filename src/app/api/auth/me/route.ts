import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import UserProfile from "@/models/UserProfile";
import { getAuthContext } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const context = await getAuthContext(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(context.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = await UserProfile.findOne({ userId: user._id });

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        profile: profile
          ? {
              firstName: profile.firstName,
              lastName: profile.lastName,
              avatar: profile.avatar || null,
              dateOfBirth: profile.dateOfBirth || null,
              gender: profile.gender || null,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("Me error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
