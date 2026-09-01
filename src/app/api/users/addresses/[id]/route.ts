import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ShippingAddress from "@/models/ShippingAddress";
import { getAuthContext, getClientIp } from "@/lib/api";
import { writeAuditLog } from "@/lib/audit";

export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const context = await getAuthContext(request);
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const address = await ShippingAddress.findOne({
      _id: id,
      userId: context.userId,
    });
    if (!address) return NextResponse.json({ error: "Address not found" }, { status: 404 });

    if (body.isDefault) {
      await ShippingAddress.updateMany({ userId: context.userId }, { isDefault: false });
    }

    const before: Record<string, unknown> = JSON.parse(JSON.stringify(address.toObject()));
    Object.assign(address, body);
    await address.save();

    await writeAuditLog({
      eventType: "user.address_update",
      actorId: context.userId,
      actorRole: context.role,
      action: "update_address",
      entityType: "user",
      entityId: context.userId,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "",
      beforeValues: before,
      afterValues: JSON.parse(JSON.stringify(address.toObject())),
    });

    return NextResponse.json(address);
  } catch (err) {
    console.error("Update address error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const context = await getAuthContext(request);
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const address = await ShippingAddress.findOne({
      _id: id,
      userId: context.userId,
    });
    if (!address) return NextResponse.json({ error: "Address not found" }, { status: 404 });

    await ShippingAddress.deleteOne({ _id: id });

    await writeAuditLog({
      eventType: "user.address_delete",
      actorId: context.userId,
      actorRole: context.role,
      action: "delete_address",
      entityType: "user",
      entityId: context.userId,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "",
    });

    return NextResponse.json({ message: "Address deleted" });
  } catch (err) {
    console.error("Delete address error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
