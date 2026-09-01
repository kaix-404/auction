import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Bid from "@/models/Bid";
import { getAuthContext, getClientIp } from "@/lib/api";
import { placeBid } from "@/lib/auction-engine";
import { bidSchema } from "@/lib/validations";
import { writeAuditLog, writeNotification } from "@/lib/audit";
import { publishAuctionEvent } from "@/lib/realtime";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const context = await getAuthContext(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = bidSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const requestId =
      parsed.data.requestId || `${context.sessionId}-${Date.now()}`;

    const result = await placeBid({
      auctionId: parsed.data.auctionId,
      userId: context.userId,
      amount: parsed.data.amount,
      requestId,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "",
    });

    await writeAuditLog({
      eventType: result.success ? "bid.accepted" : "bid.rejected",
      actorId: context.userId,
      actorRole: context.role,
      action: result.success ? "place_bid" : "reject_bid",
      entityType: "bid",
      entityId: parsed.data.auctionId,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "",
      afterValues: { amount: parsed.data.amount },
      reason: result.success ? undefined : result.reason,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.reason || "Bid rejected", ...result },
        { status: 400 }
      );
    }

    await writeNotification({
      userId: context.userId,
      type: "bid_placed",
      title: "Bid placed",
      body: `Your bid of ₹${parsed.data.amount} was placed successfully.`,
      metadata: { auctionId: parsed.data.auctionId, bidId: result.bid!.id },
    });

    await publishAuctionEvent({
      auctionId: parsed.data.auctionId,
      event: "bid-update",
      data: {
        currentBidAmount: result.bid!.currentHighestBidAfter,
        currentHighestBidder: context.userId,
        bid: result.bid,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("Place bid error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const auctionId = searchParams.get("auctionId");
    const userId = searchParams.get("userId");

    const query: Record<string, unknown> = {};
    if (auctionId) query.auctionId = auctionId;
    if (userId) query.userId = userId;

    const bids = await Bid.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(searchParams.get("limit") || 100))
      .populate("userId", "email mobile")
      .lean();

    return NextResponse.json({ bids });
  } catch (err) {
    console.error("List bids error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
