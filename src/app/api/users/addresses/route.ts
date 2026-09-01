import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ShippingAddress from "@/models/ShippingAddress";
import { getAuthContext, getClientIp } from "@/lib/api";
import { writeAuditLog } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const context = await getAuthContext(request);
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const addresses = await ShippingAddress.find({ userId: context.userId }).lean();
    return NextResponse.json({ addresses });
  } catch (err) {
    console.error("List addresses error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const context = await getAuthContext(request);
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const required = ["name", "mobile", "addressLine1", "city", "state", "pin"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `Field '${field}' is required` }, { status: 400 });
      }
    }

    if (body.isDefault) {
      await ShippingAddress.updateMany({ userId: context.userId }, { isDefault: false });
    }

    const address = await ShippingAddress.create({
      ...body,
      userId: context.userId,
      isDefault: body.isDefault || false,
    });

    await writeAuditLog({
      eventType: "user.address_create",
      actorId: context.userId,
      actorRole: context.role,
      action: "create_address",
      entityType: "user",
      entityId: context.userId,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "",
      afterValues: { addressId: address._id.toString(), city: body.city, pin: body.pin },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (err) {
    console.error("Create address error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
