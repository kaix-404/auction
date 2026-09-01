import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";
import PaymentSubmission from "@/models/PaymentSubmission";
import Auction from "@/models/Auction";
import AuctionParticipant from "@/models/AuctionParticipant";
import { getAuthContext, getClientIp } from "@/lib/api";
import { writeAuditLog, writeNotification } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const context = await getAuthContext(request);
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const auctionId = searchParams.get("auctionId");

    const query: Record<string, unknown> = { userId: context.userId };
    if (auctionId) query.auctionId = auctionId;

    const payments = await Payment.find(query)
      .populate("auctionId", "title")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ payments });
  } catch (err) {
    console.error("List payments error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const context = await getAuthContext(request);
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { auctionId, type, utr, amount, paymentDate, method, proofUrl, notes } = body;

    if (!auctionId || !type || !utr || !amount || !paymentDate || !method) {
      return NextResponse.json(
        { error: "auctionId, type, utr, amount, paymentDate, method are required" },
        { status: 400 }
      );
    }

    if (!["participation_fee", "emd", "balance"].includes(type)) {
      return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) return NextResponse.json({ error: "Auction not found" }, { status: 404 });

    let expectedAmount: number;
    if (type === "participation_fee") {
      expectedAmount = auction.participationFee;
    } else if (type === "emd") {
      expectedAmount = auction.emdAmount;
    } else {
      if (type === "balance" && String(auction.winner) !== context.userId) {
        return NextResponse.json({ error: "Only the winner can submit a balance payment" }, { status: 403 });
      }
      const emdAdjusted = await getEmdAdjusted(auction, context.userId);
      expectedAmount = auction.currentBidAmount - emdAdjusted;
      if (expectedAmount <= 0) {
        return NextResponse.json(
          { error: "EMD already covers the winning bid; no balance due" },
          { status: 400 }
        );
      }
    }

    if (Number(amount) < Number(expectedAmount)) {
      return NextResponse.json(
        {
          error: `Amount below required ${
            type === "participation_fee" ? "participation fee" : type === "emd" ? "EMD" : "balance"
          }`,
        },
        { status: 400 }
      );
    }

    const payment = await Payment.create({
      userId: context.userId,
      auctionId,
      type,
      amount,
      status: "pending",
      gstComponent: type === "participation_fee" ? calculateGst(Number(amount)) : 0,
    });

    const submission = await PaymentSubmission.create({
      userId: context.userId,
      auctionId,
      paymentId: payment._id,
      utr,
      amount,
      paymentDate,
      method,
      proofUrl,
      notes,
      status: "submitted",
    });

    let participant = await AuctionParticipant.findOne({ auctionId, userId: context.userId });
    if (!participant) {
      participant = await AuctionParticipant.create({
        auctionId,
        userId: context.userId,
        eligibilityStatus: "pending_eligible",
      });
    }

    if (type === "participation_fee" && !participant.participationFeePaymentId) {
      participant.participationFeePaymentId = submission._id;
      await participant.save();
    }
    if (type === "emd" && !participant.emdPaymentId) {
      participant.emdPaymentId = submission._id;
      await participant.save();
    }
    if (type === "balance") {
      participant.balancePaymentId = submission._id;
      await participant.save();
    }

    await writeAuditLog({
      eventType: "payment.submission",
      actorId: context.userId,
      actorRole: context.role,
      action: "submit_payment",
      entityType: "payment",
      entityId: payment._id.toString(),
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "",
      afterValues: { type, amount, utr, method },
    });

    await writeNotification({
      userId: context.userId,
      type: "payment_submitted",
      title: "Payment submitted",
      body: `Your ${type.replace("_", " ")} payment of ₹${amount} is under review.`,
      metadata: { auctionId, paymentId: payment._id.toString() },
    });

    return NextResponse.json({ payment, submission }, { status: 201 });
  } catch (err) {
    console.error("Submit payment error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function calculateGst(amount: number): number {
  try {
    return Math.round(amount * 0.18 * 100) / 100;
  } catch {
    return 0;
  }
}

async function getEmdAdjusted(
  auction: { _id: string | import("mongoose").Types.ObjectId },
  userId: string
): Promise<number> {
  const EmdLedger = (await import("@/models/EmdLedger")).default;
  const locked = await EmdLedger.findOne({
    userId,
    auctionId: auction._id,
    type: "locked",
  });
  return locked ? locked.amount : 0;
}
