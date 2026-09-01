import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Session from "@/models/Session";
import { loginSchema } from "@/lib/validations";
import { createOtp } from "@/lib/otp";
import { signToken } from "@/lib/auth";
import { setAuthCookie } from "@/lib/auth-cookies";
import { writeAuditLog } from "@/lib/audit";
import { getClientIp, getCookieValue } from "@/lib/api";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { identifier, password } = parsed.data;
    const isEmail = identifier.includes("@");

    const user = isEmail
      ? await User.findOne({ email: identifier.toLowerCase() }).select("+passwordHash")
      : await User.findOne({ mobile: identifier }).select("+passwordHash");

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.status === "blocked" || user.status === "suspended") {
      return NextResponse.json(
        { error: `Account ${user.status}. Please contact support.` },
        { status: 403 }
      );
    }

    const session = await Session.create({
      userId: user._id,
      token: uuidv4(),
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "",
      isActive: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    });

    const token = await signToken({
      userId: user._id.toString(),
      role: user.role,
      sessionId: session._id.toString(),
      email: user.email,
    });

    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    const response = NextResponse.json({
      message: "Login successful",
      token: token,
      user: {
        id: user._id.toString(),
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
      },
    });

    setAuthCookie(response, token);

    await writeAuditLog({
      eventType: "user.login",
      actorId: user._id.toString(),
      actorRole: user.role,
      action: "login",
      entityType: "user",
      entityId: user._id.toString(),
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "",
      correlationId: request.headers.get("x-correlation-id") || "",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
