import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Auction from "@/models/Auction";
import Payment from "@/models/Payment";
import PaymentSubmission from "@/models/PaymentSubmission";
import ShippingAddress from "@/models/ShippingAddress";
import { getAuthContext, getClientIp } from "@/lib/api";
import { requireAdmin } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";
import { writeFinancialLedger } from "@/lib/ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const context = await getAuthContext(request);
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query: Record<string, unknown> = { winnerId: context.userId };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate("auctionId", "title")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("List orders error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const context = await getAuthContext(request);
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { auctionId, balancePaymentId, addressId } = body;

    if (!auctionId || !addressId) {
      return NextResponse.json({ error: "auctionId and addressId are required" }, { status: 400 });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) return NextResponse.json({ error: "Auction not found" }, { status: 404 });

    if (String(auction.winner) !== context.userId) {
      return NextResponse.json({ error: "Only the winner can create an order" }, { status: 403 });
    }

    const address = await ShippingAddress.findOne({ _id: addressId, userId: context.userId });
    if (!address) return NextResponse.json({ error: "Address not found" }, { status: 404 });

    let balanceVerified = false;
    if (balancePaymentId) {
      const balPayment = await Payment.findOne({ _id: balancePaymentId, userId: context.userId });
      balanceVerified = balPayment?.status === "verified";
    }

    if (!balanceVerified) {
      return NextResponse.json({ error: "Balance payment must be verified before creating order" }, { status: 400 });
    }

    const emdAdjusted = await getEmdAdjusted(auction, context.userId);
    const balanceDue = auction.currentBidAmount - emdAdjusted;

    const order = await Order.create({
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      auctionId,
      winnerId: context.userId,
      winningBidAmount: auction.currentBidAmount,
      emdAdjusted,
      balanceDue,
      balancePaid: balanceVerified ? balanceDue : 0,
      shippingAddressSnapshot: {
        name: address.name,
        mobile: address.mobile,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        locality: address.locality,
        city: address.city,
        state: address.state,
        pin: address.pin,
        landmark: address.landmark,
        deliveryInstructions: address.deliveryInstructions,
      },
      status: "paid",
    });

    auction.status = "completed";
    await auction.save();

    await writeFinancialLedger({
      eventType: "order_created",
      userId: context.userId,
      auctionId,
      orderId: order._id.toString(),
      amount: auction.currentBidAmount,
      status: "completed",
      notes: "Order created for winning bid",
    });

    await writeAuditLog({
      eventType: "order.create",
      actorId: context.userId,
      actorRole: context.role,
      action: "create_order",
      entityType: "order",
      entityId: order._id.toString(),
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "",
      afterValues: { amount: auction.currentBidAmount, status: "paid" },
      reason: "Order created after winning bid",
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function getEmdAdjusted(auction: { _id: string | import("mongoose").Types.ObjectId }, userId: string): Promise<number> {
  const EmdLedger = (await import("@/models/EmdLedger")).default;
  const locked = await EmdLedger.findOne({
    userId,
    auctionId: auction._id,
    type: "locked",
  });
  return locked ? locked.amount : 0;
}
