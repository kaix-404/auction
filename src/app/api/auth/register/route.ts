import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import UserProfile from "@/models/UserProfile";
import { registerSchema } from "@/lib/validations";
import { createOtp } from "@/lib/otp";
import { writeAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, mobile, password, fullName } = parsed.data;

    const existingEmail = await User.findOne({ email });
    const existingMobile = await User.findOne({ mobile });

    if (existingEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    if (existingMobile) {
      return NextResponse.json({ error: "Mobile number already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      mobile,
      passwordHash,
      role: "user",
      status: "pending",
    });

    await UserProfile.create({
      userId: user._id,
      firstName: fullName.split(" ")[0],
      lastName: fullName.split(" ").slice(1).join(" ") || undefined,
    });

    const otp = await createOtp(email);
    console.log(`[OTP] For ${email}: ${otp}`);

    await writeAuditLog({
      eventType: "user.register",
      actorId: user._id.toString(),
      actorRole: "user",
      action: "register",
      entityType: "user",
      entityId: user._id.toString(),
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "",
      correlationId: request.headers.get("x-correlation-id") || "",
      afterValues: { email, mobile },
    });

    return NextResponse.json(
      {
        message: "Registration successful. OTP sent for verification.",
        userId: user._id.toString(),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
