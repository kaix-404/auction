import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { verifyOtpSchema } from "@/lib/validations";
import { verifyOtp as validateOtp, removeOtp } from "@/lib/otp";
import { writeAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { identifier, otp, purpose } = parsed.data;

    const user = identifier.includes("@")
      ? await User.findOne({ email: identifier.toLowerCase() })
      : await User.findOne({ mobile: identifier });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await validateOtp(identifier, otp);
    if (!valid) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    await removeOtp(identifier);

    if (purpose === "registration") {
      if (user.email === identifier.toLowerCase()) user.isEmailVerified = true;
      if (user.mobile === identifier) user.isMobileVerified = true;

      if (user.isEmailVerified || user.isMobileVerified) {
        user.status = "active";
      }
      await user.save();

      await writeAuditLog({
        eventType: "user.verify_otp",
        actorId: user._id.toString(),
        actorRole: "user",
        action: "verify_otp",
        entityType: "user",
        entityId: user._id.toString(),
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || "",
        reason: "OTP verified for registration",
      });
    }

    return NextResponse.json({
      message: "OTP verified successfully",
      user: {
        id: user._id.toString(),
        email: user.email,
        mobile: user.mobile,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileVerified,
      },
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
